import React, { CSSProperties } from "react";
import styled from "styled-components";
import { CheckCircle } from "@mui/icons-material";
import { Token } from "state/types";
import Logo from "components/Logo";

const TokenSection = styled.div<{ dim?: boolean }>`
  padding: 4px 20px;
  height: 56px;
  display: grid;
  grid-template-columns: auto minmax(auto, 1fr) auto;
  grid-gap: 16px;
  align-items: center;

  opacity: ${({ dim }) => (dim ? "0.4" : "1")};
`;

const CheckIcon = styled(CheckCircle)`
  height: 16px;
  width: 16px;
  margin-right: 6px;
`;

const NameOverflow = styled.div`
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 140px;
  font-size: 12px;
`;

export default function ImportRow({
  token,
  style,
  dim,
  showImportView,
  setImportToken,
}: {
  token: Token;
  style?: CSSProperties;
  dim?: boolean;
  showImportView: () => void;
  setImportToken: (token: Token) => void;
}) {
  // check if already active on list or local storage tokens

  return (
    <TokenSection style={style}>
      <Logo
        src={token.logoURI}
        height="100%"
        width={"24px"}
        style={{ opacity: dim ? "0.6" : "1" }}
      />
      <div style={{ opacity: dim ? "0.6" : "1" }}>
        <div>
          <div className="font-semibold">{token.symbol}</div>
          <div className="ml-2 font-light">
            <NameOverflow title={token.name}>{token.name}</NameOverflow>
          </div>
        </div>
      </div>
      <div style={{ minWidth: "fit-content" }}>
        <CheckIcon />
        <div className="text-green">Active</div>
      </div>
    </TokenSection>
  );
}
