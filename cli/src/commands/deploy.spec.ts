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

  it.skip("Given a JobQueue imported from another file, when calling parseFile, then should return JobQueue", () => {});

  it("Given a RepeatableJob as the default export, when calling parseFile, then should return RepeatableJob", () => {
    const filename = `${__dirname}/fixtures/default-repeatable.ts`;
    const program = ts.createProgram({ options: {}, rootNames: [filename] });
    const sourceFile = program.getSourceFile(filename);

    const result = parseFile(sourceFile);

    expect(result.type).toEqual("RepeatableJob");
    if (result.type === "RepeatableJob") {
      expect(result.schedule).toEqual("* * * * *");
    }
  });

  it("Given a RepeatableJob declared and later exported as default, when calling parseFile, then should return RepeatableJob", () => {
    const filename = `${__dirname}/fixtures/repeatable.ts`;
    const program = ts.createProgram({ options: {}, rootNames: [filename] });
    const sourceFile = program.getSourceFile(filename);

    const result = parseFile(sourceFile);

    expect(result.type).toEqual("RepeatableJob");
    if (result.type === "RepeatableJob") {
      expect(result.schedule).toEqual("* * * * *");
    }
  });

  it.skip("Given a RepeatableJob exported as default from an object, when calling parseFile, then should return RepeatableJob", () => {
    const filename = `${__dirname}/fixtures/object-repeatable.ts`;
    const program = ts.createProgram({ options: {}, rootNames: [filename] });
    const sourceFile = program.getSourceFile(filename);

    const result = parseFile(sourceFile);

    expect(result.type).toEqual("RepeatableJob");
  });

  it.skip("Given a RepeatableJob exported as default from an array, when calling parseFile, then should return RepeatableJob", () => {
    const filename = `${__dirname}/fixtures/array-repeatable.ts`;
    const program = ts.createProgram({ options: {}, rootNames: [filename] });
    const sourceFile = program.getSourceFile(filename);

    const result = parseFile(sourceFile);

    expect(result.type).toEqual("RepeatableJob");
  });

  it.skip("Given a RepeatableJob imported from another file, when calling parseFile, then should return RepeatableJob", () => {});
});
