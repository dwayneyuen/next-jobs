import { withPageAuthRequired } from "@auth0/nextjs-auth0";
import { PlusIcon } from "@heroicons/react/solid";
import BlackButton from "components/black-button";
import NavBar from "components/nav-bar";

function Dashboard() {
  return (
    <>
      {/*
        This example requires updating your template:

        ```
        <html class="h-full">
        <body class="h-full">
        ```
      */}
      <div className="min-h-full">
        <NavBar current={"Dashboard"} />
        <div className="py-10">
          <header>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h1 className="text-3xl font-bold leading-tight text-gray-900">
                Dashboard
              </h1>
            </div>
          </header>
          <main>
            <div className="max-w-7xl mx-auto">
              <div className="py-8 sm:px-0">
                <BlackButton href={"/new"}>
                  <PlusIcon
                    className="-ml-0.5 mr-2 h-4 w-4"
                    aria-hidden="true"
                  />
                  Link project
                </BlackButton>
              </div>
            </div>
            <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
              {/* Replace with your content */}
              <div className="py-8 sm:px-0">
                <div className="border-4 border-dashed border-gray-200 rounded-lg h-96" />
              </div>
              {/* /End replace */}
            </div>
          </main>
        </div>
      </div>
    </>
  );
}

export default withPageAuthRequired(Dashboard);
