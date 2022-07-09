import { join } from "path";
import { ApolloDriver, ApolloDriverConfig } from "@nestjs/apollo";
import { Module } from "@nestjs/common";
import { GraphQLModule } from "@nestjs/graphql";
import { AuthModule } from "./auth/auth.module";
import { GraphqlModule } from "./graphql/graphql.module";
import { StripeController } from "src/controllers/paypal/stripe.controller";
import { PrismaModule } from "src/prisma/prisma.module";

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
    PrismaModule,
  ],
  controllers: [StripeController],
  providers: [],
})
export class AppModule {}
