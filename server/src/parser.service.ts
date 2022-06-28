import { dirname, join, parse, relative } from "path";
import { Injectable, Logger } from "@nestjs/common";
import { glob } from "glob";
import * as ts from "typescript";
import { JobQueue, ScheduledJob } from "@dwayneyuen/next-jobs";
import { Queue } from "bullmq";
import IORedis from "ioredis";
import { getCronQueueKey, getJobQueueKey, getJobQueuePathKey } from "src/utils";
import { EnvironmentVariables } from "src/environment-variables";

/**
 * Walk the pages directories and look for jobs and register them
 *
 * Used when running the server locally during development
 */
@Injectable()
export class ParserService {
  constructor(
    private environmentVariables: EnvironmentVariables,
    private ioRedis: IORedis,
  ) {}

  private logger = new Logger(ParserService.name);

  /**
   * Parse the source file and detect when its default export is ScheduledJob,
   * JobQueue, or neither
   *
   * @param sourceFile
   */
  private parseFile = (
    sourceFile: ts.SourceFile,
  ):
    | null
    | {
        type: "JobQueue";
      }
    | {
        schedule: string;
        type: "ScheduledJob";
      } => {
    let result = null;
    const scheduledJobDeclarations = new Map<string, string>();
    const queueDeclarations = new Map<string, string>();
    ts.forEachChild(sourceFile, (node) => {
      this.logger.debug(`node.kind: ${node.kind}`);
      if (ts.isVariableStatement(node)) {
        for (const declaration of node.declarationList.declarations) {
          if (ts.isVariableDeclaration(declaration)) {
            if (ts.isCallExpression(declaration.initializer)) {
              if (ts.isIdentifier(declaration.initializer.expression)) {
                if (ts.isIdentifier(declaration.name)) {
                  if (declaration.initializer.arguments.length > 0) {
                    if (
                      ts.isStringLiteral(declaration.initializer.arguments[0])
                    ) {
                      if (
                        declaration.initializer.expression.escapedText ===
                        ScheduledJob.name
                      ) {
                        scheduledJobDeclarations.set(
                          declaration.name.escapedText.toString(),
                          declaration.initializer.arguments[0].text,
                        );
                      } else if (
                        declaration.initializer.expression.escapedText ===
                        JobQueue.name
                      ) {
                        queueDeclarations.set(
                          declaration.name.escapedText.toString(),
                          declaration.initializer.arguments[0].text,
                        );
                      }
                    }
                  }
                }
              }
            }
          }
        }
      } else if (ts.isExportAssignment(node)) {
        if (ts.isCallExpression(node.expression)) {
          // Default export declared inline
          if (ts.isIdentifier(node.expression.expression)) {
            if (node.expression.arguments.length > 0) {
              if (ts.isStringLiteral(node.expression.arguments[0])) {
                if (
                  node.expression.expression.escapedText === ScheduledJob.name
                ) {
                  result = {
                    type: ScheduledJob.name,
                    schedule: node.expression.arguments[0].text,
                  };
                } else if (
                  node.expression.expression.escapedText === JobQueue.name
                ) {
                  result = {
                    type: JobQueue.name,
                    schedule: node.expression.arguments[0].text,
                  };
                }
              }
            }
          }
        } else if (ts.isIdentifier(node.expression)) {
          // Default export declared earlier, match escapedText to previous declaration
          const exportName = node.expression.escapedText.toString();
          if (queueDeclarations.has(exportName)) {
            result = {
              name: queueDeclarations.get(exportName),
              type: JobQueue.name,
            };
          } else if (scheduledJobDeclarations.has(exportName)) {
            result = {
              type: ScheduledJob.name,
              schedule: scheduledJobDeclarations.get(exportName),
            };
          }
        }
      }
    });
    return result;
  };

  async parse(pagesDir: string): Promise<void> {
    // TODO: Refactor into some common module
    const baseDirectory = `${process.cwd()}/${pagesDir}/api`;
    const scheduledJobs: { name: string; path: string; schedule: string }[] =
      [];
    const queues: { name: string; path: string }[] = [];
    const files = glob.sync(`${baseDirectory}/**/*.+(ts|js)`);
    const program = ts.createProgram({
      options: { allowJs: true },
      rootNames: files,
    });
    for (const file of files) {
      const sourceFile = program.getSourceFile(file);
      const result = this.parseFile(sourceFile);
      if (result?.type === "ScheduledJob") {
        const name = parse(file).name;
        const schedule = result.schedule;
        const path = join("api", relative(baseDirectory, dirname(file)), name);
        this.logger.debug(
          `Found scheduled job: name: ${name}, path: ${path}, schedule: ${schedule}`,
        );
        scheduledJobs.push({ name, path, schedule });
      } else if (result?.type === "JobQueue") {
        const name = parse(file).name;
        const path = join("api", relative(baseDirectory, dirname(file)), name);
        this.logger.debug(`Found queue: ${name}, path: ${path}`);
        queues.push({ name, path });
      }
    }
    // TODO: Throw an error if duplicate scheduled job or queue name
    this.logger.debug(
      `Creating scheduled jobs: ${JSON.stringify(scheduledJobs)}`,
    );
    const scheduledJobsQueue = new Queue(
      getCronQueueKey(this.environmentVariables.NEXT_CRON_ACCESS_TOKEN),
      {
        connection: this.ioRedis,
      },
    );
    const repeatableJobs = await scheduledJobsQueue.getRepeatableJobs();
    for (const repeatableJob of repeatableJobs) {
      await scheduledJobsQueue.removeRepeatableByKey(repeatableJob.key);
    }
    if (scheduledJobs.length > 0) {
      for (const scheduledJob of scheduledJobs) {
        this.logger.debug(
          `Adding scheduled job: ${JSON.stringify(scheduledJob)}`,
        );
        await scheduledJobsQueue.add(
          scheduledJob.name,
          { path: scheduledJob.path },
          { repeat: { cron: scheduledJob.schedule } },
        );
      }
    }
    this.logger.debug(`Creating queues: ${JSON.stringify(queues)}`);
    // We store all queue names in a redis set, and store a key-value pair
    // for each queue name, mapping queue name to queue path
    const jobQueueKey = getJobQueueKey(
      this.environmentVariables.NEXT_CRON_ACCESS_TOKEN,
    );
    const existingQueues = await this.ioRedis.smembers(jobQueueKey);
    for (const queue of existingQueues) {
      await this.ioRedis.del(
        getJobQueuePathKey(
          this.environmentVariables.NEXT_CRON_ACCESS_TOKEN,
          queue,
        ),
      );
      await this.ioRedis.srem(jobQueueKey, queue);
    }
    if (queues.length > 0) {
      for (const queue of queues) {
        this.logger.debug(`Adding queue: ${JSON.stringify(queue)}`);
        await this.ioRedis.sadd(jobQueueKey, queue.name);
        await this.ioRedis.set(
          getJobQueuePathKey(
            this.environmentVariables.NEXT_CRON_ACCESS_TOKEN,
            queue.name,
          ),
          queue.path,
        );
      }
    }
    return Promise.resolve(undefined);
  }
}
