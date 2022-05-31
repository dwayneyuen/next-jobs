import { Module } from "@nestjs/common";
import { ServerResolver } from "src/graphql/server.resolver";

@Module({
  exports: [],
  imports: [],
  providers: [ServerResolver],
})
export class ResolverModule {}
