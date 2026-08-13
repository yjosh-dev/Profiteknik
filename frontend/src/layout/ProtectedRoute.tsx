import { Navigate, Outlet, useActionData } from "react-router-dom";
import { UseAuth } from "../context/AuthProvider";
import { useEffect } from "react";

type ProtectedRouteProps = {
  path: string;
};

export default function ProtectedRoute({ path }: ProtectedRouteProps) {
  const { authData } = UseAuth();
  const user = authData;
  const token = localStorage.getItem("token");
  return token || user ?  <Outlet /> : <Navigate to={path} replace />
}
