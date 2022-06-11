import { ApolloDriver, ApolloDriverConfig } from "@nestjs/apollo";
import { Module } from "@nestjs/common";
import { GraphQLModule } from "@nestjs/graphql";
import { HttpModule } from "@nestjs/axios";
import { ResolverModule } from "src/graphql/resolver.module";
import { ParserService } from "src/parser.service";
import { IORedisModule } from "src/io-redis.module";
import { EnvironmentVariablesModule } from "src/environment-variables.module";

@Module({
  imports: [
    EnvironmentVariablesModule,
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: true,
      sortSchema: true,
    }),
    HttpModule,
    IORedisModule,
    ResolverModule,
  ],
  controllers: [],
  providers: [ParserService],
})
export class AppModule {}
