import { RefreshIcon, XIcon } from "@heroicons/react/outline";
import { Dialog } from "@headlessui/react";

export default function SecretKey(props) {
  function validColor(valid) {
    return valid ? "green" : "red";
  }
  return (
    <>
      <div className="sm:flex sm:items-start">
        <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-green-100 sm:mx-0 sm:h-10 sm:w-10">
          <RefreshIcon className="h-6 w-6 text-green-600" aria-hidden="true" />
        </div>
        <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
          <Dialog.Title
            as="h3"
            className="text-lg leading-6 font-medium text-gray-900"
          >
            Renew {props.name}
          </Dialog.Title>
          <div className="mt-2">
            <p className="text-sm text-gray-500 mb-4">
              To renew this name, you will need to enter the secret key for your
              wallet.
            </p>
            <textarea
              rows={4}
              name="comment"
              id="comment"
              className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
              value={props.secret}
              onChange={props.updateSecret}
            />
          </div>
        </div>
      </div>
      <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
        {props.validSecret ? (
          <button
            type="button"
            className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm`}
            onClick={(e) => {
              props.confirmUpgradeName(e);
            }}
          >
            {`Renew ${props.name}`}
          </button>
        ) : (
          <button
            type="button"
            className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm`}
            onClick={(e) => {
              props.confirmUpgradeName(e);
            }}
            disabled
          >
            Invalid Secret
          </button>
        )}
        <button
          type="button"
          className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm"
          onClick={(e) => props.closeModal(e)}
        >
          Cancel
        </button>
      </div>
    </>
  );
}
