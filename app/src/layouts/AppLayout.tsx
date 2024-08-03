import { ReactNode, ReactElement } from "react";

// components
import Header from "components/Header";
import Footer from "components/Footer";
import { useActiveWeb3React } from "hooks/useActiveWeb3React";
import { ChainId } from "constants/chainIds";

interface AppLayoutProps {
  children: ReactNode;
}

const AppLayout = ({ children }: AppLayoutProps) => {
  const { chainId } = useActiveWeb3React();
  return (
    <div className="z-0 flex flex-col items-center w-full min-h-screen pb-16 lg:pb-0">
      <Header />
      <main
        className="flex flex-col items-center justify-start flex-grow w-full h-full bg-black"
        // style={{ height: "max-content" }}
      >
        {children}
      </main>
      {/* <Footer /> */}
    </div>
  );
};

export default AppLayout;

export const getLayout = (page: ReactElement) => {
  return <AppLayout>{page}</AppLayout>;
};
