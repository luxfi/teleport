import React, { useEffect, useState } from "react";
import Hamburger from "hamburger-react";

import ExternalLink from "../ExternalLink";
import Image from "next/image";
import Link from "next/link";
import More from "./More";
import NavLink from "../NavLink";
import { Popover } from "@headlessui/react";
import Web3Network from "../Web3Network";
import Web3Status from "../Web3Status";
import { useActiveWeb3React } from "../../hooks/useActiveWeb3React";
import { ChainId, NATIVE } from "constants/chainIds";
import useBalances from "hooks/useBalance";
import { formatBalance } from "functions/format";
import { SUPPORTED_NETWORKS } from "config/networks";
import MenuIcon from "components/Icons/MenuIcon";
import Tooltip, { TooltipProps, tooltipClasses } from "@mui/material/Tooltip";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import { addresses } from "constants/contract";
import { metaMask } from "connectors/metaMask";

const HtmlTooltip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: "#f5f5f9",
    color: "rgba(0, 0, 0, 0.87)",
    maxWidth: 220,
    fontSize: theme.typography.pxToRem(12),
    border: "1px solid #dadde9",
  },
}));
function AppBar(): JSX.Element {
  const { account, chainId, library, accounts, connector } =
    useActiveWeb3React();
  const [activeType, setActiveType] = useState<string>("swap");
  const [isOpen, setOpen] = useState<boolean>(false);

  const balances = useBalances(library, accounts);

  const chainAddresses =
    (addresses[chainId] as any) || (addresses[ChainId.MAINNET] as any);

  return (
    //     // <header className="flex flex-row justify-between w-screen flex-nowrap">
    <header className="absolute flex-shrink-0 w-full">
      <Popover as="nav" className="z-10 w-full bg-transparent header-border-b">
        {({ open }) => (
          <>
            <div className="px-4 py-4">
              <div className="flex items-center justify-between">
                <div className="relative flex items-center gap-x-4">
                  {/* <Image src="/logo.png" alt="Sushi" width="32px" height="32px" /> */}

                  <NavLink href="/swap">
                    <div className="flex items-center pt-3 pb-3 pl-3 cursor-pointer logo">
                      <Image
                        src="/icons/lux-logo.png"
                        className="w-10"
                        alt="Logo"
                        width={111}
                        height={31}
                      />
                    </div>
                  </NavLink>
                  <button className="items-center justify-center hidden w-12 h-12 transition-colors ease-in-out delay-75 bg-opacity-0 rounded-full outline-none sm:flex bg-accent hover:bg-opacity-30 ">
                    <Hamburger
                      size={20}
                      color="#4F46E5"
                      toggled={isOpen}
                      toggle={setOpen}
                    />
                  </button>

                  <MenuDropdown isOpen={isOpen} />
                </div>

                <div className="hidden sm:flex">
                  <SwitchBtn
                    title="Swap"
                    href="/swap"
                    activeType={activeType}
                    setActiveType={setActiveType}
                  />
                </div>

                <div className="flex items-center gap-x-4">
                  {/* <button className="outline-none border border-accent bg-transparent flex justify-center items-center h-[55px] min-w-[120px] rounded-[60px]">
                    <h1 className="p-2 font-medium text-white text-baseline md:p-3 whitespace-nowrap">
                      Buy Lux
                    </h1>
                  </button> */}
                  <div className="fixed bottom-0 left-0 z-10 flex flex-row items-center justify-center w-full p-4 lg:w-auto bg-dark-1000 lg:relative lg:p-0 lg:bg-transparent">
                    <div className="flex items-center justify-between w-full space-x-2 sm:justify-end">
                      {chainId && connector && connector === metaMask && (
                        <HtmlTooltip
                          title={
                            <React.Fragment>
                              <Typography color="inherit">
                                Import SPJ
                              </Typography>
                              <p>
                                By clicking this icon, LBTC token would be
                                imported to your wallet as a custom token
                              </p>
                            </React.Fragment>
                          }
                        >
                          <div className="inline-flex w-[25px]">
                            <div
                              className="flex border rounded-md cursor-pointer border-accent sm:inline-flex bg-dark-900 hover:bg-dark-800"
                              onClick={() => {
                                const tokenAddress = chainAddresses.LBTC;
                                const tokenSymbol = "LBTC";
                                const tokenDecimals = 18;
                                const tokenImage =
                                  window.location.origin +
                                  "/icons/lux-triangle.png";
                                if (
                                  connector &&
                                  connector === metaMask &&
                                  connector.provider.request
                                ) {
                                  const params: any = {
                                    type: "ERC20",
                                    options: {
                                      address: tokenAddress,
                                      symbol: tokenSymbol,
                                      decimals: tokenDecimals,
                                      image: tokenImage,
                                    },
                                  };
                                  connector.provider
                                    .request({
                                      method: "wallet_watchAsset",
                                      params,
                                    })
                                    .then((success) => {
                                      if (success) {
                                        console.log(
                                          "Successfully added LBTC to MetaMask"
                                        );
                                      } else {
                                        throw new Error(
                                          "Something went wrong."
                                        );
                                      }
                                    })
                                    .catch(console.error);
                                }
                              }}
                            >
                              <Image
                                src="/icons/lux-triangle.png"
                                alt="LBTC"
                                width={30}
                                height={30}
                                objectFit="contain"
                                className="rounded-md"
                              />
                            </div>
                          </div>
                        </HtmlTooltip>
                      )}
                      {library && library.provider.isMetaMask && (
                        <div className="hidden sm:inline-block">
                          <Web3Network />
                        </div>
                      )}

                      <div className="hidden sm:flex w-auto items-center justify-center bg-accent hover:bg-opacity-90 h-[60px] min-w-[185px] rounded-[60px] p-0.5 whitespace-nowrap text-sm font-bold cursor-pointer select-none pointer-events-auto">
                        {account && chainId && (
                          <>
                            <div className="px-3 py-2 text-white text-bold">
                              {balances?.[0]
                                ? ` ${formatBalance(balances[0], 18, 3)}`
                                : null}{" "}
                              {/* {NATIVE[chainId]?.symbol || "ETH"} */}
                              {SUPPORTED_NETWORKS[chainId]?.nativeCurrency
                                ?.symbol || "ETH"}
                            </div>
                          </>
                        )}
                        <Web3Status
                          title="Connect to Wallet"
                          className="text-white"
                        />
                      </div>
                      {/* <div className="hidden md:block">
                      <LanguageSwitch />
                    </div> */}
                      {/* <More /> */}
                    </div>
                  </div>
                </div>

                <div className="flex -mr-2 sm:hidden">
                  {/* Mobile menu button */}
                  <Popover.Button className="inline-flex items-center justify-center p-2 rounded-md text-accent focus:outline-none">
                    <span className="sr-only">Open main menu</span>
                    {open ? (
                      <svg
                        className="block w-6 h-6"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    ) : (
                      // <X title="Close" className="block w-6 h-6" aria-hidden="true" />
                      <svg
                        className="block w-6 h-6"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 6h16M4 12h16M4 18h16"
                        />
                      </svg>
                      // <Burger title="Burger" className="block w-6 h-6" aria-hidden="true" />
                    )}
                  </Popover.Button>
                </div>
              </div>
            </div>

            <Popover.Panel className="sm:hidden">
              <div className="flex flex-col px-4 pt-2 pb-3 space-y-1">
                <Link href="/swap">
                  <a
                    id={`swap`}
                    className="p-2 text-white text-baseline hover:text-high-emphesis focus:text-high-emphesis md:p-3 whitespace-nowrap"
                  >
                    SWAP
                  </a>
                </Link>
              </div>
            </Popover.Panel>
          </>
        )}
      </Popover>
    </header>
  );
}

