import { createAction } from "@reduxjs/toolkit";
import { ChainId } from "constants/chainIds";
import { Balance, MoralisError, Token, TokenSelect, ChainSelect } from "state/types";
export enum Field {
  INPUT = "from",
  OUTPUT = "to",
}
export const loading = createAction<boolean>("swap/loading");
export const fetchTokens =
  createAction<{ [chainId in ChainId]?: Token[] }>("swap/fetchTokens");
export const updateCurrentTrade = createAction<null | {
  to: Token | {};
  from: Token | {};
}>("swap/updateCurrentTrade");
export const updateError = createAction<MoralisError>("swap/updateError");
export const updateCurrentSelectSide = createAction<"from" | "to">(
  "swap/updateCurrentSelectSide"
);
export const updateCurrentAmount = createAction<TokenSelect>(
  "swap/updateCurrentAmount"
);
export const fetchBalances = createAction<{ [chain in ChainId]?: Balance[] }>("swap/fetchBalances");
export const updateCurrentBalances = createAction<TokenSelect>(
  "swap/updateCurrentBalances"
);
export const updateActiveChains = createAction<ChainSelect>(
  "swap/updateActiveChains"
);
