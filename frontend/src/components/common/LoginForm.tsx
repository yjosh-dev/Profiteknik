import { useState, useContext } from "react";
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

import StatusModal from "../ui/StatusModal";

import { validatePasswordInput } from "../../utils/AuthInputValidation";

export default function LoginForm() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState("password");

  const handleContinue = () => {
    setSuccess(false)
    navigate("/root/dash");
  };
  const handleClick = async (email: string, password: string) => {
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
      setIsLoading(false);
    }
  };

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
        type={showPassword}
        placeholder="Enter your account password"
      />

      <div>{/* to be added. show password and forgot password */}</div>

      <Button
        disabled={isLoading}
        onClick={() => handleClick(formData.username, formData.password)}
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
            onClick={() => setError(null)}
            heading="Login failed"
            description={error}
            button_name="close"
            button_color="bg-[#a61124]"
          />
        </div>
      )}
    </Card>
  );
}
