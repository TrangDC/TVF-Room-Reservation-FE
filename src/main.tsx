import {
  ApolloClient,
  ApolloLink,
  ApolloProvider,
  createHttpLink,
  InMemoryCache
} from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { onError } from "@apollo/client/link/error";
import { PublicClientApplication } from "@azure/msal-browser";
import { MsalProvider } from "@azure/msal-react";
import { jwtDecode } from "jwt-decode";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { toast } from "react-toastify";
import { msalConfig } from "./api/auth/request";
import App from "./App.tsx";
import { TOAST_TOKEN } from "./constants/toastId.ts";
import "./index.css";
import useUserStore from "./store/store.ts";
import { cookieHelper } from "./utils/cookie.ts";
import { localStorageHelper } from "./utils/localStorage.ts";

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
    toast.warn("Session expired, please wait for new session!", { toastId: TOAST_TOKEN.EXPIRED });
    cookieHelper.remove(cookieHelper.COOKIE_KEYS.ACCESS_TOKEN);
    cookieHelper.remove(cookieHelper.COOKIE_KEYS.REFRESH_TOKEN);
    location.reload();
  }
};

const authLink = setContext(async (_, { headers }) => {
  const token = cookieHelper.get(cookieHelper.COOKIE_KEYS.ACCESS_TOKEN);
  //   await handleCheckToken(token as string);
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
  } else {
    toast.warn("Session expired, please wait for new session!", { toastId: TOAST_TOKEN.EXPIRED });
    cookieHelper.remove(cookieHelper.COOKIE_KEYS.ACCESS_TOKEN);
    cookieHelper.remove(cookieHelper.COOKIE_KEYS.REFRESH_TOKEN);
    location.reload();
  }
});

// catch error UNAUTHENTICATED when call api
const logoutLink = onError(({ graphQLErrors, networkError, operation }) => {
  // check case 401
  const { response } = operation.getContext();
  if (response.status === 401) {
    localStorageHelper.clearAll();
    useUserStore.persist.clearStorage();
    cookieHelper.remove(cookieHelper.COOKIE_KEYS.ACCESS_TOKEN);
    cookieHelper.remove(cookieHelper.COOKIE_KEYS.REFRESH_TOKEN);
    toast.warn("Session expired, please wait for new session!", { toastId: TOAST_TOKEN.EXPIRED });
    location.reload();
  }
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path }) => {
      if (message === "Unauthorized") {
        console.error(
          `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
        );
      } else {
        console.error(
          `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
        );
      }
    });
  }
  if (networkError) {
    console.error("[Network error]:", networkError);
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
