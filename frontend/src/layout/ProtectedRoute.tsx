import { Navigate, Outlet, useActionData } from "react-router-dom";
import { useEffect } from "react";

type ProtectedRouteProps = {
  path: string;
};

export default function ProtectedRoute({ path }: ProtectedRouteProps) {
  const token = localStorage.getItem("token");
  return token  ? <Outlet /> : <Navigate to={path} replace />
}
