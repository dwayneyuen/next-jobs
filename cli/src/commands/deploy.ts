import { dirname, join, parse, relative } from "path";
import { CronJob, MessageQueue } from "@dwayneyuen/next-cron";
import { Logger } from "@nestjs/common";
import { Command, CommandRunner } from "nest-commander";
import { glob } from "glob";
import * as ts from "typescript";
import { ApolloClient, gql, NormalizedCacheObject } from "@apollo/client";
import * as dotenv from "dotenv";

dotenv.config();

/**
 * Parse the source file and detect when its default export is CronJob,
 * MessageQueue, or neither
 *
 * @param sourceFile
 */
export const parseFile = (
  sourceFile: ts.SourceFile,
):
  | null
  | {
      name: string;
      type: "MessageQueue";
    }
  | {
      schedule: string;
      type: "CronJob";
    } => {
  let result = null;
  const cronJobDeclarations = new Map<string, string>();
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
                      CronJob.name
                    ) {
                      cronJobDeclarations.set(
                        declaration.name.escapedText.toString(),
                        declaration.initializer.arguments[0].text,
                      );
                    } else if (
                      declaration.initializer.expression.escapedText ===
                      MessageQueue.name
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
              if (node.expression.expression.escapedText === CronJob.name) {
                result = {
                  type: CronJob.name,
                  schedule: node.expression.arguments[0].text,
                };
              } else if (
                node.expression.expression.escapedText === MessageQueue.name
              ) {
                result = {
                  type: MessageQueue.name,
                  name: node.expression.arguments[0].text,
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
            type: MessageQueue.name,
          };
        } else if (cronJobDeclarations.has(exportName)) {
          result = {
            type: CronJob.name,
            schedule: cronJobDeclarations.get(exportName),
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
    const cronJobs: { path: string; schedule: string }[] = [];
    const queues: { name: string; path: string }[] = [];
    const files = glob.sync(`${baseDirectory}/**/*.+(ts|js)`);
    const program = ts.createProgram({
      options: { allowJs: true },
      rootNames: files,
    });
    for (const file of files) {
      const sourceFile = program.getSourceFile(file);
      const result = parseFile(sourceFile);
      if (result?.type === "CronJob") {
        const name = parse(file).name;
        const schedule = result.schedule;
        const path = join(
          "api/jobs",
          relative(baseDirectory, dirname(file)),
          name,
        );
        Logger.debug(
          `Found scheduled job: path: ${path}, schedule: ${schedule}`,
        );
        cronJobs.push({ path, schedule });
      } else if (result?.type === "MessageQueue") {
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
    Logger.debug(`Creating scheduled jobs: ${JSON.stringify(cronJobs)}`);
    if (cronJobs.length > 0) {
      // TODO: Log the result
      await this.apolloClient.mutate({
        mutation: gql`
          mutation createCronJobs(
            $accessToken: String!
            $jobs: [CreateCronJobDto!]!
          ) {
            createCronJobs(accessToken: $accessToken, jobs: $jobs)
          }
        `,
        variables: {
          accessToken: process.env.NEXT_CRON_ACCESS_TOKEN,
          jobs: cronJobs,
        },
      });
    }
    Logger.debug(`Creating queues: ${JSON.stringify(queues)}`);
    if (queues.length > 0) {
      // TODO: Log the result
      await this.apolloClient.mutate({
        mutation: gql`
          mutation createMessageQueues(
            $accessToken: String!
            $queues: [CreateQueueDto!]!
          ) {
            createMessageQueues(accessToken: $accessToken, queues: $queues)
          }
        `,
        variables: {
          accessToken: process.env.NEXT_CRON_ACCESS_TOKEN,
          queues,
        },
      });
    }
    return Promise.resolve(undefined);
  }
}
