import { Slide, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Layout from "./layout/layout.tsx";
import { Routes, Route, Navigate } from "react-router-dom";
import Error from "./pages/Error.tsx";
import LayoutAdmin from "./layout/layoutAdmin.tsx";
import Bookings from "./pages/Bookings.tsx";
import Rooms from "./pages/Rooms.tsx";
import Users from "./pages/Users.tsx";
import AuthAdminProtected from "./components/authAdmin/index.tsx";

function InnerApp() {
  return (
    <Routes>
      <Route path='*' element={<Navigate to='/' />} />
      <Route path='/' element={<Layout />} />
      <Route path='/error' element={<Error />} />
      <Route
        path='/admin'
        element={
          <AuthAdminProtected>
            <LayoutAdmin />
          </AuthAdminProtected>
        }
      >
        <Route index element={<Navigate to='/admin/bookings' />} />
        <Route path='bookings' element={<Bookings />} />
        <Route path='rooms' element={<Rooms />} />
        <Route path='users' element={<Users />} />
      </Route>
    </Routes>
  );
}

function App() {
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
