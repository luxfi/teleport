import React, {
  CSSProperties,
  MutableRefObject,
  useCallback,
  useMemo,
} from "react";

import { FixedSizeList } from "react-window";
import ImportRow from "./ImportRow";
import { MenuItem } from "./styleds";
import styled from "styled-components";
import { Token } from "state/types";
import useActiveWeb3React from "hooks/useActiveWeb3React";
import Logo from "components/Logo";
import { useTokenBalance } from "state/swap/hooks";
import Loader from "components/Loader";
import Image from "next/image";

function currencyKey(currency: Token): string {
  return currency.isNative ? "ETHER" : currency.address;
}

const Tag = styled.div`
  font-size: 14px;
  border-radius: 4px;
  padding: 0.25rem 0.3rem 0.25rem 0.3rem;
  max-width: 6rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  justify-self: flex-end;
  margin-right: 4px;
`;

const FixedContentRow = styled.div`
  padding: 4px 20px;
  height: 56px;
  display: grid;
  grid-gap: 16px;
  align-items: center;
`;

function Balance({ balance }: { balance: number }) {
  return (
    <div
      className="whitespace-nowrap overflow-hidden max-w-[5rem] overflow-ellipsis"
      title={balance.toString()}
    >
      {balance.toFixed(4)}
    </div>
  );
}

const TagContainer = styled.div`
  display: flex;
  justify-content: flex-end;
`;

const TokenListLogoWrapper = styled.img`
  height: 20px;
`;

// function TokenTags({ currency }: { currency: Currency }) {
//   if (!(currency instanceof WrappedTokenInfo)) {
//     return <span />
//   }

//   const tags = currency.tags
//   if (!tags || tags.length === 0) return <span />

//   const tag = tags[0]

//   return (
//     <TagContainer>
//       <MouseoverTooltip text={tag.description}>
//         <Tag key={tag.id}>{tag.name}</Tag>
//       </MouseoverTooltip>
//       {tags.length > 1 ? (
//         <MouseoverTooltip
//           text={tags
//             .slice(1)
//             .map(({ name, description }) => `${name}: ${description}`)
//             .join('; \n')}
//         >
//           <Tag>...</Tag>
//         </MouseoverTooltip>
//       ) : null}
//     </TagContainer>
//   )
// }

function CurrencyRow({
  currency,
  onSelect,
  isSelected,
  otherSelected,
  style,
}: {
  currency: Token;
  onSelect: () => void;
  isSelected: boolean;
  otherSelected: boolean;
  style: CSSProperties;
}) {
  const { account, chainId } = useActiveWeb3React();
  const key = currencyKey(currency);
  // const balance = useTokenBalance(currency);

  // only show add or remove buttons if not on selected list
  return (
    <MenuItem
      id={`token-item-${key}`}
      style={{
        ...style,
        width: "100%",
        display: "flex",
        justifyContent: "space-between",
      }}
      className={`hover:bg-dark-800 rounded bg-red-500 flex text-white cursor-pointer`}
      onClick={() => (isSelected ? null : onSelect())}
      // disabled={isSelected}
      // selected={otherSelected}
    >
      <div className="flex items-center flex-1 my-8">
        <div className="flex items-center">
          <Logo src={currency.logoURI} height={32} width={32} />
        </div>
        <div className="ml-2">
          <div title={currency.name} className="text-sm font-medium">
            {currency.symbol}
          </div>
          <div className="text-[10px] text-white">{currency.name}</div>
        </div>
      </div>
      <div className="flex items-center justify-end">
        <Image
          src="/icons/star.svg"
          alt=""
          width={20}
          height={20}
          className="cursor-pointer"
        />
      </div>
      {/* <TokenTags currency={currency} /> */}
      {/* <div className="flex items-center justify-end bg-red-500">
        {balance ? (
          <Balance balance={parseFloat(balance)} />
        ) : account ? (
          <Loader />
        ) : null}
      </div> */}
    </MenuItem>
  );
}

const BREAK_LINE = "BREAK";
type BreakLine = typeof BREAK_LINE;
function isBreakLine(x: unknown): x is BreakLine {
  return x === BREAK_LINE;
}

function BreakLineComponent({ style }: { style: CSSProperties }) {
  return (
    <FixedContentRow style={style}>
      <div>
        <div>
          <TokenListLogoWrapper src="/tokenlist.svg" />
          <h6 className="ml-3">Expanded results from inactive Token Lists</h6>
        </div>
      </div>
    </FixedContentRow>
  );
}

export default function CurrencyList({
  height,
  currencies,
  selectedCurrency,
  onCurrencySelect,
  otherCurrency,
  fixedListRef,
  showImportView,
  setImportToken,
}: {
  height: number;
  currencies: Token[];
  selectedCurrency?: Token | null;
  onCurrencySelect: (currency: Token) => void;
  otherCurrency?: Token | null;
  fixedListRef?: MutableRefObject<FixedSizeList | undefined>;
  showImportView: () => void;
  setImportToken: (token: Token) => void;
}) {
  const itemData: (Token | BreakLine)[] = useMemo(() => {
    return currencies;
  }, [currencies]);

  const Row = useCallback(
    function TokenRow({ data, index, style }) {
      const row: Token | BreakLine = data[index];

      if (isBreakLine(row)) {
        return <BreakLineComponent style={style} />;
      }

      const currency = row;

      const isSelected = Boolean(
        currency && selectedCurrency && selectedCurrency === currency
      );
      const otherSelected = Boolean(
        currency && otherCurrency && otherCurrency === currency
      );
      const handleSelect = () => currency && onCurrencySelect(currency);

      const token = !currency?.isNative;

      const showImport = index > currencies.length;

      if (showImport && token) {
        return (
          <ImportRow
            token={currency}
            style={style}
            dim
            showImportView={showImportView}
            setImportToken={setImportToken}
          />
        );
      } else if (currency) {
        return (
          <CurrencyRow
            style={style}
            currency={currency}
            isSelected={isSelected}
            onSelect={handleSelect}
            otherSelected={otherSelected}
          />
        );
      } else {
        return null;
      }
    },
    [
      currencies.length,
      onCurrencySelect,
      otherCurrency,
      selectedCurrency,
      setImportToken,
      showImportView,
    ]
  );

  const itemKey = useCallback((index: number, data: typeof itemData) => {
    const currency = data[index];
    if (isBreakLine(currency)) return BREAK_LINE;
    return currencyKey(currency);
  }, []);

  return (
    <FixedSizeList
      height={height}
      ref={fixedListRef as any}
      width="100%"
      itemData={itemData}
      itemCount={itemData.length}
      itemSize={64}
      itemKey={itemKey}
    >
      {Row}
    </FixedSizeList>
  );
}
