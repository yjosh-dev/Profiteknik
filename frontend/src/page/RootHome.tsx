import LoginForm from "../components/common/LoginForm";
import { rootAuth } from "../service/api/auth/rootAuth";
import axios from "axios";
import { UseAuth } from "../hooks/useAuth";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function RootHome() {
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate()
  const { checkAuth } = UseAuth();

  const handleRootLogin = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const result = await rootAuth.authLogin(email, password);
      localStorage.setItem("token", result.data.data);
      setSuccess(true);
    } catch (error) {
      setIsLoading(false);
      if (axios.isAxiosError(error)) {
        const message =
          error.response?.data?.message ??
          "Something went wrong. Please try again.";
        setError(message);
      }
    } finally {
      checkAuth();
      setIsLoading(false);
    }
  };

  const handleContinue = () => {
    setIsLoading(false)
    navigate("/root/dash")
  }
  return (
    <div className="flex items-center justify-center min-h-screen">
      <LoginForm
        onClose={() => setError(null)}
        success={success}
        handleContinue={handleContinue}
        error={error}
        isLoading={isLoading}
        onClick={handleRootLogin}
      />
    </div>
  );
}
