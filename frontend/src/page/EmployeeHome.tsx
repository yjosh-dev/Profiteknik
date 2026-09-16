import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import { UseAuth } from "../hooks/useAuth";
import LoginForm from "../components/common/LoginForm";
import { employeeAuth } from "../service/api/auth/employeeAuth";

export default function EmployeeHome() {
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { checkAuth } = UseAuth();

  const handleLogin = async (username: string, password: string) => {
    try {
      setLoading(true);
      const result = await employeeAuth.authLogin(username, password);
      localStorage.setItem("token", result.data.data);
      setSuccess(true);
    } catch (error) {
      setLoading(false);
      if (axios.isAxiosError(error)) {
        const message =
          error.response?.data?.message ??
          "Something went wrong. Please try again.";
        setError(message);
      }
    } finally {
      localStorage.setItem('verify_type', "employee")
      checkAuth("employee");
      setLoading(false);
    }
  };

  const handleContinue = () => {
    setLoading(false);
    navigate("/employee/dash");
  };

  return (
    <div className="w-screen h-screen flex items-center justify-center">
      <LoginForm
        isLoading={loading}
        success={success}
        error={error}
        handleContinue={handleContinue}
        onClick={handleLogin}
        onClose={() => setError(null)}
      />
    </div>
  );
}
