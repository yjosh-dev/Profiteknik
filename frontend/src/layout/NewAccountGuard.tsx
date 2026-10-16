import { Navigate, Outlet, useLocation } from "react-router-dom";
import { UseAuth } from "../hooks/useAuth";

export default function NewAccountGuard() {
  const { userData, loading } = UseAuth();
  const location = useLocation();

  if (loading) return null; // or a spinner

  if (!userData) return <Navigate to="/applicant/login" replace />;

  const isCompletePage =
    location.pathname === "/applicant/complete-account-info";

  if (userData.userData.isNew && !isCompletePage) {
    return <Navigate to="/applicant/complete-account-info" replace />;
  }

  return <Outlet />;
}
