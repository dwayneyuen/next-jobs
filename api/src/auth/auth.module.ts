import { Module } from "@nestjs/common";
import { PassportModule } from "@nestjs/passport";
import { GqlAuthGuard } from "./gql-auth.guard";
import { AuthzStrategy } from "./authz.strategy";
import { PrismaModule } from "src/prisma/prisma.module";

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: "authz" }),
    PrismaModule,
  ],
  providers: [AuthzStrategy, GqlAuthGuard],
  exports: [],
})
export class AuthModule {}
