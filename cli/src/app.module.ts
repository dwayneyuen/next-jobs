import { Module } from "@nestjs/common";
import { DeployCommand } from "./commands/deploy";
import { ApolloClientModule } from "src/commands/apollo-client.module";

@Module({
  imports: [ApolloClientModule],
  providers: [DeployCommand],
})
export class AppModule {}
