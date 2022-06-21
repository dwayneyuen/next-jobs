import * as ts from "typescript";
import { parseFile } from "./deploy";

describe("parseFile", () => {
  it("Given an empty file, when calling parseFile, then should return null", () => {
    const filename = `${__dirname}/fixtures/empty.ts`;
    const program = ts.createProgram({
      options: { allowJs: true },
      rootNames: [filename],
    });
    const sourceFile = program.getSourceFile(filename);

    const result = parseFile(sourceFile);

    expect(result).toBeNull();
  });

  it("Given a MessageQueue as the default export, when calling parseFile, then should return MessageQueue", () => {
    const filename = `${__dirname}/fixtures/default-queue.ts`;
    const program = ts.createProgram({ options: {}, rootNames: [filename] });
    const sourceFile = program.getSourceFile(filename);

    const result = parseFile(sourceFile);

    expect(result.type).toEqual("MessageQueue");
    if (result.type === "MessageQueue") {
      expect(result.name).toEqual("default-queue");
    }
  });

  it("Given a MessageQueue declared and later exported as default, when calling parseFile, then should return MessageQueue", () => {
    const filename = `${__dirname}/fixtures/queue.ts`;
    const program = ts.createProgram({ options: {}, rootNames: [filename] });
    const sourceFile = program.getSourceFile(filename);

    const result = parseFile(sourceFile);

    expect(result.type).toEqual("MessageQueue");
    if (result.type === "MessageQueue") {
      expect(result.name).toEqual("queue");
    }
  });

  it.skip("Given a MessageQueue exported as default from an object, when calling parseFile, then should return MessageQueue", () => {
    const filename = `${__dirname}/fixtures/object-queue.ts`;
    const program = ts.createProgram({ options: {}, rootNames: [filename] });
    const sourceFile = program.getSourceFile(filename);

    const result = parseFile(sourceFile);

    expect(result.type).toEqual("MessageQueue");
    if (result.type === "MessageQueue") {
      expect(result.name).toEqual("object-queue");
    }
  });

  it.skip("Given a MessageQueue exported as default from an array, when calling parseFile, then should return MessageQueue", () => {
    const filename = `${__dirname}/fixtures/array-queue.ts`;
    const program = ts.createProgram({ options: {}, rootNames: [filename] });
    const sourceFile = program.getSourceFile(filename);

    const result = parseFile(sourceFile);

    expect(result.type).toEqual("MessageQueue");
    if (result.type === "MessageQueue") {
      expect(result.name).toEqual("array-queue");
    }
  });

  it.skip("Given a MessageQueue imported from another file, when calling parseFile, then should return MessageQueue", () => {
    expect(true).toEqual(false);
  });

  it("Given a CronJob as the default export, when calling parseFile, then should return CronJob", () => {
    const filename = `${__dirname}/fixtures/default-cron.ts`;
    const program = ts.createProgram({ options: {}, rootNames: [filename] });
    const sourceFile = program.getSourceFile(filename);

    const result = parseFile(sourceFile);

    expect(result.type).toEqual("CronJob");
    if (result.type === "CronJob") {
      expect(result.schedule).toEqual("* * * * *");
    }
  });

  it("Given a CronJob declared and later exported as default, when calling parseFile, then should return CronJob", () => {
    const filename = `${__dirname}/fixtures/cron.ts`;
    const program = ts.createProgram({ options: {}, rootNames: [filename] });
    const sourceFile = program.getSourceFile(filename);

    const result = parseFile(sourceFile);

    expect(result.type).toEqual("CronJob");
    if (result.type === "CronJob") {
      expect(result.schedule).toEqual("* * * * *");
    }
  });

  it.skip("Given a CronJob exported as default from an object, when calling parseFile, then should return CronJob", () => {
    const filename = `${__dirname}/fixtures/object-cron.ts`;
    const program = ts.createProgram({ options: {}, rootNames: [filename] });
    const sourceFile = program.getSourceFile(filename);

    const result = parseFile(sourceFile);

    expect(result.type).toEqual("CronJob");
  });

  it.skip("Given a CronJob exported as default from an array, when calling parseFile, then should return CronJob", () => {
    const filename = `${__dirname}/fixtures/array-cron.ts`;
    const program = ts.createProgram({ options: {}, rootNames: [filename] });
    const sourceFile = program.getSourceFile(filename);

    const result = parseFile(sourceFile);

    expect(result.type).toEqual("CronJob");
  });

  it.skip("Given a CronJob imported from another file, when calling parseFile, then should return CronJob", () => {
    expect(true).toEqual(false);
  });

  it.skip("Given a schedule declared in a variable earlier, when calling parseFile, then should return CronJob", () => {
    expect(true).toEqual(false);
  });
});
