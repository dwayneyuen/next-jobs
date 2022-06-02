import { Module } from "@nestjs/common";
import { ApolloClient, HttpLink, InMemoryCache } from "@apollo/client";
import fetch from "node-fetch";
import { config } from "dotenv";
import { EnvironmentVariables } from "src/environment-variables";

config();

@Module({
  providers: [
    {
      provide: ApolloClient,
      useValue: new ApolloClient({
        cache: new InMemoryCache(),
        link: new HttpLink({
          fetch,
          uri: `${new EnvironmentVariables().NEXT_JOBS_BASE_URL}/graphql`,
        }),
      }),
    },
  ],
})
export class ApolloClientModule {}