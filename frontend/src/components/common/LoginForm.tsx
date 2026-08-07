import { useState } from "react";

import Button from "../ui/Button";
import Card from "../ui/Card";
import Input from "../ui/Input";

import logo from "../../assets/logo/profiteknik_logo.svg";

import { MdOutlineLogin } from "react-icons/md";

import { rootAuth } from "../../service/api/auth/rootAuth";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);

  const handleClick = async (email: string, password: string) => {
    try {
       const result = await rootAuth.authLogin(email, password);
       setSuccess(true);
    } catch (err) {
       setError(true);
    }
  };

  return (
    <Card>
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
    </Card>
  );
}

function modalSuccess(){
    return (
        <div className="min-h-screen bg-green/60 absolute flex items-center justify-center">
          "success"
        </div>
    )
}


function modalError(){
    return (
        <div className="min-h-screen bg-red/60 absolute flex items-center justify-center">
          "error"
        </div>
    )
}