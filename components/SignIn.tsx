import { LockClosedIcon } from "@heroicons/react/solid";
import { authenticate } from "../utils/auth";
const SignIn = (props: {}) => {
  return (
    <>
      {/*
		This example requires updating your template:
	
		```
		<html class="h-full bg-gray-50">
		<body class="h-full">
		```
	  */}
      <div className="min-h-full flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <img
              className="mx-auto h-12 w-auto"
              src="/images/NIL-n-c-350x350.png"
              alt="New Internet Labs logo"
            />
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Connect your Stacks Wallet
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Or{" "}
              <a
                href="https://www.newinternetlabs.com/bns/"
                target="_blank"
                rel="noreferrer"
                className="font-medium text-indigo-600 hover:text-indigo-500"
              >
                learn more about BNS.
              </a>
            </p>
          </div>
          <div className="mt-8 space-y-6">
            <div>
              <button
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                onClick={() => authenticate()}
              >
                <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                  <LockClosedIcon
                    className="h-5 w-5 text-indigo-500 group-hover:text-indigo-400"
                    aria-hidden="true"
                  />
                </span>
                Connect
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SignIn;
