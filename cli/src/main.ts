import { CommandFactory } from "nest-commander";
import { AppModule } from "./app.module";

async function bootstrap() {
  console.log(process.argv);
  await CommandFactory.run(AppModule, [
    "warn",
    "error",
    "debug",
    "verbose",
    "log",
  ]);
}

bootstrap();
