import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import * as cookieParser from "cookie-parser";
import { AppModule } from "./app.module";

async function bootstrap() {
  // Self-hosting requirements
  if (process.env.NEXT_JOBS_ACCESS_TOKEN && !process.env.NEXT_JOBS_JOBS_URL) {
    throw Error(
      "NEXT_JOBS_ACCESS_TOKEN provided but not NEXT_JOBS_JOBS_URL. Both must be defined for self-hosting next-jobs!",
    );
  }

  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: true,
    credentials: true,
  });
  app.useGlobalPipes(new ValidationPipe({ disableErrorMessages: false }));
  app.use(cookieParser());
  await app.listen(3000);
}

bootstrap();
