import {
  AppConfig,
  UserSession,
  showConnect,
  openContractCall,
} from "@stacks/connect-react";
import { Person } from "@stacks/profile";
import {
  noneCV,
  uintCV,
  standardPrincipalCVFromAddress,
  bufferCVFromString,
  callReadOnlyFunction,
  makeStandardSTXPostCondition,
  makeStandardNonFungiblePostCondition,
  FungibleConditionCode,
  NonFungibleConditionCode,
  cvToJSON,
  standardPrincipalCV,
  AnchorMode,
  PostConditionMode,
  makeContractCall,
  sponsorTransaction,
  broadcastTransaction,
  bufferCV,
  someCV,
  tupleCV,
  createAssetInfo,
  TransactionVersion,
  getNonce,
} from "@stacks/transactions";

import { getStxAddress } from "@stacks/wallet-sdk";

import BN from "bn.js";

import { StacksMainnet } from "@stacks/network";
const appConfig = new AppConfig([]);

export const CONTRACT_ADDRESS = "SP000000000000000000002Q6VF78";
export const CONTRACT_NAME = "bns";
export const stacksConnectOptions = {
  appDetails: {
    name: "renewbns.com",
    icon:
      (process.browser ? document.location.origin : "") +
      "/images/NIL-n-c-350x350.png",
  },
  userSession: userSession,
  onFinish: () => {
    userSession.user_data = userSession.loadUserData();
    const token = decodeToken(userSession.user_data.authResponseToken);
    userSession.user_data.profile_url =
      token && token.payload && token.payload.profile_url;
    userSession.signed_in = true;
    if (!userSession.user_data) userSession.user_data = {};
    userSession.gaia = gaia_storage;
  },
};

export const NETWORK = new StacksMainnet();

export var userSession = new UserSession({ appConfig });

export function authenticate() {
  showConnect({
    appDetails: {
      name: "BNS Renew",
      icon: window.location.origin + "/images/NIL-n-c-350x350.png",
    },
    redirectTo: "/names",
    onFinish: () => {
      window.location.reload();
    },
    userSession: userSession,
  });
}

export function getUserData() {
  return userSession.loadUserData();
}

export function getPerson() {
  return new Person(getUserData().profile);
}

export function stxAddress() {
  let userData = getUserData();
  return (
    (userData &&
      userData.profile &&
      userData.profile.stxAddress &&
      userData.profile.stxAddress.mainnet) ||
    ""
  );
}

async function contractRead(func, args) {
  return cvToJSON(
    await callReadOnlyFunction({
      userSession: userSession,
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: func,
      functionArgs: args,
      validateWithAbi: true,
      network: NETWORK,
      senderAddress: CONTRACT_ADDRESS,
    })
  ).value.value;
}

export async function addressName(address) {
  let result = await contractRead("resolve-principal", [
    standardPrincipalCV(address),
  ]);
  console.log("resolve-principal");
  console.log(result);
  if (!result || !result.name || !result.name.value) return false;
  return (
    Buffer.from(result.name.value.substr(2), "hex").toString("ascii") +
    "." +
    Buffer.from(result.namespace.value.substr(2), "hex").toString("ascii")
  );
}

export async function resolveName(name) {
  console.log("resolveName");
  let tokens = name.split(".");
  let namespace = tokens[1];
  let label = tokens[0];
  let result = await contractRead("name-resolve", [
    bufferCVFromString(namespace),
    bufferCVFromString(label),
  ]);
  return result !== 2013 ? result : false;
}

async function contractWrite(func, args, postConditions, attachment) {
  let address = stxAddress();
  if (!address) throw Error("Not signed in");
  if (!Array.isArray(postConditions))
    postConditions = typeof postConditions === "number" &&
      postConditions > 0 && [
        makeStandardSTXPostCondition(
          address,
          FungibleConditionCode.Equal,
          new BN(postConditions)
        ),
      ];
  return new Promise((resolve, reject) => {
    openContractCall({
      stxAddress: address,
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: func,
      functionArgs: args,
      validateWithAbi: true,
      network: NETWORK,
      anchorMode: AnchorMode.Any,
      postConditions: postConditions,
      attachment: undefined,
      appDetails: stacksConnectOptions.appDetails,
      onFinish: resolve,
    });
  });
}

export async function renewName(name, price) {
  let tokens = name.split(".");
  let namespace = tokens[1];
  let label = tokens[0];
  console.log(`namespace: ${namespace}, label: ${label}`);
  return await contractWrite(
    "name-renewal",
    [
      bufferCVFromString(namespace),
      bufferCVFromString(label),
      uintCV(price),
      noneCV(),
      noneCV(),
    ],
    null,
    null
  );
}

/*
(define-public (name-transfer (namespace (buff 20))
                              (name (buff 48))
                              (new-owner principal)
                              (zonefile-hash (optional (buff 20))))
*/

