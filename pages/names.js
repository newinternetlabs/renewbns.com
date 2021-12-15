import React from "react";
import Head from "next/head";
import SignIn from "../components/SignIn";
import App from "../components/App";

import {
  userSession,
  stxAddress,
  addressName,
  resolveName,
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
  }
  state = {
    userData: null,
    names: [],
  };

  handleSignOut(e) {
    e.preventDefault();
    this.setState({ userData: null });
    userSession.signUserOut(window.location);
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
      console.log(address);
      addressName(address).then((name) => {
        console.log(name);
        return resolveName(name).then((result) => {
          console.log(result);
          this.setState({ names: [{ name, address, data: result }] });
        });
      });

      this.setState({ userData: userSession.loadUserData() });
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
