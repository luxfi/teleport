/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable @next/next/no-img-element */
import React, {
  KeyboardEvent,
  RefObject,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { filterTokens, useSortedTokensByQuery } from "functions/filtering";
import AutoSizer from "react-virtualized-auto-sizer";

import CurrencyList from "./CurrencyList";
import { FixedSizeList } from "react-window";
import ImportRow from "./ImportRow";
import { isAddress } from "functions/validate";
import useDebounce from "hooks/useDebounce";
import { useOnClickOutside } from "hooks/useOnClickOutside";
import { useTokenComparator } from "./sorting";
import ModalHeader from "components/Modal/Header";
import useActiveWeb3React from "hooks/useActiveWeb3React";
import { useRouter } from "next/router";
import { Token } from "state/types";
import {
  useAllTokens,
  useGetAvailableTokens,
  useToken,
} from "state/swap/hooks";
import { ChainId } from "constants/chainIds";
import useToggle from "hooks/useToggle";
import {
  AVAILABLE_NETWORKS,
  NETWORK_ICON,
  NETWORK_LABEL,
} from "config/networks";
import Image from "next/image";
interface CurrencySearchProps {
  isOpen: boolean;
  onDismiss: () => void;
  selectedCurrency?: Token | null;
  onCurrencySelect: (currency: Token) => void;
  otherSelectedCurrency?: Token | null;
  showCommonBases?: boolean;
  showManageView: () => void;
  showImportView: () => void;
  setImportToken: (token: Token) => void;
  currencyList?: string[];
  includeNativeCurrency?: boolean;
  allowManageTokenList?: boolean;
  onChainChange?: (chain: number) => void;
  onTokenChange?: (token: string) => void;
}

export function CurrencySearch({
  selectedCurrency,
  onCurrencySelect,
  otherSelectedCurrency,
  showCommonBases,
  onDismiss,
  isOpen,
  showManageView,
  showImportView,
  setImportToken,
  currencyList,
  includeNativeCurrency = true,
  allowManageTokenList = true,
  onChainChange,
}: CurrencySearchProps) {
  const [selectedNetwork, setSelectedNetwork] = useState(1);
  const [networkTokens, setNetworkTokens] = useState([]);
  const { chainId } = useActiveWeb3React();
  const getAvailableTokens = useGetAvailableTokens();

  // refs for fixed size lists
  const fixedList = useRef<FixedSizeList>();

  const [searchQuery, setSearchQuery] = useState<string>("");
  const debouncedQuery = useDebounce(searchQuery, 200);

  const [invertSearchOrder] = useState<boolean>(false);

  let allTokens = useAllTokens();
  const history = useRouter();

  console.log("allTokens", allTokens);

  // if (currencyList) {
  //   allTokens = Object.keys(allTokens).reduce((obj, key) => {
  //     if (currencyList.includes(key)) obj[key] = allTokens[key]
  //     return obj
  //   }, {})
  // }

  // if they input an address, use it
  const isAddressSearch = isAddress(debouncedQuery);
  const tokenComparator = useTokenComparator(invertSearchOrder);
  const searchToken = useToken(debouncedQuery);

  const filteredTokens: Token[] = useMemo(() => {
    if (Object.values(allTokens)[0] === undefined) return [];
    return filterTokens(
      Object.values(Object.values(allTokens)[0]),
      debouncedQuery
    );
  }, [allTokens, debouncedQuery]);

  const sortedTokens: Token[] = useMemo(() => {
    // return filteredTokens.sort(tokenComparator);
    return filteredTokens;
  }, [filteredTokens]);

  const filteredSortedTokens = useSortedTokensByQuery(
    sortedTokens,
    debouncedQuery
  );
  // const ether = useMemo(() => chainId && ExtendedEther.onChain(chainId), [chainId])

  const ether = useMemo(() => chainId, [chainId]);

  const filteredSortedTokensWithETH: Token[] = useMemo(() => {
    const s = debouncedQuery.toLowerCase().trim();
    if (s === "" || s === "e" || s === "et" || s === "eth") {
      return ether ? [...filteredSortedTokens] : filteredSortedTokens;
    }
    return [
      ...filteredSortedTokens,

      // {
      //   _checksummedAddress: '0xeD24FC36d5Ee211Ea25A80239Fb8C4Cfd80f12Ee',
      //   _tags: null,
      //   isNative: false,
      //   isToken: true,
      //   tokenInfo: {
      //     address: '0xeD24FC36d5Ee211Ea25A80239Fb8C4Cfd80f12Ee',
      //     chainId: 97,
      //     decimals: 18,
      //     logoURI: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/binance/assets/BUSD-BD1/logo.png',
      //     name: 'ETHEREUM',
      //     symbol: 'ETH',
      //   },
      // },
    ];
  }, [debouncedQuery, ether, filteredSortedTokens]);

  const handleCurrencySelect = useCallback((currency: Token) => {
    onCurrencySelect(currency);
    setTimeout(() => {
      onDismiss();
    }, 100);
  }, []);

  // clear the input on open
  useEffect(() => {
    if (isOpen) setSearchQuery("");
  }, [isOpen]);

  // manage focus on modal show
  const inputRef = useRef<HTMLInputElement>();
  const handleInput = useCallback((event) => {
    const input = event.target.value;
    const checksummedInput = isAddress(input);
    setSearchQuery(checksummedInput || input);
    fixedList.current?.scrollTo(0);
  }, []);

  const handleEnter = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        const s = debouncedQuery.toLowerCase().trim();
        if (s === "eth" && ether) {
          handleCurrencySelect(
            networkTokens.find((token) => token.symbol === "eth")
          );
        } else if (filteredSortedTokensWithETH.length > 0) {
          if (
            filteredSortedTokensWithETH[0].symbol?.toLowerCase() ===
              debouncedQuery.trim().toLowerCase() ||
            filteredSortedTokensWithETH.length === 1
          ) {
            handleCurrencySelect(filteredSortedTokensWithETH[0]);
          }
        }
      }
    },
    [debouncedQuery, ether, filteredSortedTokensWithETH, handleCurrencySelect]
  );

  // menu ui
  const [open, toggle] = useToggle(false);
  const node = useRef<HTMLDivElement>();
  useOnClickOutside(node, open ? toggle : undefined);

  useEffect(() => {
    // setNetworkTokens(allTokens[selectedNetwork] || []);
    getAvailableTokens(selectedNetwork);
  }, [getAvailableTokens, selectedNetwork]);

  return (
    <div className="flex flex-col w-full pb-5">
      <ModalHeader
        title="Token List"
        titleClassName="text-white text-2xl font-semibold"
        className="px-6 py-5 bg-space-grey"
        onClose={onDismiss}
      />
      <div className="flex h-full flex-col pl-6 pr-6 w-full min-w-[82vw] md:min-w-[400px]">
        {!currencyList && (
          <div className="mt-0 mb-3 sm:mt-3 sm:mb-8">
            <div className="relative">
              <div className="absolute inset-0 max-w-[40px] flex items-center justify-start pl-5">
                <Image src="/icons/search.svg" alt="" width={14} height={14} />
              </div>
              <input
                type="text"
                id="token-search-input"
                placeholder="Search name or paste address"
                autoComplete="off"
                value={searchQuery}
                ref={inputRef as RefObject<HTMLInputElement>}
                onChange={handleInput}
                onKeyDown={handleEnter}
                className="w-full bg-transparent border bg-[#1B1D2B] border-[#323546] focus:outline-none rounded-full placeholder-white-50  font-light text-sm pl-11 px-6 py-3.5"
              />
            </div>
          </div>
        )}

        <div className="flex w-full h-full gap-3">
          <div className="items-start justify-start px-1 overflow-y-auto max-w-1/9 bg-dark-1000 rounded-2xl">
            {AVAILABLE_NETWORKS.map((network: number) => (
              <div
                key={network}
                onClick={() => {
                  setSelectedNetwork(network);
                  onChainChange(network);
                }}
                className="flex flex-col items-center justify-center w-full h-20 py-1.5 px-3 cursor-pointer "
              >
                <div
                  className={`flex flex-col items-center justify-center w-16 h-16 rounded ${
                    selectedNetwork === network && "border-2"
                  } bg-dark-700 border-primary-300`}
                >
                  <img
                    className="w-8 h-8 rounded-full"
                    src={`${NETWORK_ICON[network]}`}
                  />
                  <p className="pt-1 text-xs text-grey-800">
                    {NETWORK_LABEL[network]}
                  </p>
                </div>
              </div>
            ))}
          </div>
          {searchToken ? (
            <div style={{ padding: "20px 0", height: "100%" }}>
              <ImportRow
                token={searchToken}
                showImportView={showImportView}
                setImportToken={setImportToken}
              />
            </div>
          ) : filteredSortedTokens?.length > 0 ? (
            <div className="h-[400px] overflow-y-auto w-[72%]">
              <AutoSizer disableWidth>
                {({ height }) => (
                  <CurrencyList
                    height={height}
                    currencies={
                      includeNativeCurrency
                        ? filteredSortedTokensWithETH
                        : filteredSortedTokens
                    }
                    onCurrencySelect={handleCurrencySelect}
                    otherCurrency={otherSelectedCurrency}
                    selectedCurrency={selectedCurrency}
                    fixedListRef={fixedList}
                    showImportView={showImportView}
                    setImportToken={setImportToken}
                  />
                )}
              </AutoSizer>
            </div>
          ) : (
            <div style={{ padding: "20px", height: "100%" }}>
              <div className="mb-8 text-center">No results found</div>
            </div>
          )}
        </div>
        {/* {allowManageTokenList && (
          <div className="mt-3">
            <button
              id="list-token-manage-button"
              onClick={showManageView}
              color="gray"
            >
              Manage Token Lists
            </button>
          </div>
        )} */}
      </div>
    </div>
    // <div className="flex flex-col max-h-[inherit] h-full">
    //   <ModalHeader
    //     title="Select a token"
    //     titleClassName="text-white text-2xl font-semibold"
    //     className="h-full px-6 py-5 bg-space-grey"
    //     onClose={onDismiss}
    //   />
    //   <div className="flex flex-1 flex-col pr-6 pb-8 min-w-[82vw] md:min-w-[400px]">
    //     {!currencyList && (
    //       <div className="mt-0 mb-3 sm:mt-3 sm:mb-8">
    //         <input
    //           type="text"
    //           id="token-search-input"
    //           placeholder="Search name or paste address"
    //           autoComplete="off"
    //           value={searchQuery}
    //           ref={inputRef as RefObject<HTMLInputElement>}
    //           onChange={handleInput}
    //           onKeyDown={handleEnter}
    //           className="w-full bg-transparent border border-dark-700 focus:outline-none rounded placeholder-secondary focus:placeholder-primary font-bold text-base px-6 py-3.5"
    //         />
    //       </div>
    //     )}

    //     <div className="flex">
    //       <div className="flex flex-wrap w-24 bg-white max-h-[inherit]">
    //         {AVAILABLE_NETWORKS.map((network) => (
    //           <div className="flex flex-col items-center justify-center w-10 h-10 m-1">
    //             <img className="w-10 h-10" src={`${NETWORK_ICON[network]}`} />
    //             <p>{NETWORK_LABEL[network]}</p>
    //           </div>
    //         ))}
    //       </div>
    //       {searchToken ? (
    //         <div style={{ padding: "20px 0", height: "100%" }}>
    //           <ImportRow
    //             token={searchToken}
    //             showImportView={showImportView}
    //             setImportToken={setImportToken}
    //           />
    //         </div>
    //       ) : filteredSortedTokens?.length > 0 ? (
    //         <div className="h-screen">
    //           <AutoSizer disableWidth>
    //             {({ height }) => (
    //               <CurrencyList
    //                 height={height}
    //                 currencies={
    //                   includeNativeCurrency
    //                     ? filteredSortedTokensWithETH
    //                     : filteredSortedTokens
    //                 }
    //                 onCurrencySelect={handleCurrencySelect}
    //                 otherCurrency={otherSelectedCurrency}
    //                 selectedCurrency={selectedCurrency}
    //                 fixedListRef={fixedList}
    //                 showImportView={showImportView}
    //                 setImportToken={setImportToken}
    //               />
    //             )}
    //           </AutoSizer>
    //         </div>
    //       ) : (
    //         <div style={{ padding: "20px", height: "100%" }}>
    //           <div className="mb-8 text-center">No results found</div>
    //         </div>
    //       )}
    //     </div>
    //     {/* {allowManageTokenList && (
    //       <div className="mt-3">
    //         <button
    //           id="list-token-manage-button"
    //           onClick={showManageView}
    //           color="gray"
    //         >
    //           Manage Token Lists
    //         </button>
    //       </div>
    //     )} */}
    //   </div>
    // </div>
  );
}
