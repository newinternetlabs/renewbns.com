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
  bufferCVFromString,
  callReadOnlyFunction,
  makeStandardSTXPostCondition,
  FungibleConditionCode,
  cvToJSON,
  standardPrincipalCV,
  AnchorMode,
  PostConditionMode,
} from "@stacks/transactions";

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
