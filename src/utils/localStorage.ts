const LOCAL_STORAGE_KEYS = {
  ACCESS_TOKEN: "access_token",
  FORM_DATA: "form_data",
  CALENDAR_SELECT_OFFICEID: "calendar_select_officeId",
  FORM_MEETING_OFFICEID: "form_meeting_officeId",
  ADMIN_SELECT_OFFICEID: "admin_select_officeId",
  AUTH_USER: "auth_user",
  DATE_RANGE: "date_range"
};

const get = <T>(key: string): T | undefined => {
  if (typeof window !== "undefined" && localStorage) {
    const rs = localStorage.getItem(key);
    try {
      // attempt to return parsed object
      return rs ? JSON.parse(rs) : null;
    } catch {
      // return default as string otherwise
      return (rs as T) || undefined;
    }
  }
};

const set = (key: string, value?: string): void => {
  if (typeof window !== "undefined" && localStorage) {
    localStorage.setItem(key, value ?? "");
  }
};

const remove = (key: string): void => {
  if (window && localStorage) {
    localStorage.removeItem(key);
  }
};

const clearInfo = (): void => {
  if (window && localStorage) {
    localStorage.removeItem(LOCAL_STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(LOCAL_STORAGE_KEYS.FORM_DATA);
  }
};

export const localStorageHelper = {
  LOCAL_STORAGE_KEYS,
  get,
  set,
  remove,
  clearInfo
};
