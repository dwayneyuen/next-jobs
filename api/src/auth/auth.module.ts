import { Module } from "@nestjs/common";
import { PassportModule } from "@nestjs/passport";
import { UserModule } from "../prisma/user.module";
import { GqlAuthGuard } from "./gql-auth.guard";
import { AuthzStrategy } from "./authz.strategy";

@Module({
  imports: [PassportModule.register({ defaultStrategy: "authz" }), UserModule],
  providers: [AuthzStrategy, GqlAuthGuard],
  exports: [],
})
export class AuthModule {}
