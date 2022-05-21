import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { DeployCommand } from "./commands/deploy";

@Module({
  // imports: [],
  // controllers: [AppController],
  // providers: [AppService],
  providers: [DeployCommand],
})
export class AppModule {}
