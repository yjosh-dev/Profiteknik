import React, { useState } from "react";

import Button from "../ui/Button";
import Card from "../ui/Card";

import logo from "../../assets/logo/profiteknik_logo.svg";

import { MdOutlineLogin, MdError } from "react-icons/md";
import { FaCircleCheck } from "react-icons/fa6";
import { FaUserCircle, FaEye, FaEyeSlash } from "react-icons/fa";
import { RiLockPasswordFill } from "react-icons/ri";

import StatusModal from "../ui/StatusModal";
import { validatePasswordInput } from "../../utils/AuthInputValidation";
import { useNavigate } from "react-router-dom";

type ApplicantLoginFormType = {
  isLoading: boolean;
  success: boolean;
  error: boolean | null | string;
  onClick: (email: string, password: string) => void;
  handleContinue: () => void;
  onClose: () => void;
};

type InputProps = {
  id: string;
  name: string;
  text: string;
  icon?: React.ReactNode;
  rightElement?: React.ReactNode;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  placeholder?: string;
  error?: string;
};

function Input({
  id,
  name,
  text,
  icon,
  rightElement,
  type = "text",
  value,
  onChange,
  onKeyDown,
  placeholder,
  error,
}: InputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="archivo text-sm font-medium text-zinc-700">
        {text}
      </label>

      <div
        className={`relative flex items-center gap-2 rounded-md border px-3 h-11
          transition-colors duration-150
          ${
            error
              ? "border-red-400 focus-within:border-red-500"
              : "border-zinc-200 focus-within:border-blue-400"
          }`}
      >
        {icon && <span className="text-zinc-400 shrink-0">{icon}</span>}

        <input
          id={id}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          className="archivo w-full bg-transparent text-sm text-zinc-800 placeholder:text-zinc-400 outline-none"
        />

        {rightElement && <span className="shrink-0">{rightElement}</span>}
      </div>

      {error && <p className="archivo text-xs text-red-500 px-1">{error}</p>}
    </div>
  );
}

export default function ApplicantLoginForm({
  isLoading,
  success,
  error,
  onClick,
  handleContinue,
  onClose,
}: ApplicantLoginFormType) {
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [touched, setTouched] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const passwordValid = validatePasswordInput(formData.password);
  const showPasswordError = touched && formData.password.length > 0 && !passwordValid;
  const canSubmit = formData.username.trim() !== "" && passwordValid;

  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.id]: e.target.value }));
  };

  const handleSubmit = () => {
    setTouched(true);
    if (canSubmit) onClick(formData.username, formData.password);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSubmit();
  };

  return (
    <Card className="gap-1 max-w-sm justify-center py-10 px-8">
      <img src={logo} alt="ProfiTeknik logo" className="h-14 mb-4" />

      <p className="archivo font-medium text-lg text-zinc-800 mb-1">
        Welcome, Applicant
      </p>
      <p className="archivo font-normal text-sm text-zinc-500 mb-6">
        Sign in to start finding your next job.
      </p>

      <div className="w-full flex flex-col gap-4">
        <Input
          id="username"
          name="username"
          text="Username"
          icon={<FaUserCircle size={17} />}
          type="text"
          value={formData.username}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Enter your account username"
        />

        <Input
          id="password"
          name="password"
          text="Password"
          icon={<RiLockPasswordFill size={17} />}
          type={showPassword ? "text" : "password"}
          value={formData.password}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Enter your account password"
          error={showPasswordError ? "Password must be 4 characters or above" : undefined}
          rightElement={
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="text-zinc-400 hover:text-zinc-600 transition-colors cursor-pointer"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <FaEyeSlash size={15} /> : <FaEye size={15} />}
            </button>
          }
        />

        <div className="flex justify-end -mt-1">
          <p className="archivo text-xs text-red-500 hover:text-red-700 transition-colors cursor-pointer">
            Forgot password?
          </p>
        </div>
      </div>

      <Button
        disabled={isLoading}
        onClick={handleSubmit}
        className="w-full bg-red-700
           py-2.5 min-w-xs mt-6 rounded-md text-white
           transition-all duration-200 ease-in-out
           hover:bg-red-600/80 hover:scale-[1.02] hover:shadow-md
           active:scale-95 active:bg-red-800
           disabled:opacity-50 disabled:hover:scale-100 disabled:hover:shadow-none
           cursor-pointer disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
        ) : (
          <MdOutlineLogin size={20} />
        )}
        <span className="archivo font-medium">Login</span>
      </Button>

      <p className="archivo text-sm text-zinc-500 mt-4">
        Don't have an account?{" "}
        <span className="text-red-500 hover:text-red-700 transition-colors cursor-pointer font-medium" onClick={() => navigate('/applicant/signup')}>
          Sign up
        </span>
      </p>

      {success && (
        <div className="w-screen h-screen flex items-center justify-center fixed inset-0 z-99 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200">
          <StatusModal
            icon={<FaCircleCheck size={54} color="#25b041" />}
            onClick={handleContinue}
            heading="Login success"
            description="Login successfully. Please continue to redirect page"
            button_name="Continue"
            button_color="bg-[#25b041]"
          />
        </div>
      )}

      {error && (
        <div className="w-screen h-screen flex items-center justify-center fixed inset-0 z-99 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200">
          <StatusModal
            icon={<MdError size={54} color="#a61124" />}
            onClick={onClose}
            heading="Login failed"
            description={error.toString()}
            button_name="Close"
            button_color="bg-[#a61124]"
          />
        </div>
      )}
    </Card>
  );
}