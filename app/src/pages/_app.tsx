import "../styles/index.css";
import type { AppProps } from "next/app";
import type { NextPage } from "next";
import { FunctionComponent } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import React, { useEffect } from "react";
import { store, persistor } from "../state/store";
import { Provider as ReduxProvider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import AppLayout from "layouts/AppLayout";
import dynamic from "next/dynamic";
import Head from "next/head";
import { MoralisProvider } from "react-moralis";
import useActiveWeb3React from "hooks/useActiveWeb3React";
import { ChainId } from "constants/chainIds";

type NextPageWithLayout = NextPage & {
  getLayout?: (page: React.ReactElement) => React.ReactNode;
};

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
  Layout: FunctionComponent;
  Guard: FunctionComponent;
};

const HooksProvider = dynamic(
  () => import("../state/application/HooksProvider"),
  { ssr: false }
);

const useEagerWalletConnect = () => {
  const { chainId, connector } = useActiveWeb3React();
  console.log("useEagerWalletConnect", chainId);
  useEffect(() => {
    connector.activate();
  }, [chainId, connector]);
};

const GlobalHooks = () => {
  useEagerWalletConnect();
  return null;
};

function App({ Component, pageProps }: AppPropsWithLayout) {
  return (
    <>
      <Head>
        <link
          rel="stylesheet"
          href="https://pro.fontawesome.com/releases/v5.10.0/css/all.css"
          integrity="sha384-AYmEC3Yw5cVb3ZcuHtOA93w35dYTsvhLPVnYs9eStHfGJvOvKxVfELGroGkvsg+p"
          crossOrigin="anonymous"
        />
      </Head>
      <MoralisProvider /* cspell: disable-line */
        appId="ILIieVqZyWlL0ErAjiG9L1X6fep2KEFkKczcGOmJ"
        serverUrl="https://hyrix9h7cyfi.usemoralis.com:2053/server"
        // initializeOnMount={false}
      >
        <ReduxProvider store={store}>
          <PersistGate
            loading={
              <div
                className="absolute flex items-center justify-center"
                style={{
                  top: "0",
                  left: "0",
                  width: "100%",
                  height: "100%",
                }}
              >
                <div className=""></div>
              </div>
            }
            persistor={persistor}
          >
            <HooksProvider>
              <></>
              <GlobalHooks />
              <AppLayout>
                <Component {...pageProps} />
              </AppLayout>
              <ToastContainer />
            </HooksProvider>
          </PersistGate>
        </ReduxProvider>
      </MoralisProvider>
    </>
  );
}

export default App;
