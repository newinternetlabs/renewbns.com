import { ExclamationIcon, XIcon } from "@heroicons/react/outline";
import { Dialog } from "@headlessui/react";
import { getStxAddress } from "@stacks/wallet-sdk";
import { TransactionVersion } from "@stacks/transactions";
import WarningAlertWithLink from "./WarningAlertWithLink";

export default function NonceAndFeeConfirmation(props) {
  function ownerAddress() {
    return getStxAddress({
      account: props.ownerAccount,
      transactionVersion: TransactionVersion.Mainnet,
    });
  }

  function walletAddress() {
    return getStxAddress({
      account: props.walletAccount,
      transactionVersion: TransactionVersion.Mainnet,
    });
  }
  return (
    <>
      <div className="sm:flex sm:items-start">
        <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
          <ExclamationIcon
            className="h-6 w-6 text-red-600"
            aria-hidden="true"
          />
        </div>
        <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
          <Dialog.Title
            as="h3"
            className="text-lg leading-6 font-medium text-gray-900"
          >
            Confirm upgrade
          </Dialog.Title>
          <div className="mt-2">
            {props.error ? (
              <WarningAlertWithLink
                message={`Transaction rejected: ${props.error}`}
              />
            ) : null}
            <div className="isolate -space-y-px rounded-md shadow-sm">
              <div className="relative border border-gray-300 rounded-md rounded-b-none px-3 py-2 focus-within:z-10 focus-within:ring-1 focus-within:ring-indigo-600 focus-within:border-indigo-600">
                <label
                  htmlFor="name"
                  className="block text-xs font-medium text-gray-900"
                >
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  className="block w-full border-0 p-0 text-gray-900 placeholder-gray-500 focus:ring-0 sm:text-sm"
                  placeholder="Name"
                  value={props.name}
                  disabled
                  readOnly
                />
              </div>
              <div className="relative border border-gray-300 rounded-md rounded-t-none rounded-b-none px-3 py-2 focus-within:z-10 focus-within:ring-1 focus-within:ring-indigo-600 focus-within:border-indigo-600">
                <label
                  htmlFor="current-owner"
                  className="block text-xs font-medium text-gray-900"
                >
                  Current owner
                </label>
                <input
                  type="text"
                  name="current-owner"
                  id="current-owner"
                  className="block w-full border-0 p-0 text-gray-900 placeholder-gray-500 focus:ring-0 sm:text-sm"
                  placeholder="Current owner"
                  value={ownerAddress()}
                  disabled
                  readOnly
                />
              </div>
              <div className="relative border border-gray-300 rounded-md rounded-t-none rounded-b-none px-3 py-2 focus-within:z-10 focus-within:ring-1 focus-within:ring-indigo-600 focus-within:border-indigo-600">
                <label
                  htmlFor="current-owner"
                  className="block text-xs font-medium text-gray-900"
                >
                  Current owner nonce
                </label>
                <input
                  type="number"
                  name="current-owner"
                  id="current-owner"
                  className="block w-full border-0 p-0 text-gray-900 placeholder-gray-500 focus:ring-0 sm:text-sm"
                  placeholder="Current owner nonce"
                  value={props.ownerNonce}
                  onChange={(e) => {
                    props.setOwnerNonce(e.target.value);
                  }}
                  min="0"
                />
              </div>
              <div className="relative border border-gray-300 rounded-md rounded-t-none rounded-b-none px-3 py-2 focus-within:z-10 focus-within:ring-1 focus-within:ring-indigo-600 focus-within:border-indigo-600">
                <label
                  htmlFor="wallet-address"
                  className="block text-xs font-medium text-gray-900"
                >
                  Wallet & new owner address
                </label>
                <input
                  type="text"
                  name="wallet-addressr"
                  id="wallet-address"
                  className="block w-full border-0 p-0 text-gray-900 placeholder-gray-500 focus:ring-0 sm:text-sm"
                  placeholder="Wallet address"
                  value={walletAddress()}
                  disabled
                  readOnly
                />
              </div>
              <div className="relative border border-gray-300 rounded-md rounded-t-none rounded-b-none px-3 py-2 focus-within:z-10 focus-within:ring-1 focus-within:ring-indigo-600 focus-within:border-indigo-600">
                <label
                  htmlFor="wallet-nonce"
                  className="block text-xs font-medium text-gray-900"
                >
                  Wallet nonce
                </label>
                <input
                  type="number"
                  name="wallet-nonce"
                  id="wallet-nonce"
                  className="block w-full border-0 p-0 text-gray-900 placeholder-gray-500 focus:ring-0 sm:text-sm"
                  placeholder="Wallet nonce"
                  value={props.walletNonce}
                  onChange={(e) => {
                    props.setWalletNonce(e.target.value);
                  }}
                  min="0"
                />
              </div>
              <div className="relative border border-gray-300 rounded-md rounded-t-none px-3 py-2 focus-within:z-10 focus-within:ring-1 focus-within:ring-indigo-600 focus-within:border-indigo-600">
                <label
                  htmlFor="fee"
                  className="block text-xs font-medium text-gray-900"
                >
                  Fee (Micro STX)
                </label>
                <input
                  type="number"
                  name="fee"
                  id="fee"
                  className="block w-full border-0 p-0 text-gray-900 placeholder-gray-500 focus:ring-0 sm:text-sm"
                  placeholder="Fee"
                  value={props.fee}
                  onChange={(e) => {
                    props.setFee(e.target.value);
                  }}
                  min="10000"
                />
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-2 mb-2">
              This app will generate a transaction to transfer ownership of the
              name to the same account that holds your funds in your Stacks
              wallet.
            </p>
          </div>
        </div>
      </div>
      <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
        <button
          type="button"
          className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm`}
          onClick={(e) => {
            props.upgradeName(e);
          }}
        >
          Confirm upgrade
        </button>
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
