import {
  AppConfig,
  UserSession,
  showConnect,
  useConnect,
} from "@stacks/connect-react";
import { Person } from "@stacks/profile";
import {
  uintCV,
  bufferCVFromString,
  bufferCV,
  someCV,
  callReadOnlyFunction,
  makeStandardSTXPostCondition,
  makeStandardNonFungiblePostCondition,
  FungibleConditionCode,
  NonFungibleConditionCode,
  createAssetInfo,
  PostConditionMode,
  cvToJSON,
  hash160,
  standardPrincipalCV,
  tupleCV,
} from "@stacks/transactions";
import { StacksMainnet, StacksTestnet, StacksMocknet } from "@stacks/network";
// TODO we don't need these permissions
const appConfig = new AppConfig([]);

export const CONTRACT_ADDRESS = "SP000000000000000000002Q6VF78";
export const CONTRACT_NAME = "bns";

export const NETWORK = new StacksMainnet();

export const userSession = new UserSession({ appConfig });

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
