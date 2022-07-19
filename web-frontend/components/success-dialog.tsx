import { Fragment, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { CheckIcon } from "@heroicons/react/outline";
import { PayPalButtons } from "@paypal/react-paypal-js";
import {
  GetMeDocument,
  GetSubscriptionStatusDocument,
  useSavePaypalSubscriptionMutation,
} from "graphql/generated";
import { PaymentElement } from "@stripe/react-stripe-js";

export default function SuccessDialog({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
}) {
  const [success, setSuccess] = useState(false);
  const [savePaypalSubscription, { loading }] =
    useSavePaypalSubscriptionMutation({
      refetchQueries: [GetMeDocument, GetSubscriptionStatusDocument],
    });
  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-10"
        onClose={() => {
          setOpen(false);
        }}
        open={open}
      >
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end sm:items-center justify-center min-h-full p-4 text-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:max-w-sm sm:w-full sm:p-6">
                <div>
                  <div className="mt-3 text-center sm:mt-5">
                    <Dialog.Title
                      as="h3"
                      className="text-lg leading-6 font-medium text-gray-900"
                    >
                      Subscription to Nextcron.io
                    </Dialog.Title>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        A subscription to <b>nextcron.io</b> costs <b>$20</b>{" "}
                        per month. Your first <b>two weeks are free</b> and can
                        be cancelled any time.
                      </p>
                    </div>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Billing is handled securely by <b>PayPal</b> - we store
                        none of your billing information.
                      </p>
                    </div>
                    <form>
                      <PaymentElement />
                    </form>
                    {!success && (
                      <div className="mt-4">
                        <PayPalButtons
                          createSubscription={async (data, actions) => {
                            return actions.subscription.create({
                              plan_id: process.env.NEXT_PUBLIC_PAYPAL_PLAN_ID!,
                              quantity: "1",
                            });
                          }}
                          onApprove={async (data) => {
                            if (data.subscriptionID) {
                              setSuccess(true);
                              await savePaypalSubscription({
                                variables: {
                                  paypalPlanId:
                                    process.env.NEXT_PUBLIC_PAYPAL_PLAN_ID!,
                                  paypalSubscriptionId: data.subscriptionID,
                                },
                              });
                            }
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>
                {success && (
                  <div>
                    <div className="mt-3 mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                      <CheckIcon
                        className="h-6 w-6 text-green-600"
                        aria-hidden="true"
                      />
                    </div>
                    <div className="mt-3 text-center sm:mt-5">
                      <Dialog.Title
                        as="h3"
                        className="text-lg leading-6 font-medium text-gray-900"
                      >
                        Payment successful!
                      </Dialog.Title>
                    </div>
                  </div>
                )}
                <div className="mt-5 sm:mt-6">
                  <button
                    disabled={loading}
                    type="button"
                    className={
                      loading
                        ? "cursor-progress inline-flex justify-center w-full rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600/50 text-base font-medium text-white hover:bg-indigo-700/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500/50 sm:text-sm"
                        : "inline-flex justify-center w-full rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:text-sm"
                    }
                    onClick={() => setOpen(false)}
                  >
                    Go back to dashboard
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
