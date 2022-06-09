import { join } from "path";
import { ApolloDriver, ApolloDriverConfig } from "@nestjs/apollo";
import { Module } from "@nestjs/common";
import { GraphQLModule } from "@nestjs/graphql";
import { HttpModule } from "@nestjs/axios";
import { ResolverModule } from "src/graphql/resolver.module";
import { ParserService } from "src/parser.service";
import { IORedisModule } from "src/io-redis.module";

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), "src/graphql/schema.graphql"),
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
