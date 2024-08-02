import { Slide, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Layout from "./layout/layout.tsx";
import { Routes, Route, Outlet, Navigate, useNavigate } from "react-router-dom";
import Error from "./pages/Error.tsx";
import LayoutAdmin from "./layout/layoutAdmin.tsx";
import Bookings from "./pages/Bookings.tsx";
import Rooms from "./pages/Rooms.tsx";
import Users from "./pages/Users.tsx";
import AuthAdminProtected from "./components/authAdmin/index.tsx";
import { cookieHelper } from "./utils/cookie.ts";
import { useEffect } from "react";
import useUserStore from "./store/store.ts";
import { useLazyQuery } from "@apollo/client";
import { GET_ROLE_USER } from "./api/booking/query.ts";
// import { jwtDecode } from "jwt-decode";

function InnerApp() {
  return (
    <Routes>
      {/* <Route path='*' element={<Navigate to='/' />} /> */}
      <Route path='/' element={<Layout />} />
      <Route path='/error' element={<Error />} />
      <Route
        element={
          <AuthAdminProtected>
            <Outlet />
          </AuthAdminProtected>
        }
      >
        <Route path='admin' element={<LayoutAdmin />}>
          <Route index element={<Navigate to='/admin/bookings' />} />
          <Route path='bookings' element={<Bookings />} />
          <Route path='rooms' element={<Rooms />} />
          <Route path='users' element={<Users />} />
        </Route>
        <Route path='edit/:id' element={<Layout />} />
      </Route>
    </Routes>
  );
}

function App() {
  const navigate = useNavigate();
  //   const [userInfo, setUserInfo] = useState({ email: "", name: "" });
  const [GetMe, { data }] = useLazyQuery(GET_ROLE_USER);
  const storedToken = cookieHelper.get(cookieHelper.COOKIE_KEYS.ACCESS_TOKEN);
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  const accesstoken = urlParams.get("accessToken") || "";
  const refreshtoken = urlParams.get("refreshToken") || "";
  const { setUser } = useUserStore();

  //   const handleDecodeToken = (accesstoken: string) => {
  //     const token = accesstoken;
  //     const { email, name }: { email: string; name: string } = jwtDecode(token);
  //     setUserInfo({ email, name });
  //     const returnData = { email: email, name: name };
  //     return returnData;
  //   };

  const handleSetRole = async () => {
    await GetMe();
    try {
      if (data)
        setUser({
          username: data.GetMe.name,
          email: data.GetMe.workEmail,
          role: data.GetMe.roles[0].machineName
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
      handleSetRole();
      navigate("/");
    }
    if (refreshtoken) {
      cookieHelper.set(cookieHelper.COOKIE_KEYS.REFRESH_TOKEN, refreshtoken);
    }
    if (storedToken) {
      handleSetRole();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accesstoken, queryString]);

  useEffect(() => {
    (async () => {
      await GetMe();
      handleSetRole();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  const handleRedirectRoute = () => {
    window.location.href = import.meta.env.VITE_DEV_AUTHORITY_LOGIN;
  };

  return (
    <>
      <InnerApp />
      <ToastContainer
        position='top-left'
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme='light'
        transition={Slide}
      />
    </>
  );
}

export default App;
