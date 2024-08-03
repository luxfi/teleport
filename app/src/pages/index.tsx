import dynamic from "next/dynamic";
import Head from "next/head";
import Swap from "./swap";

export default function Home() {
  return (
    <>
      <div>
        <Head>
          <title>LUX</title>
          <meta name="description" content="Lux Bridge" />
          <link rel="icon" href="/lux-logo.png" />
        </Head>
      </div>
    </>
  );
}
