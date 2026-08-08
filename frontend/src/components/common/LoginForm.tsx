import { useState, useContext } from "react";

import Button from "../ui/Button";
import Card from "../ui/Card";
import Input from "../ui/Input";

import logo from "../../assets/logo/profiteknik_logo.svg";

import { MdOutlineLogin } from "react-icons/md";
import { MdError } from "react-icons/md";
import { FaCircleCheck } from "react-icons/fa6";
import { FaUserCircle } from "react-icons/fa";
import { RiLockPasswordFill } from "react-icons/ri";

import { rootAuth } from "../../service/api/auth/rootAuth";

import StatusModal from "../ui/StatusModal";

export default function LoginForm() {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);
  const [showPassword, setShowPassword] = useState("password");

  const handleClick = async (email: string, password: string) => {
    try {
      const result = await rootAuth.authLogin(email, password);
      setSuccess(true);
    } catch (err) {
      setError(true);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
        icon={<FaUserCircle size={18} />}
        className="min-w-xs"
        type="text"
        placeholder="Enter your account username"
      />
      <Input
        value={formData.password}
        onChange={handleChange}
        name="password"
        text="Password"
        icon={<RiLockPasswordFill size={18} />}
        className="min-w-xs"
        type={showPassword}
        placeholder="Enter your account password"
      />
      <span className="min-w-xs bg-black"></span>
      <Button
        onClick={() => handleClick(formData.username, formData.password)}
        className="py-2 px-24 bg-black min-w-xs my-2 rounded-md text-white
           transition-all duration-200 ease-in-out
           hover:bg-neutral-800 hover:scale-[1.02] hover:shadow-md
           active:scale-95 active:bg-neutral-900
           cursor-pointer"
      >
        <MdOutlineLogin size={22} />
        Login
      </Button>

      {success && (
        <div className="w-screen h-screen flex items-center justify-center absolute z-99 bg-black/80 backdrop-blur-xs">
          <StatusModal
            icon={<FaCircleCheck size={54} color="#25b041" />}
            onClick={() => setSuccess(false)}
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
            onClick={() => setError(false)}
            heading="Login failed"
            description="Incorrect account username or password. Please try again."
            button_name="close"
            button_color="bg-[#a61124]"
          />
        </div>
      )}
    </Card>
  );
}
