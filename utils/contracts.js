import { openContractCall } from "@stacks/connect-react";
import {
  callReadOnlyFunction,
  makeStandardSTXPostCondition,
  FungibleConditionCode,
  cvToJSON,
  AnchorMode,
  makeContractCall,
  sponsorTransaction,
  broadcastTransaction,
  TransactionVersion,
} from "@stacks/transactions";

import { stxAddress, stacksConnectOptions } from "../utils/auth";

import { getStxAddress } from "@stacks/wallet-sdk";

import BN from "bn.js";

import { userSession } from "./auth";

import { StacksMainnet } from "@stacks/network";

export const NETWORK = new StacksMainnet();
export const DEFAULT_FEE = 100000; // 0.1 STX
export const CONTRACT_ADDRESS = "SP000000000000000000002Q6VF78";
export const CONTRACT_NAME = "bns";

export async function contractRead(func, args) {
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

export async function contractWrite(func, args, postConditions, attachment) {
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
  return new Promise((resolve) => {
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
      attachment: attachment
        ? Buffer.from(attachment, "binary").toString("hex")
        : undefined,
      appDetails: stacksConnectOptions.appDetails,
      onFinish: resolve,
    });
  });
}

export async function contractWriteSponsored(
  func,
  args,
  postConditions,
  attachment,
  owner,
  wallet,
  ownerNonce,
  walletNonce,
  fee
) {
  const ownerAddress = getStxAddress({
    account: owner,
    transactionVersion: TransactionVersion.Mainnet,
  });

  const walletAddress = getStxAddress({
    account: wallet,
    transactionVersion: TransactionVersion.Mainnet,
  });

  // const nextOwnerNonce = await getNonce(ownerAddress, NETWORK);
  // const nextWalletNonce = await getNonce(walletAddress, NETWORK);
  // console.log(
  //   `nextOwnerNonce: ${nextOwnerNonce} - nextWalletNonce: ${nextWalletNonce}`
  // );

  console.log("calling makeContractCall()");

  const options = {
    stxAddress: ownerAddress,
    senderKey: owner.stxPrivateKey,
    sponsored: true,
    nonce: new BN(ownerNonce),
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
    fee: new BN(fee),
    sponsorPrivateKey: wallet.stxPrivateKey,
    sponsorNonce: new BN(walletNonce),
  });

  console.log(
    `completed transaction: wallet: ${walletAddress} owner: ${ownerAddress}`
  );
  console.log(completedTransaction);

  /*
   Handle nonce error
   {"error":"transaction rejected","reason":"ConflictingNonceInMempool","txid":"aa0c597639baedf120291fbd4a30a3996590b1d79bb60bca011346e6a05390bf"}
  */

  // disabled for testing
  return broadcastTransaction(completedTransaction, NETWORK);
}
