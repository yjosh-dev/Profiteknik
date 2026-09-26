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

type LoginFormType = {
  type: "employee" | "root";
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
  focusColor?: string;
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
  focusColor = "focus-within:border-zinc-400",
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
              : `border-zinc-200 ${focusColor}`
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

export default function LoginForm({
  type,
  isLoading,
  success,
  error,
  onClick,
  handleContinue,
  onClose,
}: LoginFormType) {
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [touched, setTouched] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const isRoot = type === "root";
  const theme = isRoot
    ? {
        label: "Root access",
        inputFocus: "focus-within:border-zinc-400",
        link: "text-zinc-500 hover:text-zinc-700",
        button:
          "bg-zinc-800 hover:bg-zinc-900 active:bg-black disabled:hover:shadow-none",
      }
    : {
        label: "Employee login",
        inputFocus: "focus-within:border-red-400",
        link: "text-red-700 hover:text-red-600",
        button:
          "bg-red-700 hover:bg-red-600 active:bg-red-800 disabled:hover:shadow-none",
      };

  const passwordValid = validatePasswordInput(formData.password);
  const showPasswordError =
    touched && formData.password.length > 0 && !passwordValid;
  const canSubmit = formData.username.trim() !== "" && passwordValid;

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
    <Card className="gap-1 min-w-sm justify-center py-10 px-8">
      <img src={logo} alt="ProfiTeknik logo" className="h-14 mb-4" />

      <p className="archivo font-medium text-lg text-zinc-800 mb-1">
        Welcome back
      </p>
      <div className="archivo font-normal text-sm text-zinc-500 mb-6 flex flex-col items-center">
        <p className="font-semibold">{theme.label} </p>
        <p>Sign in to continue to your account</p>
      </div>

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
          focusColor={theme.inputFocus}
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
          error={
            showPasswordError
              ? "Password must be 4 characters or above"
              : undefined
          }
          focusColor={theme.inputFocus}
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
          <p
            className={`archivo text-xs transition-colors cursor-pointer ${theme.link}`}
          >
            Forgot password?
          </p>
        </div>
      </div>

      <Button
        disabled={isLoading}
        onClick={handleSubmit}
        className={`w-full ${theme.button}
           py-2.5 min-w-xs mt-6 rounded-md text-white
           transition-all duration-200 ease-in-out
           hover:scale-[1.02] hover:shadow-md
           active:scale-95
           disabled:opacity-50 disabled:hover:scale-100
           cursor-pointer disabled:cursor-not-allowed flex items-center justify-center gap-2`}
      >
        {isLoading ? (
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
        ) : (
          <MdOutlineLogin size={20} />
        )}
        <span className="archivo font-medium">Login</span>
      </Button>

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
