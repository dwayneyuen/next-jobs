import { ApolloClient, HttpLink, InMemoryCache } from "@apollo/client";
import fetch from "node-fetch";

// TODO: Replace with production URL
const NEXT_JOBS_SERVER_URL =
  process.env.NEXT_JOBS_SERVER_URL ?? "http://localhost:3000";

const apolloClient = new ApolloClient({
  cache: new InMemoryCache(),
  link: new HttpLink({ fetch, uri: `${NEXT_JOBS_SERVER_URL}/graphql` }),
});

export default apolloClient;
