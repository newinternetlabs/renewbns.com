import { Fragment, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { XIcon, SearchIcon } from "@heroicons/react/outline";
import { mnemonicToSeed } from "bip39";
import { fromBase58, fromSeed } from "bip32";
import { TransactionVersion, getNonce } from "@stacks/transactions";
import SecretKey from "./SecretKey";
import { NETWORK, DEFAULT_FEE } from "../utils/contracts";
import { ECPair, payments } from "bitcoinjs-lib";
import {
  deriveWalletKeys,
  deriveAccount,
  getStxAddress,
  DerivationType,
} from "@stacks/wallet-sdk";

import {
  renewLegacyName,
  addressName,
  ACCOUNT_INDEX_LIMIT,
} from "../utils/names";

export default function SearchModal(props) {
  const [secret, setSecret] = useState("");
  const [validSecret, setValidSecret] = useState(false);
  const [ownerAccount, setOwnerAccount] = useState(null);
  const [walletAccount, setWalletAccount] = useState(null);
  const [transaction, setTransaction] = useState(null);
  const [fee, setFee] = useState(DEFAULT_FEE);
  const [ownerNonce, setOwnerNonce] = useState(0);
  const [walletNonce, setWalletNonce] = useState(0);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState(null);
  const [nameFound, setNameFound] = useState(false);

  const upgradeName = (event) => {
    event.preventDefault();
    console.log("upgradeName(): owner account");
    console.log(ownerAccount);
    setError(null);
    renewLegacyName(
      props.name,
      props.price,
      ownerAccount,
      walletAccount,
      ownerNonce,
      walletNonce,
      fee
    ).then((txn) => {
      console.log(txn);
      if (false && txn.error) {
        setError(txn.reason);
      } else {
        console.log(`transaction: ${txn.txid}`);
        setTransaction(txn.txid);
      }
    });
  };

  const confirmUpgradeName = (event) => {
    event.preventDefault();
    console.debug("confirmUpgradeName()");

    const ownerAddress = getStxAddress({
      account: ownerAccount,
      transactionVersion: TransactionVersion.Mainnet,
    });

    const walletAddress = getStxAddress({
      account: walletAccount,
      transactionVersion: TransactionVersion.Mainnet,
    });

    console.debug(
      `confirmUpgradeName: walletNonce ${walletNonce} ownerNonce ${ownerNonce}`
    );
    getNonce(walletAddress, NETWORK).then((nonce) => {
      setWalletNonce(`${nonce}`);
    });

    getNonce(ownerAddress, NETWORK).then((nonce) => {
      setOwnerNonce(`${nonce}`);
    });

    setShowConfirm(true);
  };

  const validColor = (valid) => {
    console.debug(`validColor: ${valid}`);
    return valid ? "green" : "red";
  };

  const closeModal = (event) => {
    event.preventDefault();
    console.debug("closeModal");
    props.setShowModal(false);
    setShowConfirm(false);
    setSecret("");
    setOwnerNonce(0);
    setWalletNonce(0);
    setFee(DEFAULT_FEE);
    setWalletAccount(null);
    setOwnerAccount(null);
    setError(null);
    setTransaction(null);
  };

  const updateSecret = (event) => {
    console.log("start updateSecret()");
    console.log(validSecret);
    const phrase = event.target.value;
    setSecret((previousState) => {
      return phrase;
    });

    mnemonicToSeed(phrase)
      .then((rootPrivateKey) => {
        console.log("mnemonicToSeed succeeded");
        const rootNode1 = fromSeed(rootPrivateKey);
        deriveWalletKeys(rootNode1).then((derived) => {
          const rootNode = fromBase58(derived.rootKey);

          /**** start loop ****/

          let found = false;
          let i = 0;
          let legacyOwnerAccount = null;
          let legacyOwnerAddress = null;
          let walletAccount = null;
          let walletAccountAddress = null;
          while (!found && i < ACCOUNT_INDEX_LIMIT) {
            legacyOwnerAccount = deriveAccount({
              rootNode,
              index: i,
              salt: derived.salt,
              stxDerivationType: DerivationType.Data,
            });

            const keyPair = ECPair.fromPrivateKey(
              Buffer.from(legacyOwnerAccount.stxPrivateKey.slice(0, 64), "hex")
            );
            const { address } = payments.p2pkh({ pubkey: keyPair.publicKey });
            walletAccount = deriveAccount({
              rootNode,
              index: i,
              salt: derived.salt,
              stxDerivationType: DerivationType.Wallet,
            });

            walletAccountAddress = getStxAddress({
              account: walletAccount,
              transactionVersion: TransactionVersion.Mainnet,
            });

            legacyOwnerAddress = getStxAddress({
              account: legacyOwnerAccount,
              transactionVersion: TransactionVersion.Mainnet,
            });

            console.log(
              `index: ${i} - derived address: ${walletAccountAddress} - target address: ${props.targetAddress} - stacks 1.0 identity address ${address}`
            );

            if (walletAccountAddress == props.targetAddress || i === props.targetIndex) {
              console.log(`Found account index #${i}.`);
              found = true;
            }
            i++;
          }

          /**** end loop ****/
          setValidSecret(() => {
            if (found) {
              addressName(legacyOwnerAddress).then((name) => {
                console.debug(`Name found: ${name} - ${legacyOwnerAddress}`);
                setNameFound(true);
                if (name) {
                  const legacy = true;
                  props.resolveAndAddName(name, legacy, walletAccountAddress);
                }
              });
              return true;
            } else {
              return false;
            }
          });
          setOwnerAccount(() => {
            return legacyOwnerAccount;
          });
          setWalletAccount(() => {
            return walletAccount;
          });
        });
      })
      .catch((error) => {
        console.log(error);
        setValidSecret(() => {
          return false;
        });
      });
  };

  return (
    <Transition.Root show={props.showModal} as={Fragment}>
      <Dialog
        as="div"
        className="fixed z-10 inset-0 overflow-y-auto"
        onClose={() => props.setShowModal(false)}
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
                  onClick={(e) => closeModal(e)}
                >
                  <span className="sr-only">Close {walletNonce}</span>
                  <XIcon className="h-6 w-6" aria-hidden="true" />
                </button>
              </div>

              <div className="sm:flex sm:items-start">
                <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-green-100 sm:mx-0 sm:h-10 sm:w-10">
                  <SearchIcon
                    className="h-6 w-6 text-green-600"
                    aria-hidden="true"
                  />
                </div>
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                  <Dialog.Title
                    as="h3"
                    className="text-lg leading-6 font-medium text-gray-900"
                  >
                    Search for Stacks 1.0 names
                  </Dialog.Title>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500 mb-4">
                      Enter your secret key to find Stacks 1.0 names associated
                      with this account.
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
                {validSecret ? (
                  <span className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    Searching...
                  </span>
                ) : (
                  <span className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-red-100 text-red-800">
                    Invalid secret
                  </span>
                )}
              </div>
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
