import { IUser } from "../types/interfaces/user";
import { localStorageHelper } from "./localStorage";

export function getStoredUser() {
  const user: IUser | undefined = localStorageHelper.get(
    localStorageHelper.LOCAL_STORAGE_KEYS.AUTH_USER
  );
  if (user) {
    return user;
  } else return null;
}

export function setStoredUser(user: IUser | null) {
  if (user) {
    localStorageHelper.set(localStorageHelper.LOCAL_STORAGE_KEYS.AUTH_USER, JSON.stringify(user));
  } else {
    localStorageHelper.set(localStorageHelper.LOCAL_STORAGE_KEYS.AUTH_USER, "null");
  }
}

export function removeStoredUser(key: string) {
  localStorage.removeItem(key);
}
