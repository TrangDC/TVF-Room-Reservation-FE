import { Link, useLocation, useNavigate } from "react-router-dom";
import { IUser } from "../../types/interfaces/user";
import { localStorageHelper } from "../../utils/localStorage";
import { FaUsersGear } from "react-icons/fa6";
import { TbCheckbox } from "react-icons/tb";
import { TiHomeOutline } from "react-icons/ti";
import useUserStore from "../../store/store";
import { USER_ROLE } from "../../constants/role";

function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { role } = useUserStore((state) => state.user);
  const user: IUser | undefined = localStorageHelper.get(
    localStorageHelper.LOCAL_STORAGE_KEYS.AUTH_USER
  );

  const handleRedirectHomePage = () => {
    navigate("/");
  };
  const isActive = (path: string) => location.pathname === path;

  return (
    <div className='sidebar-container w-full h-[100vh] flex flex-col bg-[#a5ccff] items-center border-r-2'>
      <div className='sidebar-wrapper'>
        <div
          onClick={handleRedirectHomePage}
          className='bg-[#ffffff] w-full py-[20px] flex justify-center'
        >
          <div className='w-[90%]'>
            <div className='semi_md:block logo'>
              <img
                src='https://techvify-software.com/wp-content/themes/techvify-22-08-2023/assets/images/logo-mobile.png'
                className=' w-[50%] object-cover'
              />
            </div>
            <div className='user-info mt-[10px] text-[#3a3a3a] font-[700]'>
              {user && <span>{user.username}</span>}
            </div>
          </div>
        </div>

        <div className='nav-section ml-[20px] mt-[20px]'>
          <Link to='/admin/bookings'>
            <div
              className={`flex flex-row items-center nav-item w-full my-[10px] py-[10px] pl-[8px] ${isActive("/admin/bookings") ? "bg-[#fff]" : ""} hover:bg-[#fff] rounded-tl-[8px] rounded-bl-[8px]`}
            >
              <TbCheckbox className='text-[30px] mr-[10px]'></TbCheckbox>
              <p className='font-[700]'>Meetings</p>
            </div>
          </Link>

          {role === USER_ROLE.SUPER_ADMIN && (
            <>
              <Link to='/admin/users'>
                <div
                  className={`flex flex-row items-center nav-item my-[10px] py-[10px] pl-[8px] ${isActive("/admin/users") ? "bg-[#fff]" : ""} hover:bg-[#fff] rounded-tl-[8px] rounded-bl-[8px]`}
                >
                  <FaUsersGear className='text-[30px] mr-[10px]'></FaUsersGear>
                  <p className='font-[700]'>User</p>
                </div>
              </Link>

              <Link to='/admin/rooms'>
                <div
                  className={`flex flex-row items-center nav-item my-[10px] py-[10px] pl-[8px] ${isActive("/admin/rooms") ? "bg-[#fff]" : ""} hover:bg-[#fff] rounded-tl-[8px] rounded-bl-[8px]`}
                >
                  <TiHomeOutline className='text-[30px] mr-[10px]'></TiHomeOutline>
                  <p className='font-[700]'>Rooms</p>
                </div>
              </Link>
            </>
          )}
          <Link to='/'>
            <div
              className={` nav-item my-[10px] py-[10px] pl-[8px] ${isActive("/") ? "bg-[#fff]" : ""} hover:bg-[#fff] rounded-tl-[8px] rounded-bl-[8px]`}
            >
              <p className='font-[700]'>Go to Homepage</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;
