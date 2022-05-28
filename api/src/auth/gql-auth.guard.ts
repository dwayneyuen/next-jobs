import { randomInt } from "crypto";
import { ExecutionContext, Injectable, Logger } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { GqlExecutionContext } from "@nestjs/graphql";
import { AuthenticationError } from "apollo-server-core";
import { ExecutionContextHost } from "@nestjs/core/helpers/execution-context-host";
import { UserService } from "../prisma/user.service";

/**
 * Example session:
 * {
 *     "user": {
 *         "given_name": "Dwayne",
 *         "family_name": "Yuen",
 *         "nickname": "dwayneyuen",
 *         "name": "Dwayne Yuen",
 *         "picture": "https://lh3.googleusercontent.com/a-/AOh14GiK4DkKgLOnsK5QK9JwBprn4tqUX0t9KRvqqTJysUA=s96-c",
 *         "locale": "en",
 *         "updated_at": "2022-05-28T00:41:15.426Z",
 *         "email": "dwayneyuen@gmail.com",
 *         "email_verified": true,
 *         "sub": "google-oauth2|foo"
 *     },
 *     "idToken": "foo",
 *     "accessToken": "foo",
 *     "accessTokenScope": "openid profile email",
 *     "accessTokenExpiresAt": 1653784876,
 *     "token_type": "Bearer"
 * }
 */
type User = {
  given_name: string;
  family_name: string;
  nickname: string;
  name: string;
  picture: string;
  locale: string;
  updated_at: Date;
  email: string;
  email_verified: boolean;
  sub: string;
};

type Session = {
  user: User;
  idToken: string;
  accessToken: string;
  accessTokenScope: string;
  accessTokenExpiresAt: number;
  token_type: string;
};

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

@Injectable()
export class GqlAuthGuard extends AuthGuard("authz") {
  constructor(private userService: UserService) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const ctx = GqlExecutionContext.create(context);
    const { req } = ctx.getContext();
    return super.canActivate(new ExecutionContextHost([req]));
  }

  handleRequest(err: any, user: any) {
    if (err || !user) {
      throw err || new AuthenticationError("GqlAuthGuard");
    }
    // Auth0 stores users and authentication happens in the Next.js backend,
    // so we create new user entries. Better alternative would be to have the
    // Next.js auth0 API store the user in the auth0 callback, but that requires
    // figuring out how to expose the Prisma client to the Next.js web project.
    const session = user as Session;
    this.userService
      .user({
        auth0Sub: session.user.sub,
      })
      .then((user) => {
        if (!user) {
          this.userService
            .createUser({
              accessToken: generateAccessToken(),
              auth0Sub: session.user.sub,
              email: session.user.email,
              emailVerified: session.user.email_verified,
            })
            .then(
              () => {
                Logger.log(
                  `Created user: ${session.user.email}, ${session.user.sub}`,
                );
              },
              (reason) => {
                Logger.error(
                  `Failed to create user: ${session.user.email}, ${session.user.sub}, reason: ${reason}`,
                );
              },
            );
        }
      });

    return user;
  }
}
