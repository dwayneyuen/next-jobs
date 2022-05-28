import { join } from "path";
import { ApolloDriver, ApolloDriverConfig } from "@nestjs/apollo";
import { Module } from "@nestjs/common";
import { GraphQLModule } from "@nestjs/graphql";
import { AuthModule } from "./auth/auth.module";
import { GraphqlModule } from "./graphql/graphql.module";

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      cors: {
        origin: true,
        credentials: true,
      },
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), "src/graphql/schema.graphql"),
      sortSchema: true,
    }),
    AuthModule,
    GraphqlModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
