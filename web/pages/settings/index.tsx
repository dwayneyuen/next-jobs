import { Fragment, useState } from "react";
import { Disclosure, Menu, Transition } from "@headlessui/react";
import { BellIcon, MenuIcon, XIcon } from "@heroicons/react/outline";
import { withPageAuthRequired } from "@auth0/nextjs-auth0";
import Link from "next/link";
import { classNames } from "lib/class-names";
import {
  SubscriptionStatus,
  useGetMeQuery,
  useGetSubscriptionStatusQuery,
} from "graphql/generated";
import BillingDialog from "components/billing-dialog";

const user = {
  name: "Tom Cook",
  email: "tom@example.com",
  imageUrl: "black-logo.svg",
};
const navigation = [
  { name: "Dashboard", href: "/dashboard", current: false },
  { name: "Activity", href: "#", current: false },
  { name: "Settings", href: "/settings", current: true },
];
const userNavigation = [
  { name: "Your Profile", href: "#" },
  { name: "Settings", href: "/settings" },
  { name: "Sign out", href: "/api/auth/logout" },
];

function Index() {
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
        <Disclosure as="nav" className="bg-white border-b border-gray-200">
          {({ open }) => (
            <>
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                  <div className="flex">
                    <div className="flex-shrink-0 flex items-center">
                      <img
                        className="block h-8 w-auto"
                        src="/black-logo.svg"
                        alt="Logo"
                      />
                    </div>
                    <div className="hidden sm:-my-px sm:ml-6 sm:flex sm:space-x-8">
                      {navigation.map((item) => (
                        <div
                          key={item.name}
                          className={classNames(
                            item.current
                              ? "border-indigo-500 text-gray-900"
                              : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700",
                            "inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                          )}
                          aria-current={item.current ? "page" : undefined}
                        >
                          <Link href={item.href}>{item.name}</Link>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="hidden sm:ml-6 sm:flex sm:items-center">
                    {/*<button*/}
                    {/*  type="button"*/}
                    {/*  className="bg-white p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"*/}
                    {/*>*/}
                    {/*  <span className="sr-only">View notifications</span>*/}
                    {/*  <BellIcon className="h-6 w-6" aria-hidden="true" />*/}
                    {/*</button>*/}

                    {/* Profile dropdown */}
                    <Menu as="div" className="ml-3 relative">
                      <div>
                        <Menu.Button className="max-w-xs bg-white flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                          <span className="sr-only">Open user menu</span>
                          <img
                            className="h-8 w-8 rounded-full"
                            src={user.imageUrl}
                            alt=""
                          />
                        </Menu.Button>
                      </div>
                      <Transition
                        as={Fragment}
                        enter="transition ease-out duration-200"
                        enterFrom="transform opacity-0 scale-95"
                        enterTo="transform opacity-100 scale-100"
                        leave="transition ease-in duration-75"
                        leaveFrom="transform opacity-100 scale-100"
                        leaveTo="transform opacity-0 scale-95"
                      >
                        <Menu.Items className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                          {userNavigation.map((item) => (
                            <Menu.Item key={item.name}>
                              {({ active }) => (
                                <a
                                  href={item.href}
                                  className={classNames(
                                    active ? "bg-gray-100" : "",
                                    "block px-4 py-2 text-sm text-gray-700"
                                  )}
                                >
                                  {item.name}
                                </a>
                              )}
                            </Menu.Item>
                          ))}
                        </Menu.Items>
                      </Transition>
                    </Menu>
                  </div>
                  <div className="-mr-2 flex items-center sm:hidden">
                    {/* Mobile menu button */}
                    <Disclosure.Button className="bg-white inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                      <span className="sr-only">Open main menu</span>
                      {open ? (
                        <XIcon className="block h-6 w-6" aria-hidden="true" />
                      ) : (
                        <MenuIcon
                          className="block h-6 w-6"
                          aria-hidden="true"
                        />
                      )}
                    </Disclosure.Button>
                  </div>
                </div>
              </div>

              <Disclosure.Panel className="sm:hidden">
                <div className="pt-2 pb-3 space-y-1">
                  {navigation.map((item) => (
                    <Disclosure.Button
                      key={item.name}
                      as="a"
                      href={item.href}
                      className={classNames(
                        item.current
                          ? "bg-indigo-50 border-indigo-500 text-indigo-700"
                          : "border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800",
                        "block pl-3 pr-4 py-2 border-l-4 text-base font-medium"
                      )}
                      aria-current={item.current ? "page" : undefined}
                    >
                      {item.name}
                    </Disclosure.Button>
                  ))}
                </div>
                <div className="pt-4 pb-3 border-t border-gray-200">
                  <div className="flex items-center px-4">
                    <div className="flex-shrink-0">
                      <img
                        className="h-10 w-10 rounded-full"
                        src={user.imageUrl}
                        alt=""
                      />
                    </div>
                    <div className="ml-3">
                      <div className="text-base font-medium text-gray-800">
                        {user.name}
                      </div>
                      <div className="text-sm font-medium text-gray-500">
                        {user.email}
                      </div>
                    </div>
                    <button
                      type="button"
                      className="ml-auto bg-white flex-shrink-0 p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      <span className="sr-only">View notifications</span>
                      <BellIcon className="h-6 w-6" aria-hidden="true" />
                    </button>
                  </div>
                  <div className="mt-3 space-y-1">
                    {userNavigation.map((item) => (
                      <Disclosure.Button
                        key={item.name}
                        as="a"
                        href={item.href}
                        className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                      >
                        {item.name}
                      </Disclosure.Button>
                    ))}
                  </div>
                </div>
              </Disclosure.Panel>
            </>
          )}
        </Disclosure>

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
                  {/*<div>*/}
                  {/*  <h3 className="text-lg leading-6 font-medium text-gray-900">*/}
                  {/*    Applicant Information*/}
                  {/*  </h3>*/}
                  {/*  <p className="mt-1 max-w-2xl text-sm text-gray-500">*/}
                  {/*    Personal details and application.*/}
                  {/*  </p>*/}
                  {/*</div>*/}
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
                          {/*<span className="ml-4 flex-shrink-0">*/}
                          {/*  <button*/}
                          {/*    type="button"*/}
                          {/*    className="bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"*/}
                          {/*  >*/}
                          {/*    Update*/}
                          {/*  </button>*/}
                          {/*</span>*/}
                        </dd>
                      </div>
                      <div className="py-4 sm:grid sm:py-5 sm:grid-cols-3 sm:gap-4">
                        <dt className="text-sm font-medium text-gray-500">
                          Access token
                        </dt>
                        <dd className="mt-1 flex justify-between text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                          <span
                            className={`${billingStatusColor} bg-slate-300 pl-2 pr-2 rounded`}
                          >
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
                            className={`${billingStatusColor} bg-slate-300 pl-2 pr-2 rounded`}
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

export default withPageAuthRequired(Index);
