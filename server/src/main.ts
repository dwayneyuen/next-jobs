import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { EnvironmentVariables } from "src/environment-variables";

async function bootstrap() {
  const environmentVariables = new EnvironmentVariables();

  if (
    !environmentVariables.NEXT_JOBS_API_URL &&
    !environmentVariables.NEXT_JOBS_ACCESS_TOKEN
  ) {
    throw new Error(
      "At least one of NEXT_JOBS_API_URL or NEXT_JOBS_ACCESS_TOKEN must be defined",
    );
  }

  if (
    environmentVariables.NEXT_JOBS_ACCESS_TOKEN &&
    !environmentVariables.NEXT_JOBS_BASE_URL
  ) {
    throw new Error(
      "NEXT_JOBS_BASE_URL must be defined if self-hosting the next-jobs server",
    );
  }

  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
}

bootstrap();
