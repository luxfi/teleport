import React, { useCallback, useEffect, useState } from "react";
import CurrencyModalView from "./CurrencyModalView";
import { CurrencySearch } from "./CurrencySearch";
import Modal from "components/Modal";
import { Token, TokenList } from "state/types";
import useLast from "hooks/useLast";
import usePrevious from "hooks/usePrevious";
import { TokenListProvider, TokenInfo } from "@solana/spl-token-registry";
import { ChainId } from "constants/chainIds";

interface CurrencySearchModalProps {
  isOpen: boolean;
  onDismiss: () => void;
  selectedCurrency?: Token | null;
  onCurrencySelect: (currency: Token) => void;
  otherSelectedCurrency?: Token | null;
  showCommonBases?: boolean;
  currencyList?: string[];
  includeNativeCurrency?: boolean;
  allowManageTokenList?: boolean;
  onChainChange?: (chain: number) => void;
  onTokenChange?: (token: string) => void;
}

function CurrencySearchModal({
  isOpen,
  onDismiss,
  onCurrencySelect,
  selectedCurrency,
  otherSelectedCurrency,
  currencyList,
  showCommonBases = false,
  includeNativeCurrency = true,
  allowManageTokenList = true,
  onChainChange,
}: CurrencySearchModalProps) {
  const [tokenMap, setTokenMap] = useState<Map<string, TokenInfo>>(new Map());
  const [modalView, setModalView] = useState<CurrencyModalView>(
    CurrencyModalView.manage
  );
  const lastOpen = useLast(isOpen);

  // useEffect(() => {
  //   new TokenListProvider().resolve().then((tokens) => {
  //     const tokenList = tokens.filterByChainId(ChainId.MAINNET).getList();
  //     console.log("tokens.render", tokens);
  //     console.log("tokenList.render", tokenList);

  //     setTokenMap(
  //       tokenList.reduce((map, item) => {
  //         map.set(item.address, item);
  //         return map;
  //       }, new Map())
  //     );
  //   });
  // }, [setTokenMap]);

  // console.log("tokenMap.render", tokenMap);

  useEffect(() => {
    if (isOpen && !lastOpen) {
      setModalView(CurrencyModalView.search);
    }
  }, [isOpen, lastOpen]);

  const handleCurrencySelect = useCallback(
    (currency: Token) => {
      onCurrencySelect(currency);
      onDismiss();
    },
    [onDismiss, onCurrencySelect]
  );

  // for token import view
  const prevView = usePrevious(modalView);

  // used for import token flow
  const [importToken, setImportToken] = useState<Token | undefined>();

  // used for import list
  const [importList, setImportList] = useState<TokenList | undefined>();
  const [listURL, setListUrl] = useState<string | undefined>();

  // change min height if not searching
  const minHeight =
    modalView === CurrencyModalView.importToken ||
    modalView === CurrencyModalView.importList
      ? 40
      : 75;
  return (
    <Modal
      // maxWidth={800}
      isOpen={isOpen}
      onDismiss={onDismiss}
      // minHeight={minHeight}
      maxHeight={85}
      isMax={true}
      noPadding
    >
      {modalView === CurrencyModalView.search ? (
        <CurrencySearch
          isOpen={isOpen}
          onDismiss={onDismiss}
          onCurrencySelect={handleCurrencySelect}
          selectedCurrency={selectedCurrency}
          otherSelectedCurrency={otherSelectedCurrency}
          showCommonBases={showCommonBases}
          showImportView={() => setModalView(CurrencyModalView.importToken)}
          setImportToken={setImportToken}
          showManageView={() => setModalView(CurrencyModalView.manage)}
          currencyList={currencyList}
          includeNativeCurrency={includeNativeCurrency}
          allowManageTokenList={allowManageTokenList}
          onChainChange={onChainChange}
        />
      ) : (
        ""
      )}
    </Modal>
  );
}

CurrencySearchModal.whyDidYouRender = true;

export default CurrencySearchModal;
