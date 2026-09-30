import React, { useEffect, useState, useRef } from "react";

import Card from "../components/ui/Card";
import logo from "../assets/logo/profiteknik_logo.svg";
import { FaGoogle, FaApple, FaArrowRight } from "react-icons/fa6";
import { OTPService } from "../service/api/applicants/OTPService";
import { useNavigate } from "react-router-dom";

type Step = "send-otp" | "verify-otp" | "set-credentials";

export default function ApplicantSignup() {
  const STEP_KEY = "step";
  const EMAIL_KEY = "email";

  const isValidStep = (value: string | null): value is Step => {
    return (
      value === "send-otp" ||
      value === "verify-otp" ||
      value === "set-credentials"
    );
  };

  const [step, setStep] = useState<Step>("send-otp");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");

  const navigate = useNavigate();

  const [password, setPassword] = useState({
    password1: "",
    password2: "",
  });

  // reconcile session storage and usestate in event of refresh
  useEffect(() => {
    const cachedStep = sessionStorage.getItem(STEP_KEY);
    const cachedEmail = sessionStorage.getItem("email");

    if (isValidStep(cachedStep)) {
      setStep(cachedStep);
    }

    if (!cachedEmail) {
      setStep("send-otp");
      return;
    }

    if (!email) {
      setEmail(cachedEmail);
    }
  }, []);

  useEffect(() => {
    sessionStorage.setItem(STEP_KEY, step);
  }, [step]);

  const getExpiration = () => {
    return new Date(Date.now() + 5 * 60 * 1000).toISOString(); // +5 minutes, as string
  };

  const setCache = ({
    step,
    email,
    expiration,
  }: {
    step: string;
    email: string;
    expiration: string;
  }) => {
    sessionStorage.setItem("email", email);
    sessionStorage.setItem("step", step);
    sessionStorage.setItem("expiration", expiration);
  };

  // email onchange event
  const onChange = (e: any) => {
    setEmail(e.target.value);
  };

  // go back previous step
  const handleBack = (current_step: Step) => {
    setEmail("");
    switch (current_step) {
      case "verify-otp":
        setStep("send-otp");
        break;

      case "set-credentials":
        sessionStorage.clear();
        setStep("verify-otp");
        break;
    }
  };

  // step 1 on sending otp
  const handleSendOTP = async () => {
    try {
      const send = await OTPService.sendOTP(email);
      setCache({ step, email, expiration: getExpiration() });
      alert(`OTP sent to ${email}`);
      setStep("verify-otp");
    } catch (error) {}
  };

  // step 2 on verifying otp
  const handleVerifyOTP = async () => {
    try {
      const verify = await OTPService.verifyOTP(email, otp);
      alert(verify.data.message);
      setStep("set-credentials");
    } catch (error) {
      alert("invalid otp");
    }
  };

  // step 3 creating account password
  const handleCreateAccount = async () => {
    try {
      const create = await OTPService.createAccount(email, password.password1);
      alert("account created");
      navigate("/applicant/signin");
    } catch (err) {
      alert("error");
    }
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
        <VerifyOTP
          email={email}
          otp={otp}
          onOtpChange={setOtp}
          onCancel={() => handleBack("verify-otp")}
          onVerify={handleVerifyOTP}
        />
      )}
      {step == "set-credentials" && (
        <CreatePassword
          password={password}
          setPassword={setPassword}
          onChangeEmail={() => handleBack("set-credentials")}
          onCreateAccount={handleCreateAccount}
        />
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
  otp,
  onOtpChange,
  onCancel,
  onVerify,
  length = 4,
}: {
  email: string;
  otp: string;
  onOtpChange: (otp: string) => void;
  onVerify: () => void;
  onCancel: () => void;
  length?: number;
}) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, raw: string) => {
    const digit = raw.replace(/\D/g, "").slice(-1);
    if (!digit) return;

    const chars = otp.padEnd(length, " ").split("");
    chars[index] = digit;
    onOtpChange(chars.join("").trimEnd());

    if (index < length - 1) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Backspace") {
      e.preventDefault();
      const chars = otp.padEnd(length, " ").split("");
      if (otp[index]?.trim()) {
        chars[index] = " ";
        onOtpChange(chars.join("").trimEnd());
      } else if (index > 0) {
        chars[index - 1] = " ";
        onOtpChange(chars.join("").trimEnd());
        inputRefs.current[index - 1]?.focus();
      }
    }
    if (e.key === "ArrowLeft" && index > 0)
      inputRefs.current[index - 1]?.focus();
    if (e.key === "ArrowRight" && index < length - 1)
      inputRefs.current[index + 1]?.focus();
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, length);
    if (!pasted) return;
    onOtpChange(pasted);
    inputRefs.current[Math.min(pasted.length, length - 1)]?.focus();
  };

  return (
    <div className="w-screen h-screen flex flex-col items-center justify-center gap-5">
      <img src={logo} className="w-62" />
      <Card className="items-start gap-0 max-w-md w-full py-8 px-8 relative">
        <h1 className="archivo font-bold text-2xl text-zinc-900 mb-2">
          OTP verification
        </h1>
        <p className="archivo text-sm text-zinc-500 mb-6 leading-relaxed">
          Please enter the OTP (One Time Password) sent to{" "}
          <p className="font-semibold">{email}</p>
        </p>

        <div className="flex items-center justify-center gap-3 w-full mb-6">
          {Array.from({ length }).map((_, i) => (
            <input
              key={i}
              ref={(el) => {
                inputRefs.current[i] = el;
              }}
              type="text"
              inputMode="numeric"
              autoComplete={i === 0 ? "one-time-code" : "off"}
              maxLength={1}
              value={otp[i]?.trim() ?? ""}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              onPaste={handlePaste}
              onFocus={(e) => e.target.select()}
              className="archivo w-12 h-12 text-center text-lg font-bold rounded-md
              border border-zinc-400 outline-none focus:border-red-500
              transition-colors"
            />
          ))}
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
          onClick={onVerify}
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

type PasswordState = {
  password1: string;
  password2: string;
};

function CreatePassword({
  password,
  setPassword,
  onChangeEmail,
  onCreateAccount,
}: {
  password: PasswordState;
  setPassword: React.Dispatch<React.SetStateAction<PasswordState>>;
  onChangeEmail: () => void;
  onCreateAccount: () => void;
}) {
  const { password1, password2 } = password;
  const isMatch = password1.length > 0 && password1 === password2;
  const showStatus = password2.length > 0;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPassword((prev) => ({ ...prev, [name]: value }));
  };

  const inputClass = `archivo w-full h-12 px-3 rounded-md border border-zinc-400
    outline-none focus:border-red-500 transition-colors`;

  return (
    <div className="w-screen h-screen flex flex-col items-center justify-center gap-5">
      <img src={logo} className="w-62" />
      <Card className="items-start gap-0 max-w-md w-full py-8 px-8 relative">
        <h1 className="archivo font-bold text-2xl text-zinc-900 mb-2">
          Create password
        </h1>
        <p className="archivo text-sm text-zinc-500 mb-6 leading-relaxed">
          Set a password to finish creating your account.
        </p>

        <label className="archivo text-sm font-semibold text-zinc-800 mb-1">
          Password
        </label>
        <input
          type="text"
          name="password1"
          autoComplete="new-password"
          value={password1}
          onChange={handleChange}
          className={`${inputClass} mb-4`}
        />

        <label className="archivo text-sm font-semibold text-zinc-800 mb-1">
          Confirm password
        </label>
        <input
          type="text"
          name="password2"
          autoComplete="new-password"
          value={password2}
          onChange={handleChange}
          onKeyDown={(e) => e.key === "Enter" && isMatch && onCreateAccount()}
          className={`${inputClass} mb-2`}
        />

        <p
          className={`archivo text-sm font-semibold mb-6 h-5 ${
            isMatch ? "text-green-600" : "text-red-600"
          }`}
        >
          {showStatus
            ? isMatch
              ? "Passwords match"
              : "Passwords do not match"
            : ""}
        </p>

        <button
          type="button"
          onClick={onCreateAccount}
          disabled={!isMatch}
          className="w-full flex items-center justify-center gap-2 rounded-md bg-red-700
          py-3 text-white transition-all duration-200 mb-3
          hover:bg-red-500 hover:shadow-md
          active:scale-95
          disabled:opacity-60 disabled:hover:shadow-none disabled:cursor-not-allowed
          cursor-pointer"
        >
          <span className="archivo font-bold">Create account</span>
        </button>

        <button
          type="button"
          onClick={onChangeEmail}
          className="w-full flex items-center justify-center gap-2 rounded-md
          border border-zinc-300 py-3 text-zinc-700 transition-all duration-200
          hover:bg-zinc-100
          active:scale-95
          cursor-pointer"
        >
          <span className="archivo font-bold">Change email</span>
        </button>
      </Card>
    </div>
  );
}