export default AppBar;

const SwitchBtn = ({ href, title, activeType, setActiveType }) => {
  const isActive = activeType.toLowerCase() === title.toLowerCase();

  return (
    <div
      onClick={() => setActiveType(title)}
      className={`cursor-pointer flex justify-center items-center h-12 min-w-[100px] rounded-[60px]  ${
        isActive ? "bg-[#161827]" : "bg-transparent"
      }`}
    >
      <NavLink href={href || "/swap"}>
        <a
          id={`swap-nav-link`}
          className="p-2 font-medium text-white text-baseline hover:text-high-emphesis focus:text-high-emphesis md:p-3 whitespace-nowrap"
        >
          {title}
        </a>
      </NavLink>
    </div>
  );
};

const MenuDropdown = ({ isOpen }) => {
  return (
    <div
      className={`absolute left-0 top-14 z-50 pl-7 pr-10 py-8 space-y-8 bg-[#131522] rounded-2xl transition-transform ${
        !isOpen
          ? "scale-0 opacity-0 pointer-events-none"
          : "scale-100 opacity-100 pointer-events-auto"
      }`}
    >
      <MenuButton title="About" icon={<MenuIcon />} />
      <MenuButton title="SDK" icon={<MenuIcon />} />
      <MenuButton title="Referral Program" icon={<MenuIcon />} />
      <MenuButton title="FAQ" icon={<MenuIcon />} />
    </div>
  );
};

interface MenuButtonProps {
  title: string;
  icon?: JSX.Element;
}

const MenuButton = ({ title, icon }: MenuButtonProps) => {
  return (
    <div className="flex items-center cursor-pointer gap-x-4">
      {icon || <MenuIcon />}
      <h1 className="text-sm font-bold text-white whitespace-nowrap">
        {title}
      </h1>
    </div>
  );
};
