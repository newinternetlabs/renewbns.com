import { Fragment, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { ExclamationIcon, XIcon } from "@heroicons/react/outline";
// import keychain, { deriveRootKeychainFromMnemonic } from "@stacks/keychain";
import { ChainID, getAddressFromPrivateKey } from "@stacks/transactions";
import { publicKeyToAddress, ecPairToHexString } from "@stacks/encryption";
// import { ECPair, bip32, networks } from "bitcoinjs-lib";
import { mnemonicToSeed } from "bip39";
import { fromBase58, fromSeed } from "bip32";
import { TransactionVersion } from "@stacks/transactions";
import { StacksMainnet } from "@stacks/network";
import {
  deriveWalletKeys,
  deriveAccount,
  getStxAddress,
  deriveLegacyConfigPrivateKey,
  DerivationType,
  selectStxDerivation,
} from "@stacks/wallet-sdk";

export default function SecretKeyModal(props) {
  const [open, setOpen] = useState(true);
  const [secret, setSecret] = useState("");
  const [validSecret, setValidSecret] = useState(false);
  const updateSecret = (event) => {
    console.log(validSecret);
    const phrase = event.target.value;
    setSecret((previousState) => {
      return phrase;
    });

    mnemonicToSeed(phrase)
      .then((rootPrivateKey) => {
        setValidSecret(() => {
          return true;
        });
        const rootNode1 = fromSeed(rootPrivateKey);
        deriveWalletKeys(rootNode1).then((derived) => {
          const rootNode = fromBase58(derived.rootKey);
          const account = deriveAccount({
            rootNode,
            index: 0,
            salt: derived.salt,
            stxDerivationType: DerivationType.Data,
          });

          const address = getStxAddress({
            account,
            transactionVersion: TransactionVersion.Mainnet,
          });

          console.log("address");
          console.log(address);
        });
      })
      .catch((error) => {
        console.log(error);
        setValidSecret(() => {
          return false;
        });
      });

    // keychain.Wallet.restore("12345678", phrase, ChainID.Mainnet)
    //   .then((restored) => {
    //     setValidSecret(() => {
    //       return true;
    //     });
    //     console.log("restored");
    //     console.log(restored);
    //     console.log("identities");
    //     console.log(restored.identities);
    //     console.log(`stxNodeKey: ${restored.identities[0].keyPair.stxNodeKey}`);
    //     const stxNode = bip32.fromBase58(
    //       restored.identities[0].keyPair.stxNodeKey,
    //       networks.bitcoin
    //     );
    //     const pair = ECPair.fromWIF(stxNode.toWIF());
    //     console.log(getAddressFromPrivateKey(ecPairToHexString(pair)));
    //     console.log("stx wallet address");
    //     console.log(restored.getSigner().getSTXAddress());
    //   })
    //   .catch((error) => {
    //     console.log(error);
    //     setValidSecret(() => {
    //       return false;
    //     });
    //   });
  };

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog
        as="div"
        className="fixed z-10 inset-0 overflow-y-auto"
        onClose={setOpen}
      >
        <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Dialog.Overlay className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
          </Transition.Child>

          {/* This element is to trick the browser into centering the modal contents. */}
          <span
            className="hidden sm:inline-block sm:align-middle sm:h-screen"
            aria-hidden="true"
          >
            &#8203;
          </span>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            enterTo="opacity-100 translate-y-0 sm:scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          >
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div className="hidden sm:block absolute top-0 right-0 pt-4 pr-4">
                <button
                  type="button"
                  className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  onClick={() => setOpen(false)}
                >
                  <span className="sr-only">Close</span>
                  <XIcon className="h-6 w-6" aria-hidden="true" />
                </button>
              </div>
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
                    Renew name
                  </Dialog.Title>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      To renew this name, you'll need to enter the secret key
                      for your wallet.
                    </p>
                    <textarea
                      rows={4}
                      name="comment"
                      id="comment"
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      value={secret}
                      onChange={updateSecret}
                    />
                  </div>
                </div>
              </div>
              <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={(e) => {
                    setOpen(false);
                    props.setSecretKey(e, secret);
                  }}
                  disabled={!validSecret}
                >
                  {validSecret ? "Generate renewal" : "Invalid Secret"}
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm"
                  onClick={() => setOpen(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
