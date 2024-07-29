import Cookies from "js-cookie";

const COOKIE_KEYS = {
  ACCESS_TOKEN: "accessToken",
  REFRESH_TOKEN: "refreshToken"
};

const get = (key: string) => {
  if (typeof window !== "undefined") {
    const rs = Cookies.get(key);
    try {
      return rs ? rs : null;
    } catch {
      return null;
    }
  }
};

const set = (key: string, value?: string, options?: object): void => {
  if (typeof window !== "undefined" && localStorage) {
    Cookies.set(key, value ?? "", options);
  }
};

const remove = (key: string) => {
  Cookies.remove(key);
};

export const cookieHelper = {
  COOKIE_KEYS,
  get,
  set,
  remove
};
