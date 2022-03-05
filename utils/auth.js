import { AppConfig, UserSession, showConnect } from "@stacks/connect-react";
import { Person } from "@stacks/profile";
import { NETWORK } from "./contracts";

const appConfig = new AppConfig(
  [],
  "https://renewbns.com",
  "",
  "/manifest.json",
  NETWORK.bnsLookupUrl
);

console.debug(`appConfig: using stacks node: ${appConfig.coreNode}`);

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

export var userSession = new UserSession({ appConfig });

export function authenticate() {
  showConnect({
    appDetails: {
      name: "BNS Renew",
      icon: window.location.origin + "/images/NIL-n-c-350x350.png",
    },
    redirectTo: "/",
    onFinish: () => {
      console.log("Stacks Connect onFinish");
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

/**********************************************************************/
