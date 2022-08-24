import React, { useState, useEffect } from "react";
import Head from "next/head";
import SignIn from "../components/SignIn";
import App from "../components/App";
import Footer from "../components/Footer";
import Terms from "../components/Terms";
import { NETWORK } from "../utils/contracts";
import { useAuth, useAccount } from "@micro-stacks/react";
import { withMicroStacksClientProviderHOC } from "../components/withMicroStacksClientProviderHOC";

import {
  getCurrentBlock,
  addressName,
  resolveName,
  renewName,
  isSubdomain,
} from "../utils/names";
/**
  Used to disable server-side rendering on this page
*/
function SafeHydrate({ children }) {
  return (
    <div suppressHydrationWarning>
      {typeof window === "undefined" ? null : children}
    </div>
  );
}

const Index = (props) => {
  const {
    appPrivateKey,
    stxAddress,
    rawAddress,
    identityAddress,
    decentralizedID,
    profileUrl,
  } = useAccount();

  const { openAuthRequest, isRequestPending, signOut, isSignedIn } = useAuth();
  const [names, setNames] = useState([]);
  const [currentBlock, setCurrentBlock] = useState(0);
  const [legacy, setLegacy] = useState(false);
  const [address, setAddress] = useState("");
  const [price, setPrice] = useState(0);
  const [secretKey, setSecretKey] = useState(null);
  const [showSecretKeyModal, setShowSecretKeyModal] = useState(false);
  const [walletAddress, setWalletAddress] = useState(null);
  const [showTransactionSentModal, setShowTransactionSentModal] =
    useState(false);
  const [transaction, setTransaction] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [signInError, setSignInError] = useState(null);
  const [signingIn, setSigningIn] = useState(false);
  const [subdomain, setSubdomain] = useState(false);

  const startSignIn = () => {
    const onFinish = () => {
      console.debug("Stacks Connect onFinish");
      window.location.reload();
    };

    const onCancel = () => {
      console.debug("Stacks Connect onCancel");
      alert("Authentication was canceled");
    };
    setSigningIn(true);
    openAuthRequest();
  };

  const handleSignOut = (e) => {
    e.preventDefault();
    setUserData(null);
    signOut();
  };

  const agree = () => {
    setAgreedToTerms(true);
  };

  const renew = (e, name, price) => {
    e.preventDefault();
    renewName(name, price);
  };

  const beginLegacyRenew = (e) => {
    e.preventDefault();
    console.log("Start legacy renew");
    this.setState({ secretKey: null, showSecretKeyModal: true });
  };

  const upgradeName = (e, name, walletAddress, zonefileHash) => {
    e.preventDefault();
    console.log("Upgrade name");
    this.setState({ secretKey: null, showSecretKeyModal: true });
  };

  const resolveAndAddName = (name, legacy) => {
    resolveName(name).then((result) => {
      console.log(result);
      fetch(`${NETWORK.coreApiUrl}/v2/prices/names/` + name).then(
        (response) => {
          return response.json().then((json) => {
            let price = parseInt(json.amount);
            let zonefileHash = Buffer.from(
              result["zonefile-hash"].value.substr(2),
              "hex"
            );
            this.setState({
              names: [
                {
                  name,
                  address: result.owner.value,
                  data: result,
                  legacy,
                  price,
                  zonefileHash,
                  subdomain: isSubdomain(name),
                },
              ],
            });
          });
        }
      );
    });
  };

  useEffect(() => {
    console.log("componentDidMount (effect)");
    if (isSignedIn) {
      setSigningIn(false);
      console.log("isUserSignedIn");
      let address = stxAddress();
      console.log(`setting wallet address: ${address}`);
      setAddress(address);
      setWalletAddress(address);
      addressName(address).then((name) => {
        let legacy = false;
        // try legacy name
        if (name === false && userData.username) {
          name = userData.username;
          console.log(`trying legacy name: ${name}`);
          legacy = true;
        }

        if (!name) {
          console.log(
            "no names owned by wallet address or legacy names passed by userData.username"
          );
          return;
        }

        console.log(`resolveName(${name})`);
        resolveAndAddName(name, legacy);
      });

      this.setState({ userData: userSession.loadUserData() });

      getCurrentBlock().then((currentBlock) => {
        setCurrentBlock(currentBlock);
      });
    }
  }, []);

  return (
    <SafeHydrate>
      <div>
        <Head>
          <title>Renew your BNS name</title>
        </Head>
        <main>
          {!isSignedIn ? (
            <SignIn startSignIn={startSignIn} signingIn={signingIn} />
          ) : (
            <>
              {agreedToTerms ? (
                <App
                  userData={userData}
                  signOut={handleSignOut}
                  names={names}
                  renew={renew}
                  currentBlock={currentBlock}
                  address={address}
                  walletAddress={walletAddress}
                  setSecretKey={setSecretKey}
                  startLegacyRenew={startLegacyRenew}
                  showSecretKeyModal={showSecretKeyModal}
                  setShowSecretKeyModal={setShowSecretKeyModal}
                  upgradeName={upgradeName}
                  showTransactionSentModal={showTransactionSentModal}
                  setShowTransactionSentModalValue={
                    setShowTransactionSentModalValue
                  }
                  setTransactionValue={setTransactionValue}
                  transaction={transaction}
                  beginLegacyRenew={beginLegacyRenew}
                  resolveAndAddName={resolveAndAddName}
                />
              ) : (
                <Terms agree={agree} />
              )}
            </>
          )}
        </main>

        <Footer />
      </div>
    </SafeHydrate>
  );
};

export default withMicroStacksClientProviderHOC(Index);
