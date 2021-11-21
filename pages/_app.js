import "../styles/globals.css";
import "../styles/main.css";

import { ChakraProvider } from "@chakra-ui/react";

function MyApp({ Component, pageProps }) {
  return (
    <ChakraProvider>
      <div className="app">
        <div className="blur-box">
          <Component {...pageProps} />
        </div>
      </div>
    </ChakraProvider>
  );
}

export default MyApp;
