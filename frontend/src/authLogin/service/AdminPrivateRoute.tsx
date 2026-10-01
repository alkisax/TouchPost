// frontend\src\authLogin\service\AdminPrivateRoute.tsx
import { useContext } from "react";
import { Outlet, Navigate } from "react-router-dom";
import { UserAuthContext } from "../context/UserAuthContext";
import { getEffectiveRole } from "../types/types";

const AdminPrivateRoute = () => {
  const { user } = useContext(UserAuthContext);

  // Only allow access if user exists and has 'ADMIN' ή 'SUPERADMIN' role
  if (user && ["ADMIN", "SUPERADMIN"].includes(getEffectiveRole(user))) {
    return <Outlet />
  } else {
    // Redirect non-admins to login or home
    return <Navigate to="/" />;
  }
};

export default AdminPrivateRoute;
