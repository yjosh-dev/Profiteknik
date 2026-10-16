import React, { useEffect, useState, useRef } from "react";

import Card from "../components/ui/Card";
import logo from "../assets/logo/profiteknik_logo.svg";
import {
  FaArrowRight,
  FaEnvelopeCircleCheck,
  FaRegClock,
  FaTriangleExclamation,
} from "react-icons/fa6";
import { OTPService } from "../service/api/applicants/OTPService";
import { useNavigate } from "react-router-dom";

type Step = "send-otp" | "verify-otp" | "set-credentials";

// How long an OTP is valid. Keep this in sync with your backend / email template.
const OTP_EXPIRY_SECONDS = 120;

export default function ApplicantSignup() {
  const STEP_KEY = "step";
  const EMAIL_KEY = "email";
  const EXPIRATION_KEY = "expiration";

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
  const [otpError, setOtpError] = useState("");
  const [expiration, setExpiration] = useState(""); // ISO string
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const [password, setPassword] = useState({
    password1: "",
    password2: "",
  });

  // reconcile session storage and usestate in event of refresh
  useEffect(() => {
    const cachedStep = sessionStorage.getItem(STEP_KEY);
    const cachedEmail = sessionStorage.getItem(EMAIL_KEY);
    const cachedExpiration = sessionStorage.getItem(EXPIRATION_KEY);

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

    if (cachedExpiration) {
      setExpiration(cachedExpiration);
    }
  }, []);

  useEffect(() => {
    sessionStorage.setItem(STEP_KEY, step);
  }, [step]);

  const getExpiration = () => {
    return new Date(Date.now() + OTP_EXPIRY_SECONDS * 1000).toISOString();
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
    sessionStorage.setItem(EMAIL_KEY, email);
    sessionStorage.setItem(STEP_KEY, step);
    sessionStorage.setItem(EXPIRATION_KEY, expiration);
  };

  // email onchange event
  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  // go back previous step
  const handleBack = (current_step: Step) => {
    setEmail("");

    switch (current_step) {
      case "verify-otp":
        setOtp("");
        setOtpError("");
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
      setLoading(true);

      await OTPService.sendOTP(email);

      const newExpiration = getExpiration();

      setCache({
        step: "verify-otp",
        email,
        expiration: newExpiration,
      });

      setExpiration(newExpiration);
      setStep("verify-otp");
    } catch (error) {
      alert("Failed to send OTP.");
    } finally {
      setLoading(false);
    }
  };

  // resend otp (from the verify step)
  const handleResendOTP = async () => {
    try {
      setLoading(true);

      await OTPService.sendOTP(email);

      const newExpiration = getExpiration();

      setCache({
        step: "verify-otp",
        email,
        expiration: newExpiration,
      });

      setExpiration(newExpiration);
      setOtp("");
      setOtpError("");
    } catch (error) {
      alert("Failed to resend OTP.");
    } finally {
      setLoading(false);
    }
  };

  // step 2 on verifying otp
  const handleVerifyOTP = async () => {
    try {
      setLoading(true);
      setOtpError("");

      await OTPService.verifyOTP(email, otp);

      setStep("set-credentials");
    } catch (error) {
      setOtpError("Invalid or expired code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // step 3 creating account password
  const handleCreateAccount = async () => {
    try {
      setLoading(true);

      await OTPService.createAccount(email, password.password1);

      sessionStorage.removeItem("step");

      navigate("/applicant/signin");
    } catch (err) {
      alert("Error creating account.");
    } finally {
      setLoading(false);
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
          onOtpChange={(value) => {
            setOtp(value);
            setOtpError("");
          }}
          onCancel={() => handleBack("verify-otp")}
          onVerify={handleVerifyOTP}
          onResend={handleResendOTP}
          expiresAt={expiration}
          error={otpError}
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

      {/* LOADING OVERLAY */}
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="flex flex-col items-center gap-3 rounded-xl bg-white px-8 py-6 shadow-lg">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-red-700" />

            <p className="text-sm font-medium text-gray-700">
              Please wait...
            </p>
          </div>
        </div>
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
          <span className="text-red-600 underline cursor-pointer">
            Privacy
          </span>{" "}
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

const formatTime = (totalSeconds: number) => {
  const m = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, "0");
  const s = (totalSeconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
};

function VerifyOTP({
  email,
  otp,
  onOtpChange,
  onCancel,
  onVerify,
  onResend,
  expiresAt,
  error,
  length = 4,
}: {
  email: string;
  otp: string;
  onOtpChange: (otp: string) => void;
  onVerify: () => void;
  onCancel: () => void;
  onResend: () => void;
  expiresAt: string; // ISO string
  error?: string;
  length?: number;
}) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const getRemaining = () => {
    const end = Date.parse(expiresAt);
    if (Number.isNaN(end)) return 0;
    return Math.max(0, Math.ceil((end - Date.now()) / 1000));
  };

  const [secondsLeft, setSecondsLeft] = useState(getRemaining);

  const isExpired = secondsLeft <= 0;
  const isLowTime = secondsLeft > 0 && secondsLeft <= 30;
  const isComplete = Array.from({ length }).every((_, i) => otp[i]?.trim());
  const canVerify = isComplete && !isExpired;

  // Countdown — based on the stored expiration so it survives refreshes
  useEffect(() => {
    setSecondsLeft(getRemaining());

    const id = setInterval(() => {
      const remaining = getRemaining();
      setSecondsLeft(remaining);
      if (remaining === 0) clearInterval(id);
    }, 1000);

    return () => clearInterval(id);
  }, [expiresAt]);

  // Focus first box on mount and whenever a new code is issued
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, [expiresAt]);

  const handleChange = (index: number, raw: string) => {
    const digits = raw.replace(/\D/g, "");

    if (!digits) return;

    const chars = otp.padEnd(length, " ").split("");

    if (digits.length === 1) {
      chars[index] = digits;
      onOtpChange(chars.join("").trimEnd());
      if (index < length - 1) inputRefs.current[index + 1]?.focus();
      return;
    }

    // Multiple digits at once (SMS autofill / quick typing)
    digits
      .slice(0, length - index)
      .split("")
      .forEach((d, i) => {
        chars[index + i] = d;
      });
    onOtpChange(chars.join("").trimEnd());
    inputRefs.current[Math.min(index + digits.length, length - 1)]?.focus();
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

    if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }

    if (e.key === "ArrowRight" && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    if (e.key === "Enter" && canVerify) {
      onVerify();
    }
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

      <Card className="items-center gap-0 max-w-md w-full py-8 px-8 relative">
        {/* Icon */}
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-50 mb-4">
          <FaEnvelopeCircleCheck size={24} className="text-red-600" />
        </div>

        <h1 className="archivo font-bold text-2xl text-zinc-900 mb-2 text-center">
          OTP verification
        </h1>

        <p className="archivo text-sm text-zinc-500 mb-6 leading-relaxed text-center">
          Please enter the {length}-digit code sent to
          <span className="mt-2 block break-all font-semibold text-zinc-800">
            {email}
          </span>
        </p>

        {/* OTP inputs */}
        <div className="flex items-center justify-center gap-3 w-full mb-2">
          {Array.from({ length }).map((_, i) => {
            const filled = !!otp[i]?.trim();
            return (
              <input
                key={i}
                ref={(el) => {
                  inputRefs.current[i] = el;
                }}
                type="text"
                inputMode="numeric"
                autoComplete={i === 0 ? "one-time-code" : "off"}
                aria-label={`Digit ${i + 1} of ${length}`}
                value={otp[i]?.trim() ?? ""}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                onPaste={handlePaste}
                onFocus={(e) => e.target.select()}
                className={`archivo w-14 h-14 text-center text-xl font-bold rounded-lg border-2
                outline-none transition-all duration-150
                focus:border-red-500 focus:ring-4 focus:ring-red-100
                ${
                  error
                    ? "border-red-400 bg-red-50 text-red-700"
                    : filled
                      ? "border-red-600 bg-red-50 text-red-700"
                      : "border-zinc-300 bg-white text-zinc-900"
                }`}
              />
            );
          })}
        </div>

        {/* Error message */}
        <div className="h-6 w-full mb-2 flex items-center justify-center">
          {error && (
            <p className="archivo flex items-center gap-1.5 text-sm text-red-600">
              <FaTriangleExclamation size={13} />
              {error}
            </p>
          )}
        </div>

        {/* Timer */}
        <div className="w-full mb-6">
          <div className="flex items-center justify-between mb-2">
            <p className="archivo flex items-center gap-1.5 text-sm text-zinc-500">
              <FaRegClock size={14} />
              {isExpired ? "Code expired" : "Code expires in"}
            </p>
            <span
              className={`archivo font-bold tabular-nums text-sm ${
                isExpired || isLowTime ? "text-red-600" : "text-zinc-800"
              }`}
            >
              {formatTime(secondsLeft)}
            </span>
          </div>

          <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-100">
            <div
              className={`h-full rounded-full transition-all duration-1000 ease-linear ${
                isLowTime || isExpired ? "bg-red-600" : "bg-red-400"
              }`}
              style={{
                width: `${Math.min(
                  100,
                  Math.max(0, (secondsLeft / OTP_EXPIRY_SECONDS) * 100),
                )}%`,
              }}
            />
          </div>
        </div>

        {/* Verify */}
        <button
          type="button"
          onClick={onVerify}
          disabled={!canVerify}
          className="w-full flex items-center justify-center gap-2 rounded-md bg-red-700
          py-3 text-white transition-all duration-200 mb-3
          hover:bg-red-500 hover:shadow-md
          active:scale-95
          disabled:opacity-60 disabled:hover:shadow-none disabled:hover:bg-red-700
          disabled:active:scale-100 disabled:cursor-not-allowed
          cursor-pointer"
        >
          <span className="archivo font-bold">Verify</span>
        </button>

        {/* Cancel */}
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

        {/* Resend */}
        <p className="archivo text-sm text-zinc-500 mt-6">
          Didn't get the code?{" "}
          <button
            type="button"
            onClick={onResend}
            disabled={!isExpired}
            className="font-bold text-red-600 underline
            disabled:text-zinc-400 disabled:no-underline disabled:cursor-not-allowed
            cursor-pointer"
          >
            Resend
          </button>
          {!isExpired && (
            <span className="text-zinc-400"> in {formatTime(secondsLeft)}</span>
          )}
        </p>
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

    setPassword((prev) => ({
      ...prev,
      [name]: value,
    }));
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
          onKeyDown={(e) =>
            e.key === "Enter" && isMatch && onCreateAccount()
          }
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