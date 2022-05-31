import { Module } from "@nestjs/common";
import { ApolloClient, HttpLink, InMemoryCache } from "@apollo/client";
import { EnvironmentVariables } from "src/environment-variables";

@Module({
  providers: [
    {
      provide: ApolloClient,
      useValue: new ApolloClient({
        cache: new InMemoryCache(),
        link: new HttpLink({
          fetch,
          uri: `${new EnvironmentVariables().NEXT_JOBS_API_URL}/graphql`,
        }),
      }),
    },
  ],
})
export class ApolloClientModule {}
