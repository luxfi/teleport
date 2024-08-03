import React, { useEffect, useState } from "react";
import { SUPPORTED_WALLETS, injected } from "../../config/wallets";
import { useModalOpen, useWalletModalToggle } from "state/application/hooks";
import { Network } from "@web3-react/network";
import { WalletConnect } from "@web3-react/walletconnect";
import { AbstractConnector } from "@web3-react/abstract-connector";
import AccountDetails from "components/AccountDetails";
import { ApplicationModal } from "../../state/application/actions";
import Modal from "../../components/Modal";
import ModalHeader from "components/Modal/Header";
import Option from "./Option";
import { isMobile } from "react-device-detect";
import Link from "next/link";
const WALLET_VIEWS = {
  OPTIONS: "options",
  OPTIONS_SECONDARY: "options_secondary",
  ACCOUNT: "account",
  PENDING: "pending",
};

import { CHAINS, getAddChainParameters, URLS } from "config/chains";
import useActiveWeb3React from "hooks/useActiveWeb3React";
import { metaMask } from "connectors/metaMask";
export function getOptions() {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { chainId, isActivating } = useActiveWeb3React();
  const isMetamask = window.ethereum && window.ethereum.isMetaMask;
  return Object.keys(SUPPORTED_WALLETS).map((key) => {
    const option = SUPPORTED_WALLETS[key];
    const isNetwork = option.connector instanceof Network;

    // check for mobile options
    if (isMobile && option.mobile) {
      // disable portis on mobile for now
      if (option.name === "Portis") {
        return null;
      }
      // console.log("here", (window as any).web3, window.ethereum, option);
      if (!(window as any).web3 && !window?.ethereum) {
        if (option.name === "MetaMask") {
          return (
            <Option
              id={`connect-${key}`}
              key={key}
              color={"#372839"}
              header={"Open In Metamask"}
              subheader={null}
              link={`https://metamask.app.link/dapp/${window.location.href}`}
              icon="/images/wallets/metamask.png"
            />
          );
        } else {
          return (
            <Option
              onClick={
                isActivating
                  ? () => console.log("is activating")
                  : () => {
                      console.log("clicked me 1", option.connector);
                      option.connector instanceof WalletConnect ||
                      option.connector instanceof Network
                        ? option.connector.activate(
                            chainId === -1 ? undefined : chainId
                          )
                        : option.connector.activate(
                            chainId === -1
                              ? undefined
                              : getAddChainParameters(1)
                          );
                    }
              }
              id={`connect-${key}`}
              key={key}
              active={option.connector && option.connector === true}
              color={option.color}
              link={option.href}
              header={option.name}
              subheader={null}
              icon={"/images/wallets/" + option.iconName}
            />
          );
        }
      } else {
        return (
          <Option
            onClick={
              isActivating
                ? () => console.log("is activating")
                : () => {
                    console.log("clicked me 1", option.connector);
                    option.connector instanceof WalletConnect ||
                    option.connector instanceof Network
                      ? option.connector.activate(
                          chainId === -1 ? undefined : chainId
                        )
                      : option.connector.activate(
                          chainId === -1 ? undefined : getAddChainParameters(1)
                        );
                  }
            }
            id={`connect-${key}`}
            key={key}
            active={option.connector && option.connector === true}
            color={option.color}
            link={option.href}
            header={option.name}
            subheader={null}
            icon={"/images/wallets/" + option.iconName}
          />
        );
      }
      return null;
    }

    // overwrite injected when needed
    if (option.connector === injected || option.connector === metaMask) {
      // don't show injected if there's no injected provider
      if (!((window as any).web3 || window.ethereum)) {
        if (option.name === "MetaMask") {
          return (
            <Option
              id={`connect-${key}`}
              key={key}
              color={"#372839"}
              header={"Install Metamask"}
              subheader={null}
              link={"https://metamask.io/"}
              icon="/images/wallets/metamask.png"
            />
          );
        } else {
          console.log("hereeeee o");
          return null; // dont want to return install twice
        }
      }
      // don't return metamask if injected provider isn't metamask
      else if (option.name === "MetaMask" && !isMetamask) {
        return null;
      }
      // likewise for generic
      else if (option.name === "Injected" && isMetamask) {
        return null;
      }
    }
    // return rest of options
    return (
      !isMobile &&
      !option.mobileOnly && (
        <Option
          id={`connect-${key}`}
          onClick={
            isActivating
              ? () => console.log("is activatinggggg")
              : () => {
                  console.log("clicked me 2", chainId);
                  option.connector instanceof WalletConnect ||
                  option.connector instanceof Network
                    ? (console.log("clicked me oksndvvdjn", option.connector),
                      option.connector.activate(
                        chainId === -1 ? undefined : chainId
                      ))
                    : (console.log("clicked me alsooo", option.connector),
                      option.connector.activate(
                        chainId === -1
                          ? undefined
                          : getAddChainParameters(chainId)
                      ));
                }
          }
          key={key}
          active={option.connector === true}
          color={option.color}
          link={option.href}
          header={option.name}
          subheader={null} // use option.descriptio to bring back multi-line
          icon={"/images/wallets/" + option.iconName}
        />
      )
    );
  });
}

