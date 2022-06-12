import { Injectable, Logger } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-custom";
import { Request } from "express";
import { JWE, JWK, JWKS } from "jose";
import * as hkdf from "futoin-hkdf";
import * as dotenv from "dotenv";
import { UserService } from "../prisma/user.service";
import { generateAccessToken } from "src/access-token";
import { Auth0Session } from "src/auth/authz-session";

const BYTE_LENGTH = 32;
const ENCRYPTION_INFO = "JWE CEK";
const options = { hash: "SHA-256" };

export const encryption = (secret: string): Buffer =>
  hkdf(secret, BYTE_LENGTH, { info: ENCRYPTION_INFO, ...options });
const epoch = (): number => (Date.now() / 1000) | 0; // eslint-disable-line no-bitwise

dotenv.config();

const notNull = <T>(value: T | null): value is T => value !== null;

/**
 * Auth0 strategy implemented based on nextjs-auth0 cookie-store.ts
 */
@Injectable()
export class AuthzStrategy extends PassportStrategy(Strategy, "authz") {
  constructor(private userService: UserService) {
    super();
  }

  private logger = new Logger(AuthzStrategy.name);

  async validate(request: Request): Promise<any> {
    const keystore = new JWKS.KeyStore();
    keystore.add(JWK.asKey(encryption(process.env.AUTH0_SECRET)));
    this.logger.debug(`appSession: ${request.cookies["appSession"]}`);
    let data: Auth0Session;
    if ("appSession" in request.cookies) {
      const { protected: header, cleartext } = JWE.decrypt(
        request.cookies["appSession"],
        keystore,
        {
          complete: true,
          contentEncryptionAlgorithms: ["A256GCM"],
          keyManagementAlgorithms: ["dir"],
        },
      );
      const { exp } = header as { exp: number };
      if (exp <= epoch()) {
        Logger.log("Expired based on options when it was established");
        return null;
      }
      data = JSON.parse(cleartext.toString());
    } else if ("appSession.0" in request.cookies) {
      // The cookie is chunked
      Object.entries(request.cookies)
        .map(([cookie, value]): [string, string] | null => {
          const match = cookie.match("^appSession\\.(\\d+)$");
          if (match) {
            return [match[1], value as string];
          }
          return null;
        })
        .filter(notNull)
        .sort(([a], [b]) => {
          return parseInt(a, 10) - parseInt(b, 10);
        })
        .map(([_i, chunk]) => {
          return chunk;
        })
        .join("");
    }
    this.logger.debug(`data: ${data}`);
    const existingUser = await this.userService.user({
      auth0Sub: data.user.sub,
    });
    if (!existingUser) {
      // Because auth0 stores our user data, we have to create a user entry
      // manually once
      await this.userService.createUser({
        accessToken: generateAccessToken(),
        auth0Sub: data.user.sub,
        email: data.user.email,
        emailVerified: data.user.email_verified,
      });
    }

    return data;
  }
}
