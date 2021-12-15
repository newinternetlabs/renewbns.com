import React from "react";
import Head from "next/head";
import SignIn from "../components/SignIn";
import App from "../components/App";

import { userSession } from "../utils/auth";

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
  };

  handleSignOut(e) {
    e.preventDefault();
    this.setState({ userData: null });
    userSession.signUserOut(window.location);
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
