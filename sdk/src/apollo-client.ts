import { ApolloClient, HttpLink, InMemoryCache } from "@apollo/client";
import fetch from "cross-fetch";

const serverUrl = process.env.NEXT_CRON_SERVER_URL ?? "http://localhost:5678";

const apolloClient = new ApolloClient({
  cache: new InMemoryCache(),
  link: new HttpLink({
    fetch,
    uri: `${serverUrl}/graphql`,
  }),
});

export default apolloClient;
