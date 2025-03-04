import { createGlobalStyle, ThemeProvider } from "styled-components";
import { UserProvider } from "../context/UserContext";

const GlobalStyle = createGlobalStyle`
  body {
    margin: 0;
    font-family: 'Arial', sans-serif;
    background-color: #0f0f0f;
    color: white;
  }
`;

const theme = {
  colors: {
    primary: "#0070f3",
  },
};

function MyApp({ Component, pageProps }) {
  return (
    <UserProvider>
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <Component {...pageProps} />
    </ThemeProvider>
    </UserProvider>
  );
}

export default MyApp;
