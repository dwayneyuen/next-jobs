import "../styles/globals.css";
import type { AppProps } from "next/app";
import { UserProvider } from "@auth0/nextjs-auth0";
import { ApolloProvider } from "@apollo/client";
import { PayPalScriptProvider } from "@paypal/react-paypal-js";
import apolloClient from "lib/apollo-client";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <UserProvider>
      <ApolloProvider client={apolloClient}>
        <PayPalScriptProvider
          options={{
            "client-id": process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID!,
            vault: true,
          }}
        >
          <Component {...pageProps} />
        </PayPalScriptProvider>
      </ApolloProvider>
    </UserProvider>
  );
}

export default MyApp;
