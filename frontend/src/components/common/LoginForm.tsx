import { useState, useContext } from "react";

import Button from "../ui/Button";
import Card from "../ui/Card";
import Input from "../ui/Input";

import logo from "../../assets/logo/profiteknik_logo.svg";

import { MdOutlineLogin } from "react-icons/md";
import { MdError } from "react-icons/md";
import { FaCircleCheck } from "react-icons/fa6";

import { rootAuth } from "../../service/api/auth/rootAuth";

import StatusModal from "../ui/StatusModal";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);
  const [data, setData] = useState();

  const handleClick = async (email: string, password: string) => {
    try {
      const result = await rootAuth.authLogin(email, password);
      setData(result.data);
      setSuccess(true);
      console.log(data)
    } catch (err) {
      setError(true);
    }
  };

  return (
    <Card className="gap-3 min-w-sm justify-center py-10">
      <img src={logo} className="" />
      <Input
        value={email}
        onChange={setEmail}
        name="Root Username"
        className="min-w-xs"
        type="text"
        placeholder="Enter your account username"
      />
      <Input
        value={password}
        onChange={setPassword}
        name="Root Password"
        className="min-w-xs"
        type="password"
        placeholder="Enter your account password"
      />
      <Button
        onClick={() => handleClick(email, password)}
        className="py-2 px-24 bg-black min-w-xs my-2"
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
