import Button from "components/Button";
import React from "react";
import {
  useWalletModalToggle,
  useWalletSidebarToggle,
} from "../../state/application/hooks";

export default function Web3Connect({
  color = "gray",
  size = "sm",
  className = "",
  title,
  ...rest
}: any) {
  const toggleWalletModal = useWalletModalToggle();
  // const toggleWalletSidebar = useWalletSidebarToggle();

  return (
    <Button
      id="connect-wallet"
      onClick={toggleWalletModal}
      variant="outlined"
      color={color}
      className={className}
      size={size}
      {...rest}
    >
      {title}
    </Button>
  );
}
