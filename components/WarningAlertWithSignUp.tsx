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
            This is a pre-Stacks 2.0 legacy name. Please upgrade it so that you
            can continue to use it.
          </p>
        </div>
      </div>
    </div>
  );
};

export default WarningAlertWithSignUp;
