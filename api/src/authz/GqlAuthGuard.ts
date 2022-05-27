import { ExecutionContext, Injectable, Logger } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { GqlExecutionContext } from "@nestjs/graphql";
import { AuthenticationError } from "apollo-server-core";
import { ExecutionContextHost } from "@nestjs/core/helpers/execution-context-host";

@Injectable()
export class GqlAuthGuard extends AuthGuard("jwt") {
  canActivate(context: ExecutionContext) {
    const ctx = GqlExecutionContext.create(context);
    const { req } = ctx.getContext();
    Logger.error(`context: ${Object.entries(ctx.getContext())}`);
    Logger.error(`context: ${Object.keys(ctx.getContext())}`);
    // Logger.error(`req ${JSON.stringify(req.toString())}`);
    Logger.error(`keys ${Object.keys(req)}`);
    Logger.error(`headers ${JSON.stringify(req.headers)}`);

    return super.canActivate(new ExecutionContextHost([req]));
  }

  handleRequest(err: any, user: any) {
    Logger.error(`[GqlAuthGuard.handleRequest] err: ${err}, user: ${user}`);
    if (err || !user) {
      throw err || new AuthenticationError("GqlAuthGuard");
    }
    return user;
  }
}
