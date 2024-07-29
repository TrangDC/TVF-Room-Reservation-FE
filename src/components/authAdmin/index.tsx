import { Navigate } from "react-router-dom";
import useUserStore from "../../store/store";
import React, { ReactNode } from "react";

interface AuthAdminProtectedProps {
  children: ReactNode;
}

const AuthAdminProtected: React.FC<AuthAdminProtectedProps> = ({ children }) => {
  const user = useUserStore((state) => state.user);
  return user?.role === "administrator" || user?.role === "super_admin" ? (
    children
  ) : (
    <Navigate to='/' replace />
  );
};

export default AuthAdminProtected;
