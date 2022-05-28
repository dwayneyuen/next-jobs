import { generateAccessToken } from "./gql-auth.guard";

describe("generateAccessToken", () => {
  it("should generate a string with length 32", () => {
    expect(generateAccessToken()).toHaveLength(32);
  });

  it("should contain only alphanumeric characters", () => {
    expect(generateAccessToken().match(/^[a-zA-Z\d]+$/)).not.toBeNull();
  });
});
