import React, { FC, useCallback } from "react";
import Image from "next/image";
import ModalHeader from "../Modal/Header";
import { shortenAddress } from "functions/format";
import Option from "modals/WalletModal/Option";
import type { Connector } from "@web3-react/types";
import { getName } from "state/application/HooksProvider";

import useActiveWeb3React from "hooks/useActiveWeb3React";
const WalletIcon: FC<{ size?: number; src: string; alt: string; children? }> =
  ({ size, src, alt, children }) => {
    return (
      <div className="flex flex-row items-end justify-center flex-nowrap md:items-center">
        <>
          <Image src={src} alt={alt} width={size} height={size} />
          {children}
        </>
      </div>
    );
  };

interface AccountDetailsProps {
  toggleWalletModal: () => void;
  ENSName?: string;
  openOptions: () => void;
}

const AccountDetails: FC<AccountDetailsProps> = ({
  toggleWalletModal,
  ENSName,
  openOptions,
}) => {
  function getStatusIcon({ connector }: { connector: Connector }) {
    const name = getName(connector);
    if (name === "MetaMask") {
      // return <Image src="/chef.svg" alt="Injected (MetaMask etc...)" width={20} height={20} />
      return (
        <WalletIcon
          src="/images/wallets/metamask.png"
          alt="Metamask"
          size={16}
        />
      );
    } else if (connector.constructor.name === "WalletConnect") {
      return (
        <WalletIcon
          src="/images/wallets/wallet-connect.svg"
          alt="Wallet Connect"
          size={16}
        />
      );
    } else if (name === "Coinbase Wallet") {
      return (
        <WalletIcon
          src="/images/wallets/coinbase.svg"
          alt="Coinbase"
          size={16}
        />
      );
    } else {
      return null;
    }
  }

  const { connector, account } = useActiveWeb3React();
  return (
    <div className="space-y-3 text-black ">
      <div className="space-y-3">
        <ModalHeader
          title="Account"
          titleClassName="text-white"
          onClose={toggleWalletModal}
        />
        <div className="space-y-3">
          <p className="text-white">
            By disconnecting your wallet, you agree to our Terms of Service and
            our Privacy Policy.
          </p>
          <div
            className={`flex items-center justify-between w-full p-3 rounded-lg cursor-pointer bg-secondary border border-lime text-base`}
            style={{
              border: "1px solid rgba(255, 255, 255, 0.1)",
              marginBottom: "1rem",
            }}
          >
            {ENSName ? (
              <div className="flex items-center bg-red-100">
                {/* {getStatusIcon()} */}
                <p>{ENSName}</p>
              </div>
            ) : (
              <div className="flex items-center h-full py-2 tracking-widest text-white">
                {/* {getStatusIcon({ connector })} */}
                <span className="text-3xl">
                  {account && shortenAddress(account)}
                </span>
              </div>
            )}
          </div>
          <Option
            id={`connect-`}
            onClick={() => {
              console.log(connector);
              (connector as any).handleClose();
            }}
            color={"white"}
            subheader={null}
            // link={"https://metamask.io/"}
            header={getName(connector)}
            icon={getStatusIcon({ connector })}
          />
          <div className="flex text-red">
            <button
              className="p-0 m-0 text-base uppercase text-c-red bg-tertiary"
              style={{ color: "red" }}
              onClick={() => connector.deactivate()}
            >
              Disconnect
            </button>
            <button
              className="text-base uppercase text-c-red bg-tertiary"
              style={{ color: "#479DF8" }}
              onClick={() => {
                openOptions();
              }}
            >
              Change
            </button>
          </div>
          {/* <div className="flex items-center justify-between">
            {formatConnectorName()}
            <div className="flex justify-start space-x-3">
              {connector === injected &&
                connector.constructor.name !== "WalletLinkConnector" &&
                connector.constructor.name !== "BscConnector" &&
                connector.constructor.name !== "KeystoneConnector" && (
                  <Button
                    onClick={() => {
                      console.log(connector);
                      (connector as any).handleClose();
                    }}
                  >
                    {i18n._(t`Disconnect`)}
                  </Button>
                )}
              <Button
                onClick={() => {
                  openOptions();
                }}
              >
                {i18n._(t`Change`)}
              </Button>
            </div>
          </div> */}
          {/* <div
            id="web3-account-identifier-row"
            className="flex flex-col justify-center space-y-3"
          >
            {ENSName ? (
              <div className="bg-dark-800">
                {getStatusIcon()}
                <p>{ENSName}</p>
              </div>
            ) : (
              <div className="px-3 py-2 rounded bg-dark-800">
                {getStatusIcon()}
                <p>{account && shortenAddress(account)}</p>
              </div>
            )}
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default AccountDetails;
