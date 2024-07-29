import {
  ApolloClient,
  ApolloLink,
  ApolloProvider,
  createHttpLink,
  InMemoryCache
} from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { PublicClientApplication } from "@azure/msal-browser";
import { MsalProvider } from "@azure/msal-react";
import ReactDOM from "react-dom/client";
import { msalConfig } from "./api/auth/request";
import App from "./App.tsx";
import "./index.css";
import { cookieHelper } from "./utils/cookie.ts";
import { onError } from "@apollo/client/link/error";
import { toast } from "react-toastify";
import { TOAST_TOKEN } from "./constants/toastId.ts";
import { BrowserRouter } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

// Adds messages only in a dev environment
// loadDevMessages();
// loadErrorMessages();

const msalInstance = new PublicClientApplication(msalConfig);

const httpLink = createHttpLink({
  uri: import.meta.env.VITE_DEV_BACK_END_API,
  credentials: "same-origin"
});

const getNewToken = async () => {
  const res = await fetch(import.meta.env.VITE_DEV_REFRESH_TOKEN, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ refreshToken: cookieHelper.get(cookieHelper.COOKIE_KEYS.REFRESH_TOKEN) })
  });

  if (res.status === 200) {
    const data = res.json();
    data.then(({ accessToken, refreshToken }) => {
      cookieHelper.set(cookieHelper.COOKIE_KEYS.ACCESS_TOKEN, accessToken);
      cookieHelper.set(cookieHelper.COOKIE_KEYS.REFRESH_TOKEN, refreshToken);
      return `Bearer ${accessToken}`;
    });
  } else {
    toast.warn("Session expired please sign in again!", { toastId: TOAST_TOKEN.EXPIRED });
    window.location.href = "http://localhost:5173/error";
  }
};

const authLink = setContext(async (_, { headers }) => {
  const token = cookieHelper.get(cookieHelper.COOKIE_KEYS.ACCESS_TOKEN);
  const decoded = jwtDecode(token as string);

  // check expire accesstoken and get new accesstoken
  if (decoded.exp) {
    if (Date.now() <= decoded.exp * 1000) {
      return {
        headers: {
          ...headers,
          authorization: token ? `Bearer ${token}` : "",
          "Content-Type": "application/json"
        }
      };
    } else {
      const newToken = await getNewToken();
      return {
        headers: {
          ...headers,
          authorization: newToken,
          "Content-Type": "application/json"
        }
      };
    }
  }
});

// catch error UNAUTHENTICATED when call api
const logoutLink = onError(({ graphQLErrors, networkError, operation, forward }) => {
  if (graphQLErrors) {
    // eslint-disable-next-line prefer-const
    for (let err of graphQLErrors) {
      switch (err.extensions.code) {
        case "UNAUTHENTICATED": {
          const oldHeaders = operation.getContext().headers;
          operation.setContext({
            headers: {
              ...oldHeaders,
              authorization: getNewToken()
            }
          });
          return forward(operation);
        }
      }
    }
  }

  if (networkError) {
    console.error(`[Network error]: ${networkError}`);
  }
});

const client = new ApolloClient({
  link: ApolloLink.from([authLink, logoutLink, httpLink]),
  cache: new InMemoryCache()
});

// Render the app
const rootElement = document.getElementById("root")!;
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    // <StrictMode>
    <MsalProvider instance={msalInstance}>
      <BrowserRouter>
        <ApolloProvider client={client}>
          <App />
        </ApolloProvider>
      </BrowserRouter>
    </MsalProvider>
  );
}

export default App;
