import { CheckIcon, ExternalLinkIcon } from "@heroicons/react/outline";
import { Dialog } from "@headlessui/react";

export default function TransactionSent(props: {
  transaction: string;
  closeModal: Function;
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
          <div className="mt-4"></div>
        </div>
      </div>

      <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
        <a
          href={`https://explorer.stacks.co/txid/0x${props.transaction}`}
          className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:col-start-2 sm:text-sm items-center"
          target="_blank"
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
