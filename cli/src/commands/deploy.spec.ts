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

  it("Given a JobQueue as the default export, when calling parseFile, then should return JobQueue", () => {
    const filename = `${__dirname}/fixtures/default-queue.ts`;
    const program = ts.createProgram({ options: {}, rootNames: [filename] });
    const sourceFile = program.getSourceFile(filename);

    const result = parseFile(sourceFile);

    expect(result.type).toEqual("JobQueue");
  });

  it("Given a JobQueue declared and later exported as default, when calling parseFile, then should return JobQueue", () => {
    const filename = `${__dirname}/fixtures/queue.ts`;
    const program = ts.createProgram({ options: {}, rootNames: [filename] });
    const sourceFile = program.getSourceFile(filename);

    const result = parseFile(sourceFile);

    expect(result.type).toEqual("JobQueue");
  });

  it.skip("Given a JobQueue exported as default from an object, when calling parseFile, then should return JobQueue", () => {
    const filename = `${__dirname}/fixtures/object-queue.ts`;
    const program = ts.createProgram({ options: {}, rootNames: [filename] });
    const sourceFile = program.getSourceFile(filename);

    const result = parseFile(sourceFile);

    expect(result.type).toEqual("JobQueue");
  });

  it.skip("Given a JobQueue exported as default from an array, when calling parseFile, then should return JobQueue", () => {
    const filename = `${__dirname}/fixtures/array-queue.ts`;
    const program = ts.createProgram({ options: {}, rootNames: [filename] });
    const sourceFile = program.getSourceFile(filename);

    const result = parseFile(sourceFile);

    expect(result.type).toEqual("JobQueue");
  });

  it.skip("Given a JobQueue imported from another file, when calling parseFile, then should return JobQueue", () => {
    expect(true).toEqual(false);
  });

  it("Given a ScheduledJob as the default export, when calling parseFile, then should return ScheduledJob", () => {
    const filename = `${__dirname}/fixtures/default-scheduled.ts`;
    const program = ts.createProgram({ options: {}, rootNames: [filename] });
    const sourceFile = program.getSourceFile(filename);

    const result = parseFile(sourceFile);

    expect(result.type).toEqual("ScheduledJob");
    if (result.type === "ScheduledJob") {
      expect(result.schedule).toEqual("* * * * *");
    }
  });

  it("Given a ScheduledJob declared and later exported as default, when calling parseFile, then should return ScheduledJob", () => {
    const filename = `${__dirname}/fixtures/scheduled.ts`;
    const program = ts.createProgram({ options: {}, rootNames: [filename] });
    const sourceFile = program.getSourceFile(filename);

    const result = parseFile(sourceFile);

    expect(result.type).toEqual("ScheduledJob");
    if (result.type === "ScheduledJob") {
      expect(result.schedule).toEqual("* * * * *");
    }
  });

  it.skip("Given a ScheduledJob exported as default from an object, when calling parseFile, then should return ScheduledJob", () => {
    const filename = `${__dirname}/fixtures/object-scheduled.ts`;
    const program = ts.createProgram({ options: {}, rootNames: [filename] });
    const sourceFile = program.getSourceFile(filename);

    const result = parseFile(sourceFile);

    expect(result.type).toEqual("ScheduledJob");
  });

  it.skip("Given a ScheduledJob exported as default from an array, when calling parseFile, then should return ScheduledJob", () => {
    const filename = `${__dirname}/fixtures/array-scheduled.ts`;
    const program = ts.createProgram({ options: {}, rootNames: [filename] });
    const sourceFile = program.getSourceFile(filename);

    const result = parseFile(sourceFile);

    expect(result.type).toEqual("ScheduledJob");
  });

  it.skip("Given a ScheduledJob imported from another file, when calling parseFile, then should return ScheduledJob", () => {
    expect(true).toEqual(false);
  });
});
