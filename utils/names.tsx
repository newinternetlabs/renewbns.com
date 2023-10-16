import {
  contractRead,
  contractWrite,
  contractWriteSponsored,
  CONTRACT_ADDRESS,
  CONTRACT_NAME,
} from "./contracts";
import {
  noneCV,
  uintCV,
  bufferCVFromString,
  makeStandardNonFungiblePostCondition,
  NonFungibleConditionCode,
  standardPrincipalCV,
  bufferCV,
  someCV,
  tupleCV,
  createAssetInfo,
  TransactionVersion,
} from "@stacks/transactions";

import { getStxAddress } from "@stacks/wallet-sdk";

const API_BASE_URL = "https://stacks-node-api.mainnet.stacks.co";

export const ACCOUNT_INDEX_LIMIT = 250;

export function isSubdomain(name: string) {
  return name.split(".").length > 2;
}

export async function getCurrentBlock() {
  return fetch(`${API_BASE_URL}/v2/info`).then((response) => {
    return response.json().then((json) => {
      return parseInt(json["stacks_tip_height"]);
    });
  });
}

export async function addressName(address: string) {
  let result = await contractRead("resolve-principal", [
    standardPrincipalCV(address),
  ]);
  console.log("resolve-principal");
  console.log(result);

  if (!result || !result.name || result.code?.value === "2013") return false;
  let nameResult;
  if (result.code) {
    // name from optional in error
    if (result.name.value.value) {
      nameResult = result.name.value.value;
    }
  } else {
    // name from ok
    nameResult = result;
  }
  if (!nameResult) {
    return false;
  }

  return (
    Buffer.from(nameResult.name.value.substr(2), "hex").toString("ascii") +
    "." +
    Buffer.from(nameResult.namespace.value.substr(2), "hex").toString("ascii")
  );
}

export async function resolveName(name: string) {
  console.log("resolveName");
  let tokens = name.split(".");
  let namespace = tokens[1];
  let label = tokens[0];
  let result = await contractRead("name-resolve", [
    bufferCVFromString(namespace),
    bufferCVFromString(label),
  ]);
  return result;
}

export async function renewName(name: string, price: number) {
  let tokens = name.split(".");
  let namespace = tokens[1];
  let label = tokens[0];
  console.log(`namespace: ${namespace}, label: ${label}`);
  console.log(price.toLocaleString("fullwide", { useGrouping: false }));
  return await contractWrite(
    "name-renewal",
    [
      bufferCVFromString(namespace),
      bufferCVFromString(label),
      uintCV(price.toLocaleString("fullwide", { useGrouping: false })),
      noneCV(),
      noneCV(),
    ],
    null
  );
}

export async function renewLegacyName(
  name: string,
  price: number,
  ownerAccount: any,
  walletAccount: any,
  ownerNonce: number,
  walletNonce: number,
  fee: number
) {
  let tokens = name.split(".");
  let namespace = tokens[1];
  let label = tokens[0];

  let ownerAddress = getStxAddress({
    account: ownerAccount,
    transactionVersion: TransactionVersion.Mainnet,
  });

  console.log(
    `renewLegacyName: namespace: ${namespace} label: ${label} existingOwner: ${ownerAddress}`
  );

  return contractWriteSponsored(
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
    ownerAccount,
    walletAccount,
    ownerNonce,
    walletNonce,
    fee
  );
}

/*
(define-public (name-transfer (namespace (buff 20))
							  (name (buff 48))
							  (new-owner principal)
							  (zonefile-hash (optional (buff 20))))
*/

export async function transferName(
  name: string,
  newOwner: string,
  zonefileHash: any,
  ownerAccount: any,
  ownerNonce: number,
  walletAccount: any,
  walletNonce: number,
  fee: number
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
    `transferName: namespace: ${namespace} label: ${label} existingOwner: ${ownerAddress} newOwner: ${newOwner} ownerNonce: ${ownerNonce} walletNonce: ${walletNonce}`
  );
  console.log(walletAccount);
  console.log(ownerAccount);

  return contractWriteSponsored(
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
    walletAccount,
    ownerNonce,
    walletNonce,
    fee
  );
}
