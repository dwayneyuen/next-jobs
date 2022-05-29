import { Injectable, Logger } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-custom";
import { Request } from "express";
import { JWE, JWK, JWKS } from "jose";
import * as hkdf from "futoin-hkdf";
import * as dotenv from "dotenv";
import { UserService } from "../prisma/user.service";
import { generateAccessToken } from "src/access-token";
import { Auth0Session } from "src/authz-session";

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
  constructor(private userService: UserService) {
    super();
  }

  async validate(request: Request): Promise<any> {
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
      return null;
    }
    const data: Auth0Session = JSON.parse(cleartext.toString());
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