export default function WalletModal({ ENSName }: { ENSName?: string }) {
  const { account } = useActiveWeb3React();
  const [walletView, setWalletView] = useState(WALLET_VIEWS.ACCOUNT);
  const [pendingError, setPendingError] = useState<boolean>();
  const walletModalOpen = useModalOpen(ApplicationModal.WALLET);
  const toggleWalletModal = useWalletModalToggle();
  function getModalContent() {
    // if (error) {
    //   return (
    //     <div>
    //       <ModalHeader
    //         title={
    //           error instanceof UnsupportedChainIdError
    //             ? i18n._(t`Wrong Network`)
    //             : i18n._(t`Error connecting`)
    //         }
    //         onClose={toggleWalletModal}
    //       />
    //       <div>
    //         {error instanceof UnsupportedChainIdError ? (
    //           <h5>
    //             {i18n._(t`Please connect to the appropriate Ethereum network.`)}
    //           </h5>
    //         ) : (
    //           i18n._(t`Error connecting. Try refreshing the page.`)
    //         )}
    //         <div style={{ marginTop: "1rem" }} />
    //         <button onClick={deactivate}>{i18n._(t`Disconnect`)}</button>
    //       </div>
    //     </div>
    //   );
    // }
    if (account && walletView === WALLET_VIEWS.ACCOUNT) {
      return (
        <AccountDetails
          toggleWalletModal={toggleWalletModal}
          ENSName={ENSName}
          openOptions={() => setWalletView(WALLET_VIEWS.OPTIONS)}
        />
      );
    }
    return (
      <div className="flex flex-col space-y-5 text-black">
        <ModalHeader
          title="Select a Wallet"
          titleClassName="text-white"
          onClose={toggleWalletModal}
        />
        <div className="flex flex-col space-y-5">
          <p className="my-0 text-white">
            By connecting your wallet, you agree to our Terms of Service and our
            Privacy Policy.
          </p>
          {walletView === WALLET_VIEWS.PENDING ? (
            <></>
          ) : (
            <div className="flex flex-col space-y-5 overflow-y-auto">
              {getOptions()}
            </div>
          )}
          {walletView !== WALLET_VIEWS.PENDING && (
            <Link href="https://ethereum.org/wallets/" passHref>
              <p className="text-left text-white underline cursor-pointer">
                New to Ethereum? Learn more about wallets
              </p>
            </Link>
          )}
        </div>
      </div>
    );
  }

  return (
    <Modal
      isOpen={walletModalOpen}
      onDismiss={toggleWalletModal}
      minHeight={0}
      maxHeight={90}
    >
      {getModalContent()}
    </Modal>
  );
}
