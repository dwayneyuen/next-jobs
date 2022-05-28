import { Module } from "@nestjs/common";
import { PassportModule } from "@nestjs/passport";
import { AuthzStrategy } from "./authz.strategy";

@Module({
  imports: [PassportModule.register({ defaultStrategy: "authz" })],
  providers: [AuthzStrategy],
  exports: [PassportModule],
})
export class AuthzModule {}
