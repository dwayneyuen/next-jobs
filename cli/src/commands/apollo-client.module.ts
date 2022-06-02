import { Logger, Module } from "@nestjs/common";
import { ApolloClient, HttpLink, InMemoryCache } from "@apollo/client";
import fetch from "node-fetch";
import { config } from "dotenv";

config();

Logger.log(`uri: ${process.env.NEXT_JOBS_SERVER_URL}/graphql`);

@Module({
  exports: [ApolloClient],
  providers: [
    {
      provide: ApolloClient,
      useValue: new ApolloClient({
        cache: new InMemoryCache(),
        link: new HttpLink({
          fetch,
          uri: `${process.env.NEXT_JOBS_SERVER_URL}/graphql`,
        }),
      }),
    },
  ],
})
export class ApolloClientModule {}
