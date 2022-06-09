import { dirname, join, parse, relative } from "path";
import { JobQueue, ScheduledJob } from "@dwayneyuen/next-jobs";
import { Logger } from "@nestjs/common";
import { Command, CommandRunner } from "nest-commander";
import { glob } from "glob";
import * as ts from "typescript";
import { ApolloClient, gql, NormalizedCacheObject } from "@apollo/client";
import * as dotenv from "dotenv";

dotenv.config();

/**
 * Parse the source file and detect when its default export is ScheduledJob,
 * JobQueue, or neither
 *
 * @param sourceFile
 */
export const parseFile = (
  sourceFile: ts.SourceFile,
):
  | null
  | {
      name: string;
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
    Logger.debug(`node.kind: ${node.kind}`);
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

@Command({
  arguments: "<path>",
  name: "deploy",
  description: "deploy application",
})
export class DeployCommand implements CommandRunner {
  constructor(private apolloClient: ApolloClient<NormalizedCacheObject>) {}

  async run(
    passedParams: string[],
    _options?: Record<string, any>,
  ): Promise<void> {
    if (passedParams.length < 0) {
      Logger.error("No deploy path!");
      return;
    }
    // TODO: Also support `src/pages` as a fallback
    const baseDirectory = `${passedParams[0]}/pages/api/jobs`;
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
      const result = parseFile(sourceFile);
      if (result?.type === "ScheduledJob") {
        const name = parse(file).name;
        const schedule = result.schedule;
        const path = join(
          "api/jobs",
          relative(baseDirectory, dirname(file)),
          name,
        );
        Logger.debug(
          `Found scheduled job: name: ${name}, path: ${path}, schedule: ${schedule}`,
        );
        scheduledJobs.push({ name, path, schedule });
      } else if (result?.type === "JobQueue") {
        const name = parse(file).name;
        const path = join(
          "api/jobs",
          relative(baseDirectory, dirname(file)),
          name,
        );
        Logger.debug(`Found queue: ${name}, path: ${path}`);
        queues.push({ name, path });
      }
    }
    // TODO: Throw an error if duplicate scheduled job or queue name
    Logger.debug(`Creating scheduled jobs: ${JSON.stringify(scheduledJobs)}`);
    if (scheduledJobs.length > 0) {
      await this.apolloClient.mutate({
        mutation: gql`
          mutation createScheduledJobs(
            $accessToken: String!
            $jobs: [CreateScheduledJobDto!]!
          ) {
            createScheduledJobs(accessToken: $accessToken, jobs: $jobs)
          }
        `,
        variables: {
          accessToken: process.env.NEXT_JOBS_ACCESS_TOKEN,
          jobs: scheduledJobs,
        },
      });
    }
    Logger.debug(`Creating queues: ${JSON.stringify(queues)}`);
    if (queues.length > 0) {
      await this.apolloClient.mutate({
        mutation: gql`
          mutation createQueues(
            $accessToken: String!
            $queues: [CreateQueueDto!]!
          ) {
            createQueues(accessToken: $accessToken, queues: $queues)
          }
        `,
        variables: {
          accessToken: process.env.NEXT_JOBS_ACCESS_TOKEN,
          queues,
        },
      });
    }
    return Promise.resolve(undefined);
  }
}
