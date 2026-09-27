import React, { useState } from "react";

import Card from "../components/ui/Card";
import logo from "../assets/logo/profiteknik_logo.svg";
import { FaGoogle, FaApple, FaArrowRight } from "react-icons/fa6";
import { OTPService } from "../service/api/applicants/OTPService";

type Step = "send-otp" | "verify-otp" | "set-credentials";

export default function ApplicantSignin() {
  const [step, setStep] = useState<Step>("send-otp");
  const [email, setEmail] = useState("");

  const handleSendOTP = async () => {
    try {
      const send = await OTPService.sendOTP(email);
      alert(`OTP sent to ${email}`);
      setStep("verify-otp");
    } catch (error) {}
  };

  const backwardStep = (current_step: Step) => {
    switch (current_step) {
      case "verify-otp":
        setStep("send-otp");
        break;

      case "set-credentials":
        setStep("verify-otp");
        break;
    }
  };

  const handleBack = (current_step: Step) => {
    setEmail("");
    switch (current_step) {
      case "verify-otp":
        setStep("send-otp");
        break;

      case "set-credentials":
        setStep("verify-otp");
        break;
    }
  };

  const onChange = (e: any) => {
    setEmail(e.target.value);
  };

  return (
    <div className="w-screen h-screen">
      {step == "send-otp" && (
        <SendOTP
          email={email}
          onChange={onChange}
          handleSendOTP={handleSendOTP}
        />
      )}
      {step == "verify-otp" && (
        <VerifyOTP email={email} onCancel={() => handleBack("verify-otp")} />
      )}
    </div>
  );
}

function SendOTP({
  email,
  onChange,
  handleSendOTP,
}: {
  email: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSendOTP: () => void;
}) {
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
          onChange={onChange}
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

function VerifyOTP({
  email,
  onCancel,
}: {
  email: string;
  onCancel: () => void;
}) {
  return (
    <div className="w-screen h-screen flex flex-col items-center justify-center gap-5">
      <Card className="items-start gap-0 max-w-md w-full py-8 px-8 relative">
        <h1 className="archivo font-bold text-2xl text-zinc-900 mb-2">
          OTP verification
        </h1>
        <p className="archivo text-sm text-zinc-500 mb-6 leading-relaxed">
          Please enter the OTP (One Time Password) sent to{" "}
          <p className="font-semibold">{email}</p>
        </p>

        <div className="flex items-center justify-center gap-3 w-full mb-6">
          <input
            type="text"
            inputMode="numeric"
            maxLength={1}
            className="archivo w-12 h-12 text-center text-lg font-bold rounded-md
            border border-zinc-400 outline-none focus:border-red-500
            transition-colors"
          />
          <input
            type="text"
            inputMode="numeric"
            maxLength={1}
            className="archivo w-12 h-12 text-center text-lg font-bold rounded-md
            border border-zinc-400 outline-none focus:border-red-500
            transition-colors"
          />
          <input
            type="text"
            inputMode="numeric"
            maxLength={1}
            className="archivo w-12 h-12 text-center text-lg font-bold rounded-md
            border border-zinc-400 outline-none focus:border-red-500
            transition-colors"
          />
          <input
            type="text"
            inputMode="numeric"
            maxLength={1}
            className="archivo w-12 h-12 text-center text-lg font-bold rounded-md
            border border-zinc-400 outline-none focus:border-red-500
            transition-colors"
          />
        </div>

        <div className="flex items-center justify-between w-full mb-6">
          <p className="archivo text-sm text-zinc-500">
            Remaining time:{" "}
            <span className="font-bold text-zinc-800">02:00</span>
          </p>

          <button
            type="button"
            className="archivo text-sm font-bold text-red-600 underline
            disabled:text-zinc-400 disabled:no-underline disabled:cursor-not-allowed
            cursor-pointer"
          >
            Didn't get code? Resend
          </button>
        </div>

        <button
          type="button"
          className="w-full flex items-center justify-center gap-2 rounded-md bg-red-700
          py-3 text-white transition-all duration-200 mb-3
          hover:bg-red-500 hover:shadow-md
          active:scale-95
          disabled:opacity-60 disabled:hover:shadow-none disabled:cursor-not-allowed
          cursor-pointer"
        >
          <span className="archivo font-bold">Verify</span>
        </button>

        <button
          type="button"
          onClick={onCancel}
          className="w-full flex items-center justify-center gap-2 rounded-md
          border border-zinc-300 py-3 text-zinc-700 transition-all duration-200
          hover:bg-zinc-100
          active:scale-95
          cursor-pointer"
        >
          <span className="archivo font-bold">Cancel</span>
        </button>
      </Card>
    </div>
  );
}
