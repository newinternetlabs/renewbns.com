import React from "react";
import Head from "next/head";
import SignIn from "../components/SignIn";
import App from "../components/App";
import Footer from "../components/Footer";
import Terms from "../components/Terms";
import { NETWORK } from "../utils/contracts";
import { userSession, stxAddress, authenticate } from "../utils/auth";
import { makeZoneFile, parseZoneFile } from "zone-file";

import {
  getCurrentBlock,
  addressName,
  resolveName,
  renewName,
  isSubdomain,
  fetchZonefile,
  updateName,
  ZONEFILE_TEMPLATE,
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

class Index extends React.Component {
  constructor(props) {
    super(props);
    this.handleSignOut = this.handleSignOut.bind(this);
    this.renew = this.renew.bind(this);
    this.setSecretKey = this.setSecretKey.bind(this);
    this.setShowSecretKeyModal = this.setShowSecretKeyModal.bind(this);
    this.upgradeName = this.upgradeName.bind(this);
    this.setShowTransactionSentModalValue =
      this.setShowTransactionSentModalValue.bind(this);
    this.setTransactionValue = this.setTransactionValue.bind(this);
    this.beginLegacyRenew = this.beginLegacyRenew.bind(this);
    this.resolveAndAddName = this.resolveAndAddName.bind(this);
    this.agree = this.agree.bind(this);
    this.startSignIn = this.startSignIn.bind(this);
    this.setLocalZonefile = this.setLocalZonefile.bind(this);
    this.publishZonefile = this.publishZonefile.bind(this);
  }
  state = {
    userData: null,
    names: [],
    currentBlock: 0,
    legacy: false,
    address: "",
    price: 0,
    secretKey: null,
    showSecretKeyModal: false,
    walletAddress: null,
    showTransactionSentModal: false,
    transaction: "",
    agreedToTerms: false,
    signInError: null,
    signingIn: false,
    subdomain: false,
    localZonefile: "",
  };

  startSignIn() {
    const onFinish = () => {
      console.debug("Stacks Connect onFinish");
      window.location.reload();
    };

    const onCancel = () => {
      console.debug("Stacks Connect onCancel");
      alert("Authentication was canceled");
    };
    this.setState({ signingIn: true });
    authenticate().catch((error) => {
      console.error("Stacks Connect error caught");
      console.error(error);
      alert(
        "Stacks Connect encountered an error signing in with your account."
      );
    });
  }

  handleSignOut(e) {
    e.preventDefault();
    this.setState({ userData: null });
    userSession.signUserOut(window.location);
  }

  agree() {
    this.setState({ agreedToTerms: true });
  }

  setShowSecretKeyModal(value) {
    this.setState({ showSecretKeyModal: value });
  }

  setTransactionValue(value) {
    console.log(`setTransactionValue(${value})`);
    this.setState({ transaction: value });
  }

  setShowTransactionSentModalValue(value) {
    this.setState({ showTransactionSentModal: value });
  }

  renew(e, name, price) {
    e.preventDefault();
    renewName(name, price);
  }

  beginLegacyRenew(e) {
    e.preventDefault();
    console.log("Start legacy renew");
    this.setState({ secretKey: null, showSecretKeyModal: true });
  }

  upgradeName(e, name, walletAddress, zonefileHash) {
    e.preventDefault();
    console.log("Upgrade name");
    this.setState({ secretKey: null, showSecretKeyModal: true });
  }

  setSecretKey(e, secretKey) {
    e.preventDefault();
    console.log(secretKey);
  }

  componentDidMount() {
    let isSignInPending = false;
    try {
      isSignInPending = userSession.isSignInPending();
    } catch (error) {
      console.error("Stacks Connect isSignInPending error");
      console.error(error);
    }
    if (isSignInPending) {
      console.log("isSignInPending");
      userSession.handlePendingSignIn().then((userData) => {
        console.log("handlePendingSignIn");
        this.setState({ signingIn: false });

        window.history.replaceState({}, document.title, "/");
        this.setState({ userData: userData });
      });
    } else if (userSession.isUserSignedIn()) {
      this.setState({ signingIn: false });

      console.log("isUserSignedIn");
      let address = stxAddress();
      console.log(`setting wallet address: ${address}`);
      this.setState({ address, walletAddress: address });
      addressName(address).then((name) => {
        let legacy = false;
        // try legacy name
        if (name === false && this.state.userData.username) {
          name = this.state.userData.username;
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
        this.resolveAndAddName(name, legacy);
      });

      this.setState({ userData: userSession.loadUserData() });

      getCurrentBlock().then((currentBlock) => {
        this.setState({
          currentBlock,
        });
      });
    }
  }

  resolveAndAddName(name, legacy) {
    resolveName(name).then((resolveResult) => {
      console.debug("resolveAndAddName: resolveName: ");
      console.debug(resolveResult);
      fetch(`${NETWORK.coreApiUrl}/v2/prices/names/` + name).then(
        (response) => {
          return response.json().then((json) => {
            let price = parseInt(json.amount);
            let zonefileHash = Buffer.from(
              resolveResult["zonefile-hash"].value.substr(2),
              "hex"
            );

            fetchZonefile(name).then((zonefile) => {
              let parsedZonefile = parseZoneFile(zonefile);
              let nameObject = {
                name,
                address: resolveResult.owner.value,
                data: resolveResult,
                legacy,
                price,
                zonefileHash,
                zonefileRaw: zonefile,
                zonefile: parsedZonefile,
                subdomain: isSubdomain(name),
              };

              console.debug(nameObject);

              this.setState({
                localZonefile: makeZoneFile(parsedZonefile, ZONEFILE_TEMPLATE),
                names: [nameObject],
              });
            });
          });
        }
      );
    });
  }

  setLocalZonefile(zonefile) {
    console.debug("setLocalZonefile:");
    this.setState({
      localZonefile: makeZoneFile(parseZoneFile(zonefile), ZONEFILE_TEMPLATE),
    });
  }

  publishZonefile(name, zonefile) {
    console.debug("publishZonefile");
    updateName(name, zonefile);
  }
  render() {
    return (
      <SafeHydrate>
        <div>
          <Head>
            <title>Renew your BNS name</title>
          </Head>
          <main>
            {!userSession.isUserSignedIn() ? (
              <SignIn
                startSignIn={this.startSignIn}
                signingIn={this.state.signingIn}
              />
            ) : (
              <>
                {this.state.agreedToTerms ? (
                  <App
                    userData={this.state.userData}
                    signOut={this.handleSignOut}
                    names={this.state.names}
                    renew={this.renew}
                    currentBlock={this.state.currentBlock}
                    address={this.state.address}
                    walletAddress={this.state.walletAddress}
                    setSecretKey={this.setSecretKey}
                    startLegacyRenew={this.startLegacyRenew}
                    showSecretKeyModal={this.state.showSecretKeyModal}
                    setShowSecretKeyModal={this.setShowSecretKeyModal}
                    upgradeName={this.upgradeName}
                    showTransactionSentModal={
                      this.state.showTransactionSentModal
                    }
                    setShowTransactionSentModalValue={
                      this.setShowTransactionSentModalValue
                    }
                    setTransactionValue={this.setTransactionValue}
                    transaction={this.state.transaction}
                    beginLegacyRenew={this.beginLegacyRenew}
                    resolveAndAddName={this.resolveAndAddName}
                    setLocalZonefile={this.setLocalZonefile}
                    localZonefile={this.state.localZonefile}
                    publishZonefile={this.publishZonefile}
                  />
                ) : (
                  <Terms agree={this.agree} />
                )}
              </>
            )}
          </main>

          <Footer />
        </div>
      </SafeHydrate>
    );
  }
}

export default Index;
