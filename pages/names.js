import React from "react";
import Head from "next/head";
import SignIn from "../components/SignIn";
import App from "../components/App";
import SecretKeyModal from "../components/SecretKeyModal";

import {
  userSession,
  stxAddress,
  addressName,
  resolveName,
  renewName,
} from "../utils/auth";

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

class Names extends React.Component {
  constructor(props) {
    super(props);
    this.handleSignOut = this.handleSignOut.bind(this);
    this.renew = this.renew.bind(this);
    this.startLegacyRenew = this.startLegacyRenew.bind(this);
    this.setSecretKey = this.setSecretKey.bind(this);
    this.setShowSecretKeyModal = this.setShowSecretKeyModal.bind(this);
    this.upgradeName = this.upgradeName.bind(this);
    this.setShowTransactionSentModalValue =
      this.setShowTransactionSentModalValue.bind(this);
    this.setTransactionValue = this.setTransactionValue.bind(this);
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
  };

  handleSignOut(e) {
    e.preventDefault();
    this.setState({ userData: null });
    userSession.signUserOut(window.location);
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

  show;

  renew(e, name, price) {
    e.preventDefault();
    renewName(name, price);
  }

  startLegacyRenew(e, name, price) {
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
    if (userSession.isSignInPending()) {
      console.log("isSignInPending");
      userSession.handlePendingSignIn().then((userData) => {
        console.log("handlePendingSignIn");
        window.history.replaceState({}, document.title, "/names");
        console.log(userData);
        this.setState({ userData: userData });
      });
    } else if (userSession.isUserSignedIn()) {
      console.log("isUserSignedIn");
      let address = stxAddress();
      console.log(`setting wallet address: ${address}`);
      this.setState({ address, walletAddress: address });
      console.log(address);
      console.log(this.state.userData);
      addressName(address).then((name) => {
        let legacy = false;
        if (name === false && this.state.userData.username) {
          // try legacy name
          name = this.state.userData.username;
          console.log(`trying legacy name: ${name}`);
          legacy = true;
        }

        console.log(`resolveName(${name})`);
        return resolveName(name).then((result) => {
          console.log(result);
          fetch(
            "https://stacks-node-api.mainnet.stacks.co/v2/prices/names/" + name
          ).then((response) => {
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
                  },
                ],
              });
            });
          });
        });
      });

      this.setState({ userData: userSession.loadUserData() });

      fetch("https://stacks-node-api.mainnet.stacks.co/v2/info").then(
        (response) => {
          return response.json().then((json) => {
            this.setState({
              currentBlock: parseInt(json["stacks_tip_height"]),
            });
          });
        }
      );
    }
  }

  render() {
    return (
      <SafeHydrate>
        <div>
          <Head>
            <title>Renew your BNS names</title>
          </Head>

          <main>
            {!userSession.isUserSignedIn() ? (
              <SignIn />
            ) : (
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
                showTransactionSentModal={this.state.showTransactionSentModal}
                setShowTransactionSentModalValue={
                  this.setShowTransactionSentModalValue
                }
                setTransactionValue={this.setTransactionValue}
                transaction={this.state.transaction}
              />
            )}
          </main>

          <footer></footer>
        </div>
      </SafeHydrate>
    );
  }
}

export default Names;
