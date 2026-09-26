import React, { useState } from "react";

import ApplicantLoginForm from "../components/common/ApplicantLoginForm";

export default function ApplicantLogin() {
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<boolean | null | string>(null);

  const handleLogin = (username: string, password: string) => {
    alert(`Login clicked with username: ${username}, password: ${password}`);
  };

  const handleContinue = () => {
    alert("Continue clicked");
  };

  const handleClose = () => {
    setError(null);
  };

  return (
    <div className="w-screen h-screen flex items-center justify-center">
      <ApplicantLoginForm
        isLoading={isLoading}
        success={success}
        error={error}
        onClick={handleLogin}
        handleContinue={handleContinue}
        onClose={handleClose}
      />
    </div>
  );
}
