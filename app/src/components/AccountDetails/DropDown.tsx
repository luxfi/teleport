import React, { FC, useCallback } from "react";
import { SUPPORTED_WALLETS, injected } from "../../config/wallets";
import Image from "next/image";
import { useActiveWeb3React } from "../../hooks/useActiveWeb3React";
import { useDispatch, useSelector } from "react-redux";
import { metaMask } from "connectors/metaMask";
import { walletConnect } from "connectors/walletConnect";
import { coinbaseWallet } from "connectors/coinbaseWallet";
import { AppDispatch, AppState } from "state/store";
import ModalHeader from "components/Modal/Header";
import { numberWithCommas, shortenAddress } from "functions/format";
import Copy from "components/Copy";
import { getExplorerLink } from "functions/explorer";
import { LinkIcon } from "@heroicons/react/outline";
import { getName } from "state/application/HooksProvider";
import { Connector } from "@web3-react/types";
const WalletIcon: FC<{
  size?: number;
  src: string;
  alt: string;
  children?: any;
}> = ({ size, src, alt, children }) => {
  return (
    <div className="flex flex-row items-end justify-center mr-2 flex-nowrap md:items-center">
      <>
        <Image src={src} alt={alt} width={size} height={size} />
        <>{children}</>
      </>
    </div>
  );
};

// function renderTransactions(transactions: string[]) {
//   return (
//     <div className="flex flex-col gap-2 flex-nowrap">
//       {transactions.map((hash, i) => {
//         return <Transaction key={i} hash={hash} />;
//       })}
//     </div>
//   );
// }

interface AccountDetailsProps {
  toggleWalletModal: () => void;
  // pendingTransactions: string[];
  // confirmedTransactions: string[];
  ENSName?: string;
  openOptions: () => void;
}

const AccountDetails: FC<AccountDetailsProps> = ({
  toggleWalletModal,
  // pendingTransactions,
  // confirmedTransactions,
  ENSName,
  openOptions,
}) => {
  const { chainId, account, connector } = useActiveWeb3React();
  const dispatch = useDispatch<AppDispatch>();
  const luxBalance = useSelector<AppState, AppState["lux"]["luxBalance"]>(
    (state) => state.lux.luxBalance
  );

  function formatConnectorName() {
    const { ethereum } = window;
    const isMetaMask = !!(ethereum && ethereum.isMetaMask);
    const name = Object.keys(SUPPORTED_WALLETS)
      .filter(
        (k) =>
          SUPPORTED_WALLETS[k].connector === connector &&
          (connector !== metaMask || isMetaMask === (k === "METAMASK"))
      )
      .map((k) => SUPPORTED_WALLETS[k].name)[0];
    return (
      <div className="font-medium text-baseline text-secondary">
        Connected with {name}
      </div>
    );
  }

  // const clearAllTransactionsCallback = useCallback(() => {
  //   if (chainId) dispatch(clearAllTransactions({ chainId }));
  // }, [dispatch, chainId]);
  function getStatusIcon() {
    if (connector === metaMask) {
      return (
        <WalletIcon
          src="/images/wallets/metamask.png"
          alt="Metamask"
          size={16}
        />
      );
    } else if (connector === walletConnect) {
      return (
        <WalletIcon
          src="/images/wallets/wallet-connect.svg"
          alt="Wallet Connect"
          size={16}
        />
      );
    } else if (connector === coinbaseWallet) {
      return <WalletIcon src="/coinbase.svg" alt="Coinbase" size={16} />;
    } else if (connector.constructor.name === "FortmaticConnector") {
      return <WalletIcon src="/formatic.png" alt="Fortmatic" size={16} />;
    } else if (connector.constructor.name === "PortisConnector") {
      return (
        <WalletIcon src="/portnis.png" alt="Portis" size={16}>
          <button
            onClick={async () => {
              // casting as PortisConnector here defeats the lazyload purpose
              (connector as any).portis.showPortis();
            }}
          >
            Show Portis
          </button>
        </WalletIcon>
      );
    } else if (connector.constructor.name === "TorusConnector") {
      return <WalletIcon src="/torus.png" alt="Torus" size={16} />;
    }
    return null;
  }
  return (
    <div className="space-y-3 text-white">
      <div className="space-y-3">
        <ModalHeader title="Account" onClose={toggleWalletModal} />
        <div className="space-y-3">
          <div className="flex flex-col">
            {formatConnectorName()}
            <div className="flex space-x-3">
              <button
                className="text-sm font-bold"
                onClick={() => {
                  console.log(connector);
                  connector.deactivate();
                }}
              >
                Disconnect
              </button>

              <button
                className="text-sm font-bold"
                onClick={() => {
                  openOptions();
                }}
              >
                Change
              </button>
            </div>
          </div>
          <div
            id="web3-account-identifier-row"
            className="flex flex-col justify-center space-y-3"
          >
            {ENSName ? (
              <div className="bg-dark-800">
                {getStatusIcon()}
                <p>{ENSName}</p>
              </div>
            ) : (
              <div className="flex py-2 rounded bg-dark-800">
                <p className="pr-2">{account && shortenAddress(account)}</p>
                {"   "}
                {getStatusIcon()}
              </div>
            )}
            <div>
              <p className="font-bold">
                Balance: {numberWithCommas(parseFloat(luxBalance).toFixed(2))}{" "}
                LUX
              </p>
            </div>
            <div className="flex items-center gap-2 space-x-3">
              {chainId && account && (
                <a
                  color="blue"
                  target="_blank"
                  rel="noreferrer"
                  href={
                    chainId &&
                    getExplorerLink(chainId, ENSName || account, "address")
                  }
                >
                  <p>View on explorer</p>
                </a>
              )}
              {account && <Copy text="Copy Address" address={account} />}
            </div>
          </div>
        </div>
      </div>
      <div className="space-y-2">
        {/* <div className="flex items-center justify-between">
          <p>Recent Transactions</p>
          <div>
            <button
            // onClick={clearAllTransactionsCallback}
            >
              Clear all
            </button>
          </div>
        </div> */}
        {/* {!!pendingTransactions.length || !!confirmedTransactions.length ? (
          <>
            {renderTransactions(pendingTransactions)}
            {renderTransactions(confirmedTransactions)}
          </>
        ) : (
          <Typography variant="sm" className="text-secondary">
            {i18n._(t`Your transactions will appear here...`)}
          </Typography>
        )} */}
      </div>
    </div>
  );
};

export default AccountDetails;
