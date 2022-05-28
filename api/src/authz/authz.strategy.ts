import { Injectable, Logger } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-custom";
import { Request } from "express";
import { JWE, JWK, JWKS } from "jose";
import * as hkdf from "futoin-hkdf";
import * as dotenv from "dotenv";

const BYTE_LENGTH = 32;
const ENCRYPTION_INFO = "JWE CEK";
const options = { hash: "SHA-256" };

export const encryption = (secret: string): Buffer =>
  hkdf(secret, BYTE_LENGTH, { info: ENCRYPTION_INFO, ...options });
const epoch = (): number => (Date.now() / 1000) | 0; // eslint-disable-line no-bitwise

dotenv.config();

/**
 * Auth0 strategy implemented using nextjs-auth0 as a reference
 */
@Injectable()
export class AuthzStrategy extends PassportStrategy(Strategy, "authz") {
  constructor() {
    super();
  }

  async validate(request: Request): Promise<any> {
    Logger.log(`request cookies: ${request.cookies}`);
    Logger.log(`app session: ${request.cookies["appSession"]}`);
    Logger.log(`secret? ${process.env.AUTH0_SECRET}`);
    const keystore = new JWKS.KeyStore();
    keystore.add(JWK.asKey(encryption(process.env.AUTH0_SECRET)));
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
      return [];
    }
    Logger.log(
      `[validate] clearText: ${JSON.stringify(
        JSON.parse(cleartext.toString()),
      )}`,
    );
    return JSON.parse(cleartext.toString());
  }
}
