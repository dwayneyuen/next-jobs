import { useState } from "react";
import { withPageAuthRequired } from "@auth0/nextjs-auth0";
import {
  SubscriptionStatus,
  useGetMeQuery,
  useGetSubscriptionStatusQuery,
} from "graphql/generated";
import BillingDialog from "components/billing-dialog";
import NavBar from "components/nav-bar";

function Billing() {
  const { data: meData } = useGetMeQuery();
  const { data: subscriptionStatusData, loading: subscriptionStatusLoading } =
    useGetSubscriptionStatusQuery();

  const [showBillingDialog, setShowBillingDialog] = useState(false);
  let billingStatusText = "";
  let billingStatusColor = "";
  let showSubscribeButton = false;
  const subscriptionStatus = subscriptionStatusData?.getMe?.subscriptionStatus;
  switch (subscriptionStatus) {
    case undefined: {
      if (!subscriptionStatusLoading) {
        billingStatusText = "NOT ACTIVE";
        billingStatusColor = "text-gray-500";
        showSubscribeButton = true;
      }
      break;
    }
    case null: {
      if (!subscriptionStatusLoading) {
        billingStatusText = "NOT ACTIVE";
        billingStatusColor = "text-gray-500";
        showSubscribeButton = true;
      }
      break;
    }
    case SubscriptionStatus.Active: {
      billingStatusText = "ACTIVE";
      billingStatusColor = "text-green-500";
      break;
    }
    case SubscriptionStatus.ApprovalPending: {
      billingStatusText = "PENDING";
      billingStatusColor = "text-yellow-500";
      break;
    }
    case SubscriptionStatus.Approved: {
      billingStatusText = "ACTIVE";
      billingStatusColor = "text-green-500";
      break;
    }
    case SubscriptionStatus.Cancelled: {
      billingStatusText = "CANCELLED";
      billingStatusColor = "text-red-500";
      showSubscribeButton = true;
      break;
    }
    case SubscriptionStatus.Expired: {
      billingStatusText = "EXPIRED";
      billingStatusColor = "text-red-500";
      showSubscribeButton = true;
      break;
    }
    case SubscriptionStatus.Suspended: {
      billingStatusText = "SUSPENDED";
      billingStatusColor = "text-red-500";
      showSubscribeButton = true;
      break;
    }
  }

  return (
    <>
      <div className="min-h-full">
        <NavBar current={"Billing"} />
        <div className="py-10">
          <header>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h1 className="text-3xl font-bold leading-tight text-gray-900">
                Settings
              </h1>
            </div>
          </header>
          <main>
            <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
              <div className="py-8 sm:px-0">
                <>
                  <div className="mt-5 border-t border-gray-200">
                    <dl className="divide-y divide-gray-200">
                      <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4">
                        <dt className="text-sm font-medium text-gray-500">
                          Email
                        </dt>
                        <dd className="mt-1 flex text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                          <span className="flex-grow">
                            {meData?.getMe?.email}
                          </span>
                        </dd>
                      </div>
                      <div className="py-4 sm:grid sm:py-5 sm:grid-cols-3 sm:gap-4">
                        <dt className="text-sm font-medium text-gray-500">
                          Access token
                        </dt>
                        <dd className="mt-1 flex justify-between text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                          <span className={"bg-slate-200 pl-2 pr-2 rounded"}>
                            {meData?.getMe?.accessToken}
                          </span>
                          <div>
                            <span className="ml-4 flex-shrink-0">
                              <button
                                type="button"
                                className="bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                              >
                                Show / Hide
                              </button>
                            </span>
                            <span className="ml-4 flex-shrink-0">
                              <button
                                type="button"
                                className="bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                              >
                                Refresh
                              </button>
                            </span>
                          </div>
                        </dd>
                      </div>
                      <div className="py-4 sm:grid sm:py-5 sm:grid-cols-3 sm:gap-4">
                        <dt className="text-sm font-medium text-gray-500">
                          Billing status
                        </dt>
                        <dd className="mt-1 flex justify-between text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                          <span
                            className={`${billingStatusColor} bg-slate-200 pl-2 pr-2 rounded`}
                          >
                            {billingStatusText}
                          </span>
                          <span className="ml-4 flex-shrink-0">
                            {showSubscribeButton && (
                              <button
                                type="button"
                                className="bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                onClick={() => setShowBillingDialog(true)}
                              >
                                Subscribe
                              </button>
                            )}
                          </span>
                        </dd>
                      </div>
                    </dl>
                  </div>
                </>
              </div>
            </div>
            <BillingDialog
              open={showBillingDialog}
              setOpen={setShowBillingDialog}
            />
          </main>
        </div>
      </div>
    </>
  );
}

export default withPageAuthRequired(Billing);
