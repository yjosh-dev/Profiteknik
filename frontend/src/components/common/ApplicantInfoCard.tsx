import { useEffect, useRef, useState } from "react";
import {
  FaChevronDown,
  FaEnvelope,
  FaMobileScreenButton,
  FaPhone,
  FaRepeat,
  FaUser,
} from "react-icons/fa6";
import type { IconType } from "react-icons";

export type ApplicantAction = {
  label: string;
  onClick: () => void;
};

type ApplicantInfoCardProps = {
  profileImageUrl?: string | null;
  firstName?: string | null;
  middleName?: string | null;
  lastName?: string | null;
  email?: string | null;
  phoneNo?: string | null;
  telNo?: string | null;
  actions?: ApplicantAction[];
  onSwap?: () => void;
  defaultAction?: string;
};

// Map status action to color themes
const getActionStyle = (label: string) => {
  switch (label.toLowerCase()) {
    case "completed":
      return "bg-emerald-700 hover:bg-emerald-800 text-white";
    case "pending":
      return "bg-amber-500 hover:bg-amber-600 text-white";
    case "shortlist":
      return "bg-teal-700 hover:bg-teal-800 text-white";
    case "reject":
      return "bg-rose-700 hover:bg-rose-800 text-white";
    case "interview":
      return "bg-sky-700 hover:bg-sky-800 text-white";
    default:
      return "bg-[#991B1B] hover:bg-[#7F1D1D] text-white";
  }
};

const getStatusDotColor = (label: string) => {
  switch (label.toLowerCase()) {
    case "completed":
      return "bg-emerald-500";
    case "pending":
      return "bg-amber-500";
    case "shortlist":
      return "bg-teal-500";
    case "reject":
      return "bg-rose-500";
    case "interview":
      return "bg-sky-500";
    default:
      return "bg-red-700";
  }
};

function InfoItem({
  icon: Icon,
  label,
  value,
}: {
  icon: IconType;
  label: string;
  value?: string | null;
}) {
  const text = value?.trim() ? value : "—";

  return (
    <div className="flex items-center gap-3 min-w-0 p-2.5 rounded-lg bg-zinc-50/80 border border-zinc-200/60 transition-colors hover:bg-zinc-100/80">
      <div className="w-8 h-8 shrink-0 rounded-md bg-white text-zinc-600 border border-zinc-200/80 flex items-center justify-center shadow-2xs">
        <Icon size={13} aria-hidden="true" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="archivo text-[11px] font-semibold text-zinc-500 leading-none">
          {label}
        </p>
        <p
          title={text}
          className="archivo text-xs font-semibold text-zinc-900 leading-tight truncate mt-1"
        >
          {text}
        </p>
      </div>
    </div>
  );
}

export default function ApplicantInfoCard({
  profileImageUrl,
  firstName,
  middleName,
  lastName,
  email,
  phoneNo,
  telNo,
  actions = [],
  onSwap,
  defaultAction = "Pending",
}: ApplicantInfoCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedAction, setSelectedAction] = useState(defaultAction);
  const menuRef = useRef<HTMLDivElement>(null);

  const fullName =
    [firstName, middleName, lastName].filter(Boolean).join(" ") ||
    "Unknown applicant";

  // Close the Actions menu on outside click or Esc
  useEffect(() => {
    if (!menuOpen) return;
    const onClick = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setMenuOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  return (
    <div className="w-full h-full p-5 overflow-y-auto bg-white rounded-md transition">
      {/* Swap Header Button */}
      <div className="flex justify-end h-6">
        {onSwap && (
          <button
            type="button"
            aria-label="Switch view"
            onClick={onSwap}
            className="p-1.5 rounded-lg text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 transition-colors cursor-pointer"
          >
            <FaRepeat size={18} />
          </button>
        )}
      </div>

      {/* Profile Header (Avatar + Name) */}
      <div className="flex flex-col items-center">
        <div className="relative w-24 h-24 rounded-full p-1 border-2 border-zinc-200/80 bg-white shadow-xs">
          <div className="w-full h-full rounded-full bg-zinc-200 text-zinc-500 flex items-center justify-center overflow-hidden">
            {profileImageUrl ? (
              <img
                src={profileImageUrl}
                alt={fullName}
                className="w-full h-full object-cover"
              />
            ) : (
              <FaUser size={40} aria-hidden="true" />
            )}
          </div>
        </div>

        <h2 className="archivo mt-3.5 text-base font-bold text-zinc-900 text-center break-words max-w-full">
          {fullName}
        </h2>
      </div>

      {/* Dynamic Status Action Button Dropdown */}
      <div ref={menuRef} className="relative mt-5">
        <button
          type="button"
          aria-haspopup="menu"
          aria-expanded={menuOpen}
          disabled={actions.length === 0}
          onClick={() => setMenuOpen((open) => !open)}
          className={`archivo w-full h-11 px-4 rounded-lg flex items-center justify-between text-sm font-bold shadow-xs transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${getActionStyle(
            selectedAction
          )}`}
        >
          <span className="flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full bg-white/80`}
              aria-hidden="true"
            />
            {selectedAction}
          </span>
          <span className="w-6 h-6 rounded-md bg-white/20 flex items-center justify-center">
            <FaChevronDown
              size={11}
              aria-hidden="true"
              className={`transition-transform duration-200 ${
                menuOpen ? "rotate-180" : ""
              }`}
            />
          </span>
        </button>

        {menuOpen && (
          <div
            role="menu"
            className="absolute left-0 right-0 top-12 z-30 py-1.5 rounded-lg border border-zinc-200 bg-white shadow-lg overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150"
          >
            {actions.map((action) => {
              const isSelected = selectedAction === action.label;
              return (
                <button
                  key={action.label}
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setSelectedAction(action.label);
                    setMenuOpen(false);
                    action.onClick();
                  }}
                  className={`archivo w-full text-left px-3.5 py-2 text-xs font-semibold flex items-center gap-2.5 transition-colors cursor-pointer ${
                    isSelected
                      ? "bg-zinc-100 text-zinc-900"
                      : "text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900"
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${getStatusDotColor(
                      action.label
                    )}`}
                  />
                  {action.label}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <hr className="mt-6 border-zinc-200" />

      {/* Personal Info Section */}
      <section className="mt-5">
        <h3 className="archivo text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2.5">
          Personal Info
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <InfoItem icon={FaUser} label="First Name" value={firstName} />
          <InfoItem icon={FaUser} label="Last Name" value={lastName} />
          <div className="col-span-1 sm:col-span-2">
            <InfoItem icon={FaUser} label="Middle Name" value={middleName} />
          </div>
        </div>
      </section>

      {/* Contact Details Section */}
      <section className="mt-5">
        <h3 className="archivo text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2.5">
          Contacts
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div className="col-span-1 sm:col-span-2">
            <InfoItem icon={FaEnvelope} label="Email Address" value={email} />
          </div>
          <InfoItem
            icon={FaMobileScreenButton}
            label="Mobile Number"
            value={phoneNo}
          />
          <InfoItem icon={FaPhone} label="Tel. Number" value={telNo} />
        </div>
      </section>
    </div>
  );
}