import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import Button from "../ui/Button";
import Card from "../ui/Card";
import Input from "../ui/Input";

import logo from "../../assets/logo/profiteknik_logo.svg";

import { MdOutlineLogin } from "react-icons/md";
import { MdError } from "react-icons/md";
import { FaCircleCheck } from "react-icons/fa6";
import { FaUserCircle, FaEye, FaEyeSlash } from "react-icons/fa";
import { RiLockPasswordFill } from "react-icons/ri";

import { rootAuth } from "../../service/api/auth/rootAuth";
import { UseAuth } from "../../hooks/useAuth";
import StatusModal from "../ui/StatusModal";

import { validatePasswordInput } from "../../utils/AuthInputValidation";

type LoginFormType = {
  isLoading: boolean;
  success: boolean;
  error: boolean | null | string;
  onClick: (email: string, password: string) => void;
  handleContinue: () => void;
};

export default function LoginForm({
  isLoading,
  success,
  error,
  onClick,
  handleContinue,
}: LoginFormType) {
  // next step note
  // lift status states
  // prop drill the login function itself
  // transfer the useauth
  // transfer the handle continue

  const { checkAuth } = UseAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const pass = validatePasswordInput(e.target.value);
    if (!pass) {
      console.log("Input must be 4 characters or above");
    }
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  return (
    <Card className="gap-3 min-w-sm justify-center py-10">
      <img src={logo} className="" />
      <Input
        value={formData.username}
        onChange={handleChange}
        name="username"
        text="Username"
        icon={<FaUserCircle size={17} />}
        className="min-w-xs"
        type="text"
        placeholder="Enter your account username"
      />
      <Input
        value={formData.password}
        onChange={handleChange}
        name="password"
        text="Password"
        icon={<RiLockPasswordFill size={17} />}
        className="min-w-xs"
        placeholder="Enter your account password"
      />

      <div>{/* to be added. show password and forgot password */}</div>

      <Button
        disabled={isLoading}
        onClick={() => onClick(formData.username, formData.password)}
        className="bg-black
           py-2 px-24 min-w-xs my-2 rounded-md text-white
           transition-all duration-200 ease-in-out
           hover:bg-neutral-800 hover:scale-[1.02] hover:shadow-md
           active:scale-95 active:bg-neutral-900
           cursor-pointer"
      >
        {isLoading ? (
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
        ) : (
          <MdOutlineLogin size={22} />
        )}
        Login
      </Button>

      {success && (
        <div className="w-screen h-screen flex items-center justify-center absolute z-99 bg-black/80 backdrop-blur-xs">
          <StatusModal
            icon={<FaCircleCheck size={54} color="#25b041" />}
            onClick={() => handleContinue()}
            heading="Login success"
            description="Login successfully. Please continue to redirect page"
            button_name="Continue"
            button_color="bg-[#25b041]"
          />
        </div>
      )}

      {error && (
        <div className="w-screen h-screen flex items-center justify-center absolute z-99 bg-black/80 backdrop-blur-xs">
          <StatusModal
            icon={<MdError size={54} color="#a61124" />}
            heading="Login failed"
            description={error.toString()}
            button_name="close"
            button_color="bg-[#a61124]"
          />
        </div>
      )}
    </Card>
  );
}
