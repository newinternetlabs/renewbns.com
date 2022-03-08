import {
  CheckIcon,
  ExternalLinkIcon,
  MailIcon,
} from "@heroicons/react/outline";
import { Dialog } from "@headlessui/react";

export default function TransactionSent(props: {
  transaction: string;
  closeModal: Function;
  setShowNotifyModal: Function;
}) {
  return (
    <>
      <div className="sm:flex sm:items-start">
        <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-green-100 sm:mx-0 sm:h-10 sm:w-10">
          <CheckIcon className="h-6 w-6 text-green-600" aria-hidden="true" />
        </div>
        <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
          <Dialog.Title
            as="h3"
            className="text-lg leading-6 font-medium text-gray-900"
          >
            Transaction sent
          </Dialog.Title>
          <div className="mt-4 text-sm text-gray-500">
            The network is processing your renewal. Refresh the page after the
            transaction confirms to see your new expiration date.
          </div>
        </div>
      </div>

      <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
        <button
          type="button"
          className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm`}
          onClick={(event) => {
            props.setShowNotifyModal(true);
            props.closeModal(event);
          }}
        >
          <MailIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
          Sign up for BNS updates
        </button>
        <a
          href={`https://explorer.stacks.co/txid/0x${props.transaction}`}
          className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm"
          target="_blank"
          rel="noreferrer"
        >
          View transaction
          <ExternalLinkIcon
            className="ml-2 -mr-0.5 h-4 w-4"
            aria-hidden="true"
          />
        </a>
      </div>
    </>
  );
}
