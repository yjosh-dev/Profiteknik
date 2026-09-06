// layout/ProtectedRoute.tsx
import { useEffect } from "react";
import { Navigate, Outlet, useNavigate } from "react-router-dom";
import { UseAuth } from "../hooks/useAuth";
import Loading from "../components/common/Loading";

export default function ProtectedRoute({ path }: { path: string }) {
  const navigate = useNavigate();

  const {loading, unauthenticated } = UseAuth();

  if (loading) return <Loading />;

  if (unauthenticated) return <Navigate to="/root" replace />;

  return <Outlet />;
}
