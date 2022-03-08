import React, { Fragment } from "react";
import { Disclosure, Menu, Transition } from "@headlessui/react";
import { MenuIcon, XIcon } from "@heroicons/react/outline";
import { getUserData } from "../utils/auth";
import Name from "../components/Name";
import WarningAlertWithLink from "../components/WarningAlertWithLink";

const navigation = [{ name: "Names", href: "/", current: true }];
const userNavigation = [{ name: "Sign out", href: "#" }];

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

class App extends React.Component {
  constructor(props) {
    super(props);
    this.listNames = this.listNames.bind(this);
  }

  listNames(e) {
    console.log("listNames");
    e.preventDefault();
    getUserData();
  }

  render() {
    return (
      <>
        <div className="min-h-full">
          <Disclosure as="nav" className="bg-white shadow-sm">
            {({ open }) => (
              <>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="flex justify-between h-16">
                    <div className="flex">
                      <div className="flex-shrink-0 flex items-center">
                        <img
                          className="block lg:hidden h-8 w-auto"
                          src="/images/NIL-n-c-350x350.png"
                          alt="New Internet Labs logo"
                        />
                        <img
                          className="hidden lg:block h-8 w-auto"
                          src="/images/NIL-n-c-350x350.png"
                          alt="New Internet Labs logo"
                        />
                      </div>
                      <div className="hidden sm:-my-px sm:ml-6 sm:flex sm:space-x-8">
                        {navigation.map((item) => (
                          <a
                            key={item.name}
                            href={item.href}
                            className={classNames(
                              item.current
                                ? "border-indigo-500 text-gray-900"
                                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300",
                              "inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                            )}
                            aria-current={item.current ? "page" : undefined}
                          >
                            {item.name}
                          </a>
                        ))}
                      </div>
                    </div>
                    <div className="hidden sm:ml-6 sm:flex sm:items-center">
                      {/* Profile dropdown */}
                      <Menu as="div" className="ml-3 relative">
                        <div>
                          <Menu.Button className="bg-white flex text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                            <span className="sr-only">Open user menu</span>
                            <svg
                              className="h-8 w-8 rounded-full text-gray-300"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                          </Menu.Button>
                        </div>
                        <Transition
                          as={Fragment}
                          enter="transition ease-out duration-200"
                          enterFrom="transform opacity-0 scale-95"
                          enterTo="transform opacity-100 scale-100"
                          leave="transition ease-in duration-75"
                          leaveFrom="transform opacity-100 scale-100"
                          leaveTo="transform opacity-0 scale-95"
                        >
                          <Menu.Items className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                            {userNavigation.map((item) => (
                              <Menu.Item key={item.name}>
                                {({ active }) => (
                                  <a
                                    href={item.href}
                                    onClick={(e) => this.props.signOut(e)}
                                    className={classNames(
                                      active ? "bg-gray-100" : "",
                                      "block px-4 py-2 text-sm text-gray-700"
                                    )}
                                  >
                                    {item.name}
                                  </a>
                                )}
                              </Menu.Item>
                            ))}
                          </Menu.Items>
                        </Transition>
                      </Menu>
                    </div>
                    <div className="-mr-2 flex items-center sm:hidden">
                      {/* Mobile menu button */}
                      <Disclosure.Button className="bg-white inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                        <span className="sr-only">Open main menu</span>
                        {open ? (
                          <XIcon className="block h-6 w-6" aria-hidden="true" />
                        ) : (
                          <MenuIcon
                            className="block h-6 w-6"
                            aria-hidden="true"
                          />
                        )}
                      </Disclosure.Button>
                    </div>
                  </div>
                </div>

                <Disclosure.Panel className="sm:hidden">
                  <div className="pt-2 pb-3 space-y-1">
                    {navigation.map((item) => (
                      <Disclosure.Button
                        key={item.name}
                        as="a"
                        href={item.href}
                        className={classNames(
                          item.current
                            ? "bg-indigo-50 border-indigo-500 text-indigo-700"
                            : "border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800",
                          "block pl-3 pr-4 py-2 border-l-4 text-base font-medium"
                        )}
                        aria-current={item.current ? "page" : undefined}
                      >
                        {item.name}
                      </Disclosure.Button>
                    ))}
                  </div>
                  <div className="pt-4 pb-3 border-t border-gray-200">
                    <div className="flex items-center px-4">
                      <div className="flex-shrink-0">
                        <svg
                          className="h-10 w-10 rounded-full text-gray-300"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                      </div>
                      <div className="ml-3"></div>
                    </div>
                    <div className="mt-3 space-y-1">
                      {userNavigation.map((item) => (
                        <Disclosure.Button
                          key={item.name}
                          as="a"
                          href={item.href}
                          className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                        >
                          {item.name}
                        </Disclosure.Button>
                      ))}
                    </div>
                  </div>
                </Disclosure.Panel>
              </>
            )}
          </Disclosure>

          <div className="py-10">
            <header>
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-4">
                <h1 className="text-3xl font-bold leading-tight text-gray-900">
                  Your name
                </h1>
              </div>
            </header>
            <main>
              <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                {/* Replace with your content */}
                <div className="bg-white shadow overflow-hidden sm:rounded-md">
                  <ul role="list" className="divide-y divide-gray-200">
                    {this.props.names.map((name) => (
                      <div key={name.name}>
                        {name.legacy ? (
                          <WarningAlertWithLink
                            className="pt-4"
                            message={
                              "This is a pre-Stacks 2.0 legacy name. Sign up to be notified when you can update for use with Stacks 2.0 apps."
                            }
                          />
                        ) : null}
                        <Name
                          name={name.name}
                          address={name.address}
                          walletAddress={this.props.walletAddress}
                          expiry={parseInt(
                            name.data["lease-ending-at"].value.value
                          )}
                          renew={this.props.renew}
                          legacy={name.legacy}
                          currentBlock={this.props.currentBlock}
                          price={name.price}
                          startLegacyRenew={this.props.startLegacyRenew}
                          showSecretKeyModal={this.props.showSecretKeyModal}
                          setShowSecretKeyModal={
                            this.props.setShowSecretKeyModal
                          }
                          zonefileHash={name.zonefileHash}
                          showTransactionSentModal={
                            this.props.showTransactionSentModal
                          }
                          setShowTransactionSentModalValue={
                            this.props.setShowTransactionSentModalValue
                          }
                          transaction={this.props.transaction}
                          setTransactionValue={this.props.setTransactionValue}
                          beginLegacyRenew={this.props.beginLegacyRenew}
                        />
                      </div>
                    ))}
                  </ul>
                </div>
                {/* /End replace */}
              </div>
            </main>
          </div>
        </div>
      </>
    );
  }
}

export default App;
