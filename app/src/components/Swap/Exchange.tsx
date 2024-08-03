import React, { ReactNode, useCallback, useEffect, useState } from "react";
import selectCoinAnimation from "../../assets/animations/select-coin.json";

// import CurrencySearchModal from '../modals/SearchModal/CurrencySearchModal'
// import DoubleCurrencyLogo from './DoubleLogo'
import { FiatValue } from "./FiatValue";
import Lottie from "lottie-react";
import { DebounceInput } from "react-debounce-input";

import { Balance, Token } from "state/types";
import Logo from "components/Logo";
import { ChevronDownIcon } from "@heroicons/react/outline";
import { useGetTokenFiatValue } from "state/swap/hooks";
import CurrencySearchModal from "modals/SearchModal/CurrencySearchModal";
import Image from "next/image";
import Web3 from "web3";
import useActiveWeb3React from "hooks/useActiveWeb3React";
import { useLbtcContract } from "hooks/useContract";
import { SUPPORTED_NETWORKS } from "config/networks";
import { useMoralisWeb3Api } from "react-moralis";

interface ExchangePanelProps {
  value?: string;
  onUserInput?: (value: string) => void;
  onMax?: () => void;
  showMaxButton: boolean;
  label?: string;
  onCurrencySelect?: (currency: Token) => void;
  token?: Token | null;
  otherToken?: Token | null;
  disableCurrencySelect?: boolean;
  hideBalance?: boolean;
  hideInput?: boolean;
  id: string;
  showCommonBases?: boolean;
  locked?: boolean;
  customBalanceText?: string;
  selectedCurrencyBalance: string;
  fiatValue?: number | null;
  onKeyDownFunc: () => void;
  onChainChange?: (chain: number) => void;
  onTokenChange?: (token: string) => void;
  chainBalances: Balance[];
}

