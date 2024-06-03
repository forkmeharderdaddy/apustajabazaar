import type { AppProps } from "next/app";
import { Navbar } from "../components/Navbar/Navbar";
import NextNProgress from "nextjs-progressbar";
import { NETWORK } from "../const/contractAddresses";
import { Toaster } from "react-hot-toast";
import { ThirdwebProvider as ThirdwebProviderV5 } from "thirdweb/react";

import "../styles/globals.css";
import { ThirdwebProvider } from "@thirdweb-dev/react";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    /* Workaround to use V5 */
    <ThirdwebProvider
      clientId={process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID}
      activeChain={NETWORK}
    >
      <ThirdwebProviderV5>
        {/* Progress bar when navigating between pages */}
        <NextNProgress
          color="var(--color-tertiary)"
          startPosition={0.3}
          stopDelayMs={200}
          height={3}
          showOnShallow={true}
        />

        {/* Render the navigation menu above each component */}
        <Navbar />
        {/* Render the actual component (page) */}
        <Component {...pageProps} />
        <Toaster />
      </ThirdwebProviderV5>
    </ThirdwebProvider>
  );
}

export default MyApp;
