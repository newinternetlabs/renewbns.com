import React from "react";
import * as MicroStacks from "@micro-stacks/react";

export const withMicroStacksClientProviderHOC = (Component: any) => {
  return (props: any) => {
    return (
      <MicroStacks.ClientProvider
        appName="renewbns.com"
        appIconUrl="https://renewbns.com/images/NIL-n-c-350x350.png"
      >
        <Component {...props} />
      </MicroStacks.ClientProvider>
    );
  };
};
