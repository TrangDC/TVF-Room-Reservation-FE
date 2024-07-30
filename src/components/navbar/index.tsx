import { PiSignOutBold } from "react-icons/pi";
import { TbUserHexagon } from "react-icons/tb";
import { cookieHelper } from "../../utils/cookie.ts";
import Button from "../common/button/button.tsx";
import { useMsal } from "@azure/msal-react";
import useUserStore from "../../store/store.ts";

function Navbar() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const user = useUserStore((state) => state.user);
  const { instance } = useMsal();
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
          {!user.role && (
            <Button
              className='!flex text-[16px] text-[#fff] px-[16px] py-[8px] !bg-[#0070BA] rounded-[8px]'
              onClick={handleRedirectRoute}
            >
              <TbUserHexagon className='text-[24px] mr-1'></TbUserHexagon>{" "}
              <span className=''>Login</span>
            </Button>
          )}
          {user.role && (
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
