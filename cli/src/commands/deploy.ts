import { JobQueue, RepeatableJob } from "@dwayneyuen/next-jobs";
import { Logger } from "@nestjs/common";
import { Command, CommandRunner } from "nest-commander";
import { glob } from "glob";
import * as ts from "typescript";
import { Job, Repeat, RepeatOptions } from "bullmq";
import Repeatable from "./fixtures/repeatable";

const JOB_QUEUE_NAME: string = JobQueue.name;
const REPEATABLE_JOB_NAME: string = RepeatableJob.name;

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
      repeatOptions: RepeatOptions;
      type: "RepeatableJob";
    } => {
  let result = null;
  const repeatableJobDeclarations = new Set();
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
                // TODO(Dwayne)
                // - extract arguments
                // - support objects and arrays
                if (ts.isIdentifier(declaration.name)) {
                  repeatableJobDeclarations.add(declaration.name.escapedText);
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
            result = { type: RepeatableJob.name };
          } else if (node.expression.expression.escapedText === JobQueue.name) {
            // TODO(Dwayne) extract arguments
            result = { type: JobQueue.name };
          }
        }
      } else if (ts.isIdentifier(node.expression)) {
        // Default export declared earlier, match escapedText to previous declaration
        if (jobQueueDeclarations.has(node.expression.escapedText)) {
          result = { type: JobQueue.name };
        } else if (repeatableJobDeclarations.has(node.expression.escapedText)) {
          result = { type: RepeatableJob.name };
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
  description: "deploy application to quecel",
})
export class DeployCommand implements CommandRunner {
  run(passedParams: string[], _options?: Record<string, any>): Promise<void> {
    if (passedParams.length < 0) {
      Logger.warn("No deploy path!");
    }
    glob(`${passedParams[0]}/pages/api/jobs/**/*.+(ts|js)`, (err, files) => {
      const program = ts.createProgram({
        options: { allowJs: true },
        rootNames: files,
      });
      for (const file of files) {
        Logger.debug(`job? ${file}`);
        const sourceFile = program.getSourceFile(file);
        const result = parseFile(sourceFile);
        Logger.debug(`result: ${JSON.stringify(result)}`);
      }
    });
    glob(`${passedParams[0]}/pages/api/queues/**/*.+(ts|js)`, (err, files) => {
      const program = ts.createProgram({
        options: { allowJs: true },
        rootNames: files,
      });
      for (const file of files) {
        Logger.debug(`job? ${file}`);
        const sourceFile = program.getSourceFile(file);
        const result = parseFile(sourceFile);
        Logger.debug(`result: ${JSON.stringify(result)}`);
      }
    });
    return Promise.resolve(undefined);
  }
}
