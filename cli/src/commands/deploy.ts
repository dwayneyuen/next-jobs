import { JobQueue, RepeatableJob } from "@dwayneyuen/next-jobs";
import { Logger } from "@nestjs/common";
import { Command, CommandRunner } from "nest-commander";
import { glob } from "glob";
import * as ts from "typescript";
import { parse, relative } from "path";
import apolloClient from "src/apollo-client";
import { gql } from "@apollo/client";
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
  Logger.debug(`result? ${JSON.stringify(result)}`);
  return result;
};

@Command({
  arguments: "<path>",
  name: "deploy",
  description: "deploy application",
})
export class DeployCommand implements CommandRunner {
  run(passedParams: string[], _options?: Record<string, any>): Promise<void> {
    if (passedParams.length < 0) {
      Logger.warn("No deploy path!");
    }
    const baseDirectory = `${passedParams[0]}/pages/api/jobs`;
    glob(`${baseDirectory}/**/*.+(ts|js)`, async (err, files) => {
      const program = ts.createProgram({
        options: { allowJs: true },
        rootNames: files,
      });
      for (const file of files) {
        const sourceFile = program.getSourceFile(file);
        const result = parseFile(sourceFile);
        const baseDirectory = `${passedParams[0]}/pages/api/jobs`;
        if (result?.type === "JobQueue") {
          await apolloClient.mutate({
            mutation: gql`
              mutation createQueue(
                $accessToken: String!
                $name: String!
                $path: String!
              ) {
                createQueue(
                  accessToken: $accessToken
                  name: $name
                  path: $path
                ) {
                  result
                }
              }
            `,
            variables: {
              accessToken: process.env.NEXT_JOBS_ACCESS_TOKEN,
              name: parse(file).name,
              path: relative(baseDirectory, file),
            },
          });
        } else if (result?.type === "RepeatableJob") {
        }
      }
    });
    return Promise.resolve(undefined);
  }
}
