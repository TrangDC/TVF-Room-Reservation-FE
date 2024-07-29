// import { LogLevel } from '@azure/msal-browser';

export const msalConfig = {
  auth: {
    clientId: import.meta.env.VITE_DEV_CLIENT_ID,
    authority: import.meta.env.VITE_DEV_AUTHORITY + import.meta.env.VITE_DEV_TENANT_ID,
    redirectUri: import.meta.env.VITE_DEV_REDIRECT_URI,
    postLogoutRedirectUri: import.meta.env.VITE_DEV_REDIRECT_URI
  },
  cache: {
    cacheLocation: 'sessionStorage', // This configures where your cache will be stored
    storeAuthStateInCookie: false // Set this to "true" if you are having issues on IE11 or Edge
  },
  system: {
    loggerOptions: {
      loggerCallback: (containsPii: unknown) => {
        if (containsPii) {
          return;
        }
        // switch (level) {
        //   case LogLevel.Error:
        //     console.error(message);
        //     return;
        //   case LogLevel.Info:
        //     console.info(message);
        //     return;
        //   case LogLevel.Verbose:
        //     console.debug(message);
        //     return;
        //   case LogLevel.Warning:
        //     console.warn(message);
        //     return;
        //   default:
        //     return;
        // }
      }
    }
  }
};
export const loginRequest = {
  scopes: ['User.Read']
};

export const graphConfig = {
  graphMeEndpoint: 'https://graph.microsoft.com/v1.0/me' //e.g. https://graph.microsoft.com/v1.0/me
};
