import "../styles/globals.css";
import type { AppProps } from "next/app";
import { UserProvider } from "@auth0/nextjs-auth0";
import { ApolloProvider } from "@apollo/client";
import { PayPalScriptProvider } from "@paypal/react-paypal-js";
import apolloClient from "lib/apollo-client";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";

const stripePromise = loadStripe(process.env.STRIPE_PUBLISHABLE_KEY!);

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <UserProvider>
      <ApolloProvider client={apolloClient}>
        <Elements stripe={stripePromise}>
          <PayPalScriptProvider
            options={{
              intent: "subscription",
              "client-id": process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID!,
              vault: true,
            }}
          >
            <Component {...pageProps} />
          </PayPalScriptProvider>
        </Elements>
      </ApolloProvider>
    </UserProvider>
  );
}

export default MyApp;
