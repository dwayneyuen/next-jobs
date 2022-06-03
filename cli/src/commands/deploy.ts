import { JobQueue, RepeatableJob } from "@dwayneyuen/next-jobs";
import { Logger } from "@nestjs/common";
import { Command, CommandRunner } from "nest-commander";
import { glob } from "glob";
import * as ts from "typescript";
import { dirname, join, parse, relative } from "path";
import { ApolloClient, gql, NormalizedCacheObject } from "@apollo/client";
import * as dotenv from "dotenv";

dotenv.config();

/**
 * Parse the source file and detect when its default export is RepeatableJob,
 * JobQueue, or neither
 *
 * @param sourceFile
 */
export const parseFile = (
  sourceFile: ts.SourceFile,
):
  | null
  | {
      type: "JobQueue";
    }
  | {
      schedule: string;
      type: "RepeatableJob";
    } => {
  let result = null;
  const repeatableJobDeclarations = new Map<string, string>();
  const jobQueueDeclarations = new Set();
  ts.forEachChild(sourceFile, (node) => {
    Logger.debug(`node.kind: ${node.kind}`);
    if (ts.isVariableStatement(node)) {
      for (const declaration of node.declarationList.declarations) {
        if (ts.isVariableDeclaration(declaration)) {
          if (ts.isCallExpression(declaration.initializer)) {
            if (ts.isIdentifier(declaration.initializer.expression)) {
              if (
                declaration.initializer.expression.escapedText ===
                RepeatableJob.name
              ) {
                Logger.debug(`declaration: ${JSON.stringify(declaration)}`);
                if (ts.isIdentifier(declaration.name)) {
                  if (declaration.initializer.arguments.length > 0) {
                    if (
                      ts.isStringLiteral(declaration.initializer.arguments[0])
                    ) {
                      repeatableJobDeclarations.set(
                        declaration.name.escapedText.toString(),
                        declaration.initializer.arguments[0].text,
                      );
                    }
                  }
                }
              } else if (
                declaration.initializer.expression.escapedText === JobQueue.name
              ) {
                if (ts.isIdentifier(declaration.name)) {
                  jobQueueDeclarations.add(declaration.name.escapedText);
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
          if (node.expression.expression.escapedText === RepeatableJob.name) {
            Logger.debug(
              `expression: ${JSON.stringify(node.expression.expression)}`,
            );
            if (node.expression.arguments.length > 0) {
              if (ts.isStringLiteral(node.expression.arguments[0])) {
                result = {
                  type: RepeatableJob.name,
                  schedule: node.expression.arguments[0].text,
                };
              }
            }
          } else if (node.expression.expression.escapedText === JobQueue.name) {
            result = { type: JobQueue.name };
          }
        }
      } else if (ts.isIdentifier(node.expression)) {
        // Default export declared earlier, match escapedText to previous declaration
        if (jobQueueDeclarations.has(node.expression.escapedText)) {
          result = { type: JobQueue.name };
        } else if (
          repeatableJobDeclarations.has(node.expression.escapedText.toString())
        ) {
          result = {
            type: RepeatableJob.name,
            schedule: repeatableJobDeclarations.get(
              node.expression.escapedText.toString(),
            ),
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
      if (result?.type === "RepeatableJob") {
        const name = parse(file).name;
        const schedule = result.schedule;
        const path = join(relative(baseDirectory, dirname(file)), name);
        Logger.debug(
          `Found scheduled job: name: ${name}, path: ${path}, schedule: ${schedule}`,
        );
        scheduledJobs.push({ name, path, schedule });
      } else if (result?.type === "JobQueue") {
        const name = parse(file).name;
        const path = join(relative(baseDirectory, dirname(file)), name);
        Logger.debug(`Found queue: ${name}, path: ${path}`);
        queues.push({ name, path });
      }
    }
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
