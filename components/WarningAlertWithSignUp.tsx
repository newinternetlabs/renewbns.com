import { XCircleIcon } from "@heroicons/react/solid";

const WarningAlertWithSignUp = (props: { setShowNotifyModal: Function }) => {
  return (
    <div className="rounded-md bg-red-50 p-4">
      <div className="flex">
        <div className="flex-shrink-0">
          <XCircleIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
        </div>
        <div className="ml-3 flex-1 md:flex md:justify-between">
          <p className="text-sm text-red-700">
            This is a pre-Stacks 2.0 legacy name.{" "}
            <a
              className="font-medium text-red-700 hover:text-red-600 cursor-pointer underline"
              onClick={(e) => {
                e.preventDefault();
                props.setShowNotifyModal(true);
              }}
            >
              Sign up
            </a>{" "}
            to be notified when you can upgrade it for use with Stacks 2.0 apps.
          </p>
        </div>
      </div>
    </div>
  );
};

export default WarningAlertWithSignUp;
