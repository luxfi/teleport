import React, { useCallback, useEffect } from "react";

import Logo from "/public/images/logo.svg";
import CloseWallet from "/public/icons/close-wallet.svg";
import { useModalOpen, useWalletSidebarToggle } from "state/application/hooks";
import { ApplicationModal } from "state/application/actions";
import Sidebar from "components/Sidebar";
import { getOptions } from "modals/WalletModal";
import useActiveWeb3React from "hooks/useActiveWeb3React";

const WalletSidebar = () => {
  const walletSidebarOpen = useModalOpen(ApplicationModal.SIDEBAR);
  const { account, connector } = useActiveWeb3React();
  const toggleWalletSidebar = useWalletSidebarToggle();

  useEffect(() => {
    walletSidebarOpen && (document.body.style.overflow = "hidden");

    return () => {
      document.body.style.overflowY = "unset";
    };
  }, [walletSidebarOpen]);

  useEffect(() => {
    if (account && walletSidebarOpen) {
      toggleWalletSidebar();
    }
  }, [account]);

  return (
    <Sidebar isOpen={walletSidebarOpen} onDismiss={toggleWalletSidebar}>
      <div className="w-full h-screen px-8 py-12 overflow-y-auto bg-dark1 no-scrollbar">
        <div className="flex items-center justify-between">
          <img src={Logo.src} alt="Logo" className="w-11 lg:w-16" />

          <button onClick={toggleWalletSidebar} className="outline-none">
            <img src={CloseWallet.src} alt="Close" />
          </button>
        </div>

        <div className="pt-24">
          <h1 className="text-xl font-semibold text-white font-work_sans">
            Let’s get started
          </h1>
          <h1 className="mt-2 text-base font-normal text-white font-work_sans text-opacity-60">
            By connecting your wallet, you agree to our Terms of Service and our
            Privacy Policy.
          </h1>
        </div>

        <div className="mt-20">{getOptions()}</div>
      </div>
    </Sidebar>
  );
};

export default WalletSidebar;
