import React from "react";
import Head from "next/head";
import SignIn from "../components/SignIn";

import { userSession } from "../utils/auth";

class Names extends React.Component {
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
      <div>
        <Head>
          <title>Renew your BNS names</title>
        </Head>

        <main>
          {!userSession.isUserSignedIn() ? (
            <SignIn />
          ) : (
            <button
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              onClick={(e) => this.handleSignOut(e)}
            >
              Sign out
            </button>
          )}
        </main>

        <footer></footer>
      </div>
    );
  }
}

export default Names;
