import React, { FC, useState } from "react";
import { XIcon } from "@heroicons/react/outline";
import Copy from "components/Copy";
import useActiveWeb3React from "hooks/useActiveWeb3React";
import { addresses } from "constants/contract";
import { ChainId } from "constants/chainIds";

const Banner: FC = () => {
  const [showBanner, setShowBanner] = useState(true);
  const { library, accounts, account, connector, chainId } =
    useActiveWeb3React();
  const chainAddresses =
    (addresses[chainId] as any) || (addresses[ChainId.MAINNET] as any);

  return (
    <>
      {showBanner ? (
        <div className="relative w-full bg-[#3C4EEA]">
          <div className="flex items-center px-3 mx-auto max-w-7xl sm:px-6">
            <Copy
              text={chainAddresses.LUX}
              address={`${
                chainId === ChainId.MAINNET
                  ? "https://etherscan.io/token/"
                  : "https://rinkeby.etherscan.io/token/"
              }${chainAddresses.LUX}`}
            />

            {/* X Icon Div  */}
            <div className="">
              <button
                type="button"
                className="flex p-2 focus:outline-none"
                onClick={() => setShowBanner(false)}
              >
                <span className="sr-only">Dismiss</span>
                <XIcon
                  className="w-4 h-4 text-left text-white"
                  aria-hidden="true"
                />
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
};

export default Banner;
