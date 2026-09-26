import React, { useState } from "react";

import Card from "../components/ui/Card";
import logo from "../assets/logo/profiteknik_logo.svg";
import { FaGoogle, FaApple, FaArrowRight } from "react-icons/fa6";

export default function ApplicantSignin() {
  const [email, setEmail] = useState("");

  const handleSendOTP = () => {
     alert()
  }

  return (
    <div className="w-screen h-screen flex flex-col items-center justify-center gap-5">
      <img src={logo} className="w-62" />
      <Card className="items-start gap-0 max-w-md w-full py-8 px-8 relative">
        <h1 className="archivo font-bold text-2xl text-zinc-900 mb-2">
          Ready to take the next step?
        </h1>
        <p className="archivo text-lg text-zinc-800 mb-4">
          Create an account or sign in.
        </p>

        <p className="archivo text-sm text-zinc-500 mb-6 leading-relaxed">
          By clicking any of the 'Continue' options below, you understand and
          agree to Indeed's{" "}
          <span className="text-red-600 underline cursor-pointer">Terms</span>.
          You also acknowledge our{" "}
          <span className="text-red-600 underline cursor-pointer">Cookie</span>{" "}
          and{" "}
          <span className="text-red-600 underline cursor-pointer">Privacy</span>{" "}
          policies. You will receive marketing messages from Indeed and may opt
          out at any time by following the unsubscribe link in our messages, or
          as detailed in our terms.
        </p>

        <label
          htmlFor="email"
          className="archivo font-bold text-sm text-zinc-900 mb-1.5"
        >
          Email address <span className="text-red-600">*</span>
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="archivo w-full rounded-md border border-zinc-400 px-4 h-11 mb-5
          outline-none focus:border-red-500 transition-colors"
        />

        <button
          type="button"
          onClick={handleSendOTP}
          disabled={email.trim() === ""}
          className="w-full flex items-center justify-center gap-2 rounded-md bg-red-700
          py-3 text-white transition-all duration-200
          hover:bg-red-500 hover:shadow-md
          active:scale-95
          disabled:opacity-60 disabled:hover:shadow-none disabled:cursor-not-allowed
          cursor-pointer"
        >
          <span className="archivo font-bold">Continue</span>
          <FaArrowRight size={15} />
        </button>
      </Card>
    </div>
  );
}
