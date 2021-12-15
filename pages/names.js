import React from "react";
import Head from "next/head";
import SignIn from "../components/SignIn";
import App from "../components/App";

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
  }
  state = {
    userData: null,
    names: [],
    currentBlock: 0,
    legacy: false,
    address: "",
    price: 0,
  };

  handleSignOut(e) {
    e.preventDefault();
    this.setState({ userData: null });
    userSession.signUserOut(window.location);
  }

  renew(e, name, price) {
    e.preventDefault();
    renewName(name, price);
  }

  componentDidMount() {
    if (userSession.isSignInPending()) {
      userSession.handlePendingSignIn().then((userData) => {
        window.history.replaceState({}, document.title, "/names");
        console.log(userData);
        this.setState({ userData: userData });
      });
    } else if (userSession.isUserSignedIn()) {
      let address = stxAddress();
      this.setState({ address });
      console.log(address);
      addressName(address).then((name) => {
        let legacy = false;
        if (name === false && this.state.userData.username) {
          // try legacy name
          name = this.state.userData.username;
          legacy = true;
        }
        return resolveName(name).then((result) => {
          console.log(result);
          fetch(
            "https://stacks-node-api.mainnet.stacks.co/v2/prices/names/" + name
          ).then((response) => {
            return response.json().then((json) => {
              console.log(json);
              let price = parseInt(json.amount);
              this.setState({
                names: [
                  {
                    name,
                    address: result.owner.value,
                    data: result,
                    legacy,
                    price,
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
