import React from "react";
import { useAuth, useAccount } from "@micro-stacks/react";

export const withAuthHooksHOC = (Component: any) => {
  return (props: any) => {
    const { openAuthRequest, isRequestPending, signOut, isSignedIn } =
      useAuth();

    const {
      appPrivateKey,
      stxAddress,
      rawAddress,
      identityAddress,
      decentralizedID,
      profileUrl,
    } = useAccount();

    return (
      <Component
        openAuthRequest={openAuthRequest}
        isRequestPending={isRequestPending}
        signOut={signOut}
        isSignedIn={isSignedIn}
        appPrivateKey={appPrivateKey}
        stxAddress={stxAddress}
        rawAddress={rawAddress}
        identityAddress={identityAddress}
        decentralizedID={decentralizedID}
        profileUrl={profileUrl}
        {...props}
      />
    );
  };
};