export async function transferName(
  name,
  newOwner,
  zonefileHash,
  ownerAccount,
  walletAccount
) {
  let tokens = name.split(".");
  let namespace = tokens[1];
  let label = tokens[0];

  let ownerAddress = getStxAddress({
    account: ownerAccount,
    transactionVersion: TransactionVersion.Mainnet,
  });

  let assetName = tupleCV({
    name: bufferCVFromString(label),
    namespace: bufferCVFromString(namespace),
  });
  let asset = createAssetInfo(CONTRACT_ADDRESS, CONTRACT_NAME, "names");

  console.log(
    `transferName: namespace: ${namespace} label: ${label} existingOwner: ${ownerAddress} newOwner: ${newOwner}`
  );

  return await contractLegacyWrite(
    "name-transfer",
    [
      bufferCVFromString(namespace),
      bufferCVFromString(label),
      standardPrincipalCV(newOwner),
      zonefileHash ? someCV(bufferCV(zonefileHash)) : noneCV(),
    ],
    [
      makeStandardNonFungiblePostCondition(
        ownerAddress,
        NonFungibleConditionCode.DoesNotOwn,
        asset,
        assetName
      ),
    ],
    null,
    ownerAccount,
    walletAccount
  );
}

/**********************************************************************/

async function contractLegacyWrite(
  func,
  args,
  postConditions,
  attachment,
  owner,
  wallet
) {
  let ownerAddress = getStxAddress({
    account: owner,
    transactionVersion: TransactionVersion.Mainnet,
  });
  // if (!Array.isArray(postConditions))
  //   postConditions = typeof postConditions === "number" &&
  //     postConditions > 0 && [
  //       makeStandardSTXPostCondition(
  //         address,
  //         FungibleConditionCode.Equal,
  //         new BN(postConditions)
  //       ),
  //     ];
  console.log("calling makeContractCall()");

  const options = {
    stxAddress: ownerAddress,
    senderKey: owner.stxPrivateKey,
    sponsored: true,
    nonce: new BN(0), // TODO - get this from api
    // fee: new BN(100000), // TODO - dynamically set this
    contractAddress: CONTRACT_ADDRESS,
    contractName: CONTRACT_NAME,
    functionName: func,
    functionArgs: args,
    validateWithAbi: true,
    network: NETWORK,
    anchorMode: AnchorMode.Any,
    postConditions: postConditions,
    attachment,
  };

  console.log(options);

  const tx = await makeContractCall(options);
  console.log("makeContractCall() resolved:");
  console.log(tx);

  const completedTransaction = await sponsorTransaction({
    transaction: tx,
    fee: new BN(100000), // TODO - dynamically set this
    sponsorPrivateKey: wallet.stxPrivateKey,
    sponsorNonce: new BN(0), // TODO - get this from api
  });

  const legacyOwnerAddress = getStxAddress({
    account: owner,
    transactionVersion: TransactionVersion.Mainnet,
  });

  const walletAccountAddress = getStxAddress({
    account: wallet,
    transactionVersion: TransactionVersion.Mainnet,
  });

  console.log(
    `completed transaction: wallet: ${walletAccountAddress} owner: ${legacyOwnerAddress}`
  );
  console.log(completedTransaction);

  /*
   Handle nonce error
   {"error":"transaction rejected","reason":"ConflictingNonceInMempool","txid":"aa0c597639baedf120291fbd4a30a3996590b1d79bb60bca011346e6a05390bf"}
  */

  return broadcastTransaction(completedTransaction, NETWORK);

  //return broadcastTransaction(tx, NETWORK);
  // console.log("Broadcasted:");
  // console.log(result);
  // return result;
  // return new Promise((resolve, reject) => {
  //   openContractCall({
  //     stxAddress: address,
  //     contractAddress: CONTRACT_ADDRESS,
  //     contractName: CONTRACT_NAME,
  //     functionName: func,
  //     functionArgs: args,
  //     validateWithAbi: true,
  //     network: NETWORK,
  //     anchorMode: AnchorMode.Any,
  //     postConditions: postConditions,
  //     attachment: undefined,
  //     appDetails: stacksConnectOptions.appDetails,
  //     onFinish: resolve,
  //   });
  // });
}

export async function renewLegacyName(name, owner, wallet, price) {
  let tokens = name.split(".");
  let namespace = tokens[1];
  let label = tokens[0];
  console.log(`namespace: ${namespace}, label: ${label}`);
  return await contractLegacyWrite(
    "name-renewal",
    [
      bufferCVFromString(namespace),
      bufferCVFromString(label),
      uintCV(price),
      noneCV(),
      noneCV(),
    ],
    null,
    null,
    owner,
    wallet
  );
}
export function deriveLegacyOwnerKey() {}
