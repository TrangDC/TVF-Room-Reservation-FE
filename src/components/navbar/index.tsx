import { useEffect, useState } from "react";
import { PiSignOutBold } from "react-icons/pi";
import { TbUserHexagon } from "react-icons/tb";
import { cookieHelper } from "../../utils/cookie.ts";
import Button from "../common/button/button.tsx";
import { jwtDecode } from "jwt-decode";
import { useMsal } from "@azure/msal-react";
import { useNavigate } from "react-router";
import { useLazyQuery } from "@apollo/client";
import Loading from "../loading/index.tsx";
import { GET_ROLE_USER } from "../../api/booking/query.ts";
import useUserStore from "../../store/store.ts";

function Navbar() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [userInfo, setUserInfo] = useState({ email: "", name: "" });
  const { user } = useUserStore();
  const [GetUserByOID, { data: oidData, loading: roleLoading }] = useLazyQuery(GET_ROLE_USER);
  const navigate = useNavigate();
  const storedToken = cookieHelper.get(cookieHelper.COOKIE_KEYS.ACCESS_TOKEN);
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  const accesstoken = urlParams.get("accessToken") || "";
  const refreshtoken = urlParams.get("refreshToken") || "";
  const { instance } = useMsal();
  const { setUser } = useUserStore();

  const handleDecodeToken = (accesstoken: string) => {
    const token = accesstoken;
    const { email, name, oid }: { email: string; name: string; oid: string } = jwtDecode(token);
    setUserInfo({ email, name });
    const returnData = { email: email, name: name, oid: oid };
    return returnData;
  };

  const handleSetRole = async (oid: string, email: string, name: string) => {
    try {
      const { data } = await GetUserByOID({ variables: { oID: oid } });
      setUser({
        username: name,
        email: email,
        role: data.GetUserByOID.roles[0].machineName
      });
      navigate("/");
    } catch (error) {
      console.error("Error setting user role:", error);
    }
  };

  useEffect(() => {
    if (!accesstoken && !storedToken) {
      handleRedirectRoute();
    }
    if (accesstoken) {
      cookieHelper.set(cookieHelper.COOKIE_KEYS.ACCESS_TOKEN, accesstoken);
      const { email, name, oid } = handleDecodeToken(accesstoken);
      handleSetRole(email, name, oid);
      navigate("/");
    }
    if (refreshtoken) {
      cookieHelper.set(cookieHelper.COOKIE_KEYS.REFRESH_TOKEN, refreshtoken);
    }
    if (storedToken) {
      handleDecodeToken(storedToken);
      const { oid } = handleDecodeToken(storedToken);
      GetUserByOID({ variables: { oID: oid } });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storedToken, accesstoken, queryString]);

  useEffect(() => {
    if (oidData)
      setUser({
        username: userInfo.name,
        email: userInfo.email,
        role: oidData.GetUserByOID.roles[0].machineName
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [oidData]);

  if (roleLoading) return <Loading />;
  const handleRedirectRoute = () => {
    window.location.href = import.meta.env.VITE_DEV_AUTHORITY_LOGIN;
  };

  const handleLogout = async () => {
    await instance.logoutPopup();
    cookieHelper.remove(cookieHelper.COOKIE_KEYS.ACCESS_TOKEN);
    handleRedirectRoute();
  };

  return (
    <nav className='sticky top-0 z-50 mb-3 navbar-container flex w-full justify-center items-center h-[80px] bg-[#ececec]'>
      <div className='navbar-wrapper w-[90%]  flex flex-row justify-end semi_md:justify-between items-center'>
        <div className='hidden semi_md:block logo w-[200px]'>
          <img
            src='https://mentori.vn/upload/recruitment/bvj1657878565.png'
            alt=''
            className=' w-full object-cover '
          />
        </div>
        <div className='user flex flex-1 justify-between semi_md:flex-none semi_md:justify-normal'>
          {user && (
            <div className='user-info flex flex-col mr-3 whitespace-nowrap max-w-[70vw]'>
              <span className='text-[14px] font-semibold semi_md:text-right break-words text-ellipsis overflow-hidden'>
                {user.username}
              </span>
              <span className='text-[14px] font-semibold semi_md:text-right break-words text-ellipsis overflow-hidden'>
                {user.email}
              </span>
            </div>
          )}
          {!(accesstoken || storedToken) && (
            <Button
              className='!flex text-[16px] text-[#fff] px-[16px] py-[8px] !bg-[#0070BA] rounded-[8px]'
              onClick={handleRedirectRoute}
            >
              <TbUserHexagon className='text-[24px] mr-1'></TbUserHexagon>{" "}
              <span className=''>Login</span>
            </Button>
          )}
          {(accesstoken || storedToken) && (
            <Button
              className='!flex text-[16px] text-[#fff] px-[16px] py-[8px] !bg-[#0070BA] rounded-[8px]'
              onClick={handleLogout}
            >
              <span className='hidden semi_md:block'>Logout</span>
              <PiSignOutBold className='text-[24px] mr-1'></PiSignOutBold>
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