export default function ExchangePanel({
  value,
  onUserInput,
  onMax,
  showMaxButton,
  label = "Input",
  onCurrencySelect,
  token,
  disableCurrencySelect = false,
  id,
  hideBalance = false,
  hideInput = false,
  locked = false,
  customBalanceText,
  selectedCurrencyBalance,
  fiatValue,
  otherToken,
  onKeyDownFunc,
  onChainChange,
  onTokenChange,
  chainBalances,
}: ExchangePanelProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const balance = chainBalances.find(
    (balance) => balance.symbol == token?.symbol
  );
  const handleDismissSearch = useCallback(() => {
    setTimeout(() => {
      setModalOpen(false);
    }, 100);
  }, [setModalOpen]);

  const [fiat, setFiat] = useState(0);
  // const fiatValue =
  // const getTokenFiatValue = useGetTokenFiatValue();

  // const initFetch = useCallback(async () => {
  //   const val = await getTokenFiatValue(
  //     token?.isNative
  //       ? "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"
  //       : token?.address
  //   );
  //   console.log("valll getTokenFiatValue here", val);
  //   setFiat(val);
  // }, [getTokenFiatValue, token?.address, token?.isNative]);
  // useEffect(() => {
  //   initFetch();
  // }, [initFetch, token]);
  const onKeyDown = function (e) {
    var key = e.keyCode ?? e.which;

    if (
      !(
        [8, 9, 13, 27, 46, 110, 190].indexOf(key) !== -1 ||
        (key == 65 && (e.ctrlKey || e.metaKey)) ||
        (key >= 35 && key <= 40) ||
        (key >= 48 && key <= 57 && !(e.shiftKey || e.altKey)) ||
        (key >= 96 && key <= 105)
      )
    )
      e.preventDefault();
  };

  return (
    <div
      id={id}
      className={`${hideInput ? "py-4" : "py-5"} rounded bg-space-dark`}
    >
      <div className="flex flex-col justify-between space-y-3">
        <div className={"w-full flex items-center justify-between"}>
          <button
            type="button"
            className={`${
              !!token ? "text-primary" : "text-high-emphesis"
            } open-currency-select-button h-full outline-none select-none cursor-pointer border border-white-10 text-xl font-medium items-center rounded-full ${
              token ? "bg-white-2" : "bg-primary-300"
            } `}
            onClick={() => {
              if (onCurrencySelect) {
                console.log("opening modal", modalOpen);
                setModalOpen(true);
              }
            }}
          >
            <div className="flex items-center gap-1.5 rounded-full bg-space-grey p-2 pl-3.5">
              {token && (
                <div className="flex items-center">
                  <Logo
                    src={token?.logoURI}
                    width={"24px"}
                    height={"24px"}
                    alt={token?.symbol}
                    className="rounded"
                  />
                </div>
              )}
              <div className="text-lg font-semibold text-white token-symbol-container md:text-xl">
                {token && token.symbol ? (
                  token.symbol
                ) : (
                  <div className="px-2 py-1 mt-1 text-xs font-medium text-white bg-primary-300 border-low-emphesis whitespace-nowrap ">
                    Select a token
                  </div>
                )}
              </div>
              {!disableCurrencySelect && token && (
                <ChevronDownIcon
                  width={16}
                  height={16}
                  className="stroke-primary-300"
                />
              )}
            </div>
          </button>
          <div className="text-right">
            <DebounceInput
              style={{
                WebkitAppearance: "none",
                margin: 0,
                MozAppearance: "textfield",
              }}
              pattern="^[0-9]*[.,]?[0-9]*$"
              title="Token Amount"
              placeholder="Enter an amount"
              className="border-none outline-none focus:outline-none bg-transparent text-right placeholder:text-[#626471] text-xl placeholder:text-xl text-white appearance-none overflow-ellipsis placeholder-low-emphesis"
              inputMode="decimal"
              onKeyDown={(e) => {
                onKeyDown(e);
                onKeyDownFunc();
              }}
              onChange={(e) => onUserInput(e.target.value)}
              value={value}
              type="number"
              minLength={1}
              debounceTimeout={2000}
            />

            {!hideBalance && token && balance ? (
              <div className="flex flex-col">
                <div
                  onClick={onMax}
                  className="text-xs font-medium text-right cursor-pointer text-low-emphesis"
                >
                  {`Balance:`}{" "}
                  {parseFloat(
                    balance ? Web3.utils.fromWei(balance.balance) : "0"
                  ).toFixed(2)}{" "}
                  {token.symbol}
                </div>
                <FiatValue fiatValue={fiat * parseFloat(value)} />
              </div>
            ) : null}
          </div>
        </div>
        {/* {!hideInput && (
          <div className="flex items-center w-full p-3 space-x-3 rounded bg-transaparent text-space-light-gray focus:bg-dark-700">
            <>
              {showMaxButton && selectedCurrencyBalance && (
                <button
                  onClick={onMax}
                  className="p-1 mr-1 text-xs font-medium bg-transparent border rounded hover:bg-vote-button hover:text-white border-low-emphesis text-secondary whitespace-nowrap"
                >
                  Max
                </button>
              )}
              {!hideBalance && token && selectedCurrencyBalance ? (
                <div className="flex flex-col">
                  <div
                    onClick={onMax}
                    className="text-xs font-medium text-right cursor-pointer text-low-emphesis"
                  >
                    {`Balance:`}{" "}
                    {parseFloat(selectedCurrencyBalance).toFixed(2)}{" "}
                    {token.symbol}
                  </div>
                  <FiatValue fiatValue={fiat * parseFloat(value)} />
                </div>
              ) : null}
            </>
          </div>
        )} */}
      </div>
      {!disableCurrencySelect && onCurrencySelect && modalOpen && (
        <CurrencySearchModal
          isOpen={modalOpen}
          onDismiss={handleDismissSearch}
          onCurrencySelect={onCurrencySelect}
          selectedCurrency={token}
          otherSelectedCurrency={otherToken}
          showCommonBases={true}
          onChainChange={onChainChange}
        />
      )}
    </div>
  );
}
