import { randomInt } from "crypto";

const tokenCharset =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
/**
 * Generate an 32 char length alphanumeric access token
 */
export const generateAccessToken = (): string => {
  let token = "";
  for (let i = 0; i < 32; i++) {
    token += tokenCharset.charAt(randomInt(tokenCharset.length));
  }
  return token;
};
