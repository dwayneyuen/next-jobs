import { join } from "path";
import { ApolloDriver, ApolloDriverConfig } from "@nestjs/apollo";
import { Module } from "@nestjs/common";
import { GraphQLModule } from "@nestjs/graphql";
import { ScheduleModule } from "@nestjs/schedule";
import { HttpModule } from "@nestjs/axios";
import { config } from "dotenv";
import { BullModule } from "@nestjs/bull";
import { ResolverModule } from "src/graphql/resolver.module";
import { EnvironmentVariables } from "src/environment-variables";

config();

const environmentVariables = new EnvironmentVariables();

@Module({
  imports: [
    BullModule.forRoot({
      redis: {
        host: environmentVariables.NEXT_JOBS_REDIS_HOST,
        port: environmentVariables.NEXT_JOBS_REDIS_PORT,
      },
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), "src/graphql/schema.graphql"),
      sortSchema: true,
    }),
    HttpModule,
    ResolverModule,
    ScheduleModule.forRoot(),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
