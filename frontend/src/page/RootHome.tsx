import LoginForm from "../components/common/LoginForm";
import { useEffect } from "react";
import { UseAuth } from "../context/AuthProvider";

export default function RootHome() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <LoginForm />
    </div>
  );
}
