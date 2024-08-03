import { NETWORK_ICON, NETWORK_LABEL } from "../../config/networks";
import Image from "next/image";
import NetworkModal from "../../modals/NetworkModal";
import React from "react";
import { useActiveWeb3React } from "../../hooks/useActiveWeb3React";
import { useNetworkModalToggle } from "../../state/application/hooks";
import { ChainId } from "constants/chainIds";
import BlockIcon from "@mui/icons-material/Block";

function Web3Network(): JSX.Element | null {
  const { chainId } = useActiveWeb3React();

  const toggleNetworkModal = useNetworkModalToggle();

  if (!chainId) return null;

  // if (chainId !== (ChainId.MAINNET || ChainId.RINKEBY)) return null;

  return (
    <div
      className="flex items-center border border-accent bg-dark-1000 h-[55px] min-w-[120px] rounded-[60px] px-3 py-0.5 whitespace-nowrap text-sm font-bold cursor-pointer select-none pointer-events-auto"
      onClick={() => toggleNetworkModal()}
    >
      {/* {![(ChainId)].includes(chainId) ? (
        <div className="flex items-center px-3 py-2">
          <BlockIcon />
          <p className="ml-2">You&apos;re on a wrong network</p>
        </div>
      ) : ( */}
      <div className="grid items-center grid-flow-col px-3 py-2 space-x-2 text-smpointer-events-auto auto-cols-max text-secondary">
        <Image
          src={NETWORK_ICON[chainId]}
          alt="Switch Network"
          className="rounded-md"
          width="22px"
          height="22px"
        />
        <div className="text-white">{NETWORK_LABEL[chainId]}</div>
      </div>
      {/* )} */}
      <NetworkModal />
    </div>
  );
}

export default Web3Network;
