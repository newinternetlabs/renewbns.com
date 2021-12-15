import { XCircleIcon } from "@heroicons/react/solid";

const WarningAlertWithLink = (props: { message: string; link: string }) => {
  return (
    <div className="rounded-md bg-red-50 p-4">
      <div className="flex">
        <div className="flex-shrink-0">
          <XCircleIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
        </div>
        <div className="ml-3 flex-1 md:flex md:justify-between">
          <p className="text-sm text-red-700">{props.message}</p>
          <p className="mt-3 text-sm md:mt-0 md:ml-6">
            {props.link ? (
              <a
                href={props.link}
                className="whitespace-nowrap font-medium text-red-700 hover:text-red-600"
              >
                Details <span aria-hidden="true">&rarr;</span>
              </a>
            ) : null}
          </p>
        </div>
      </div>
    </div>
  );
};

export default WarningAlertWithLink;
