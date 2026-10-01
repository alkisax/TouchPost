import { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { UserAuthContext } from "../context/UserAuthContext";
import { getEffectiveRole, type EffectiveRole } from "../types/types";

interface ProtectedRouteProps {
  allowedRoles: EffectiveRole[];
}

const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
  const { user, isLoading } = useContext(UserAuthContext);
  // Κατά την επαναφορά του token δεν αποφασίζουμε ακόμη για πρόσβαση,
  // ώστε να μην ανακατευθύνουμε προσωρινά έναν έγκυρο χρήστη στο login.
  if (isLoading) {
    return <div>Loading auth...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Ο SUPERADMIN αναγνωρίζεται από globalRoles, ενώ ADMIN/STAFF από τη
  // singular organization membership. Χωρίς κανένα από τα δύο, ο χρήστης
  // είναι USER. Έτσι δεν εξαρτόμαστε από διαφορετικά JWT claims των backends.
  const role = getEffectiveRole(user);

  if (!allowedRoles.includes(role)) {
    // Η πρόσβαση με λάθος ρόλο απορρίπτεται χωρίς να δημιουργείται redirect loop.
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
