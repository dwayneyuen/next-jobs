import { withPageAuthRequired } from "@auth0/nextjs-auth0";
import {
  useGetMeQuery,
  useGetSubscriptionStatusQuery,
} from "graphql/generated";
import NavBar from "components/nav-bar";
import { CheckIcon } from "@heroicons/react/solid";
import { useRouter } from "next/router";

function Billing() {
  const { query } = useRouter();
  const { success } = query;
  const { data: meData } = useGetMeQuery();
  const { data: subscriptionStatusData, loading: subscriptionStatusLoading } =
    useGetSubscriptionStatusQuery();

  const tiers = [
    {
      name: "Hobby",
      href: "#",
      priceApiId: "price_1LGY9uBrPowVayStBbzXLrTB",
      priceMonthly: 20,
      description: null,
      includedFeatures: ["Up to 20,000 jobs per month", "2 week free trial"],
    },
    {
      name: "Startup",
      href: "#",
      priceApiId: "price_1LGY9uBrPowVaySt6fCjKmbI",
      priceMonthly: 50,
      description: null,
      includedFeatures: ["Up to 500,000 jobs per month", "2 week free trial"],
    },
    {
      name: "Enterprise",
      href: "#",
      priceMonthly: null,
      description:
        "If you're scheduling more than 500,000 jobs and messages per month, contact us to discuss pricing options",
      includedFeatures: [],
    },
  ];

  return (
    <div className="bg-white">
      <NavBar current={"Billing"} />
      <div className="max-w-7xl mx-auto py-24 px-4 sm:px-6 lg:px-8">
        <div className="sm:flex sm:flex-col sm:align-center">
          <h1 className="text-5xl font-extrabold text-gray-900 sm:text-center">
            Pricing Plans
          </h1>
          <p className="mt-5 text-xl text-gray-500 sm:text-center">
            Every plan has a free 2-week trial. Start building for free, and
            cancel anytime.
          </p>
          <p className="mt-5 text-xl text-gray-500 sm:text-center">
            Subscriptions are handled through{" "}
            <a href={"https://stripe.com/"}>Stripe</a>, we store none of your
            billing information.
          </p>
        </div>
        <div className="mt-12 space-y-4 sm:mt-16 sm:space-y-0 sm:grid sm:grid-cols-3 sm:gap-6 lg:max-w-4xl lg:mx-auto xl:max-w-none xl:mx-0 xl:grid-cols-3">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className="max-w-xs border border-gray-200 rounded-lg shadow-sm divide-y divide-gray-200"
            >
              <div className="h-full p-6 flex flex-col justify-between">
                <div>
                  <h2 className="text-lg leading-6 font-medium text-gray-900">
                    {tier.name}
                  </h2>
                  {tier.description && (
                    <p className="mt-4 text-sm text-gray-500">
                      {tier.description}
                    </p>
                  )}
                  {tier.priceMonthly && (
                    <p className="mt-8">
                      <span className="text-4xl font-extrabold text-gray-900">
                        ${tier.priceMonthly}
                      </span>{" "}
                      <span className="text-base font-medium text-gray-500">
                        /mo
                      </span>
                    </p>
                  )}
                  <ul role="list" className="mt-6 space-y-4">
                    {tier.includedFeatures.map((feature) => (
                      <li key={feature} className="flex space-x-3">
                        <CheckIcon
                          className="flex-shrink-0 h-5 w-5 text-green-500"
                          aria-hidden="true"
                        />
                        <span className="text-sm text-gray-500">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <form
                  action={`${process.env.NEXT_PUBLIC_API_URL}/create-checkout-session`}
                  method={"POST"}
                >
                  <button
                    type="submit"
                    className="mt-8 block w-full bg-gray-800 border border-gray-800 rounded-md py-2 text-sm font-semibold text-white text-center hover:bg-gray-900"
                  >
                    {tier.priceMonthly ? `Buy ${tier.name}` : `Contact us`}
                  </button>
                </form>
              </div>
              {/*<div className="pt-6 pb-8 px-6">*/}
              {/*  <h3 className="text-xs font-medium text-gray-900 tracking-wide uppercase">*/}
              {/*    What&apos;s included*/}
              {/*  </h3>*/}
              {/*  <ul role="list" className="mt-6 space-y-4">*/}
              {/*    {tier.includedFeatures.map((feature) => (*/}
              {/*      <li key={feature} className="flex space-x-3">*/}
              {/*        <CheckIcon*/}
              {/*          className="flex-shrink-0 h-5 w-5 text-green-500"*/}
              {/*          aria-hidden="true"*/}
              {/*        />*/}
              {/*        <span className="text-sm text-gray-500">{feature}</span>*/}
              {/*      </li>*/}
              {/*    ))}*/}
              {/*  </ul>*/}
              {/*</div>*/}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default withPageAuthRequired(Billing);
