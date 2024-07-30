import { useMsal } from "@azure/msal-react";
import { useEffect } from "react";
import { cookieHelper } from "../utils/cookie";
import useUserStore from "../store/store";

function Error() {
  const { instance } = useMsal();

  useEffect(() => {
    setTimeout(() => {
      test();
    }, 100);
  }, []);

  const test = async () => {
    // await instance.logoutPopup();
    await instance.logoutPopup();
    useUserStore.persist.clearStorage();
    cookieHelper.remove(cookieHelper.COOKIE_KEYS.ACCESS_TOKEN);
    cookieHelper.remove(cookieHelper.COOKIE_KEYS.REFRESH_TOKEN);
    window.location.href = import.meta.env.VITE_DEV_AUTHORITY_LOGIN;
  };
  return <div></div>;
}

export default Error;
