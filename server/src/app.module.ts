import { join } from "path";
import { ApolloDriver, ApolloDriverConfig } from "@nestjs/apollo";
import { Module } from "@nestjs/common";
import { GraphQLModule } from "@nestjs/graphql";
import { BullModule } from "@nestjs/bull";
import { ScheduleModule } from "@nestjs/schedule";
import { HttpModule } from "@nestjs/axios";
import { ResolverModule } from "src/graphql/resolver.module";
import { EnvironmentVariablesModule } from "src/environment-variables.module";
import { EnvironmentVariables } from "src/environment-variables";
import { ApolloClientModule } from "src/apollo-client.module";

const environmentVariables = new EnvironmentVariables();

@Module({
  imports: [
    BullModule.forRoot({
      redis: {
        host: environmentVariables.NEXT_JOBS_REDIS_URL,
        port: environmentVariables.NEXT_JOBS_REDIS_PORT,
      },
    }),
    // EnvironmentVariablesModule,
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
