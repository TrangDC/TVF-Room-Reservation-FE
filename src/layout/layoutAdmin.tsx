import Sidebar from "../components/sidebar/index.tsx";
import { Outlet } from "react-router-dom";
const LayoutAdmin = () => {
  return (
    <div className='admin-page__container w-full flex flex-row'>
      <div className='w-[200px] md:w-[300px] fixed'>
        <Sidebar />
      </div>
      <div className='admin-outlet__container w-full ml-[200px] md:ml-[300px] h-[100vh] overflow-x-scroll'>
        <Outlet />
      </div>
    </div>
  );
};

export default LayoutAdmin;
