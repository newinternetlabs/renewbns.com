import { AppConfig, UserSession, showConnect } from "@stacks/connect-react";
import { Person } from "@stacks/profile";
import { NETWORK } from "./contracts";
import { createClient } from "@micro-stacks/client";

export const stacksClient = createClient({
  appName: "renewbns.com",
  appIconUrl: "https://renewbns.com/images/NIL-n-c-350x350.png",
});

const appConfig = new AppConfig(
  [],
  "https://renewbns.com",
  "",
  "/manifest.json",
  NETWORK.bnsLookupUrl
);

console.debug(`appConfig: using stacks node: ${appConfig.coreNode}`);

export var userSession = new UserSession({ appConfig });

export const stacksConnectOptions = {
  appDetails: {
    name: "renewbns.com",
    icon: "https://renewbns.com/images/NIL-n-c-350x350.png",
  },
  userSession: userSession,
  onFinish: () => {
    console.debug("Stacks Connect onFinish");
    window.location.reload();
  },
  onCancel: () => {
    console.debug("Stacks Connect onCancel");
    alert(
      "Stacks Connect was unable to authenticate with your wallet. Check the console for more information."
    );
  },
};

export async function authenticate(onFinish, onCancel) {
  if (!stacksClient.hasSession) await stacksClient.authenticate();
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

/**********************************************************************/
