import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaBuilding, FaMapMarkerAlt, FaCalendarAlt, FaMoneyBillWave, FaBriefcase } from "react-icons/fa";
import { FaCheck, FaXmark } from "react-icons/fa6";

/* ---------------- Types ---------------- */

type StepStatus = "completed" | "current" | "upcoming" | "rejected";

type Step = {
  key: string;
  label: string;
  description: string;
  date?: string;      // ISO or readable string
  status: StepStatus;
};

type ApplicationTrackerData = {
  application_id: number;
  job: {
    id: number;
    title: string;
    company: string;
    location: string;
    employment_type: string;
    salary_range: string;
    logo_url?: string;
  };
  applied_at: string;
  current_status: string;   // e.g. "Interview"
  steps: Step[];
  recruiter?: {
    name: string;
    role: string;
    email: string;
    avatar_url?: string;
  };
  notes?: string;
};

/* ---------------- Mock Data ---------------- */

const MOCK_APPLICATION: ApplicationTrackerData = {
  application_id: 1042,
  job: {
    id: 88,
    title: "Underwater Welder",
    company: "Profikenik Corp.",
    location: "Manila, Philippines (Hybrid)",
    employment_type: "Full-time",
    salary_range: "₱60,000 – ₱90,000 / month",
  },
  applied_at: "2025-05-09T10:30:00Z",
  current_status: "Interview",
  steps: [
    {
      key: "applied",
      label: "Application Submitted",
      description: "Your application was received by the employer.",
      date: "2025-05-09",
      status: "completed",
    },
    {
      key: "review",
      label: "Under Review",
      description: "The hiring team is reviewing your resume and portfolio.",
      date: "2025-05-10",
      status: "completed",
    },
    {
      key: "shortlisted",
      label: "Shortlisted",
      description: "You were shortlisted from the initial applicant pool.",
      date: "2025-05-12",
      status: "completed",
    },
    {
      key: "interview",
      label: "Interview Scheduled",
      description: "Technical interview with the engineering team.",
      date: "2025-05-18",
      status: "current",
    },
    {
      key: "offer",
      label: "Offer",
      description: "Awaiting final decision from the employer.",
      status: "upcoming",
    },
    {
      key: "hired",
      label: "Hired",
      description: "Congratulations — you're hired!",
      status: "upcoming",
    },
  ],
  recruiter: {
    name: "Sarah Chen",
    role: "Senior Recruiter",
    email: "sarah.chen@xureapp.com",
  },
  notes:
    "Bring your portfolio. The interview will focus on React performance and component architecture.",
};

/* ---------------- Helpers ---------------- */

function formatDate(input?: string) {
  if (!input) return "—";
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) return input;
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatDateTime(input?: string) {
  if (!input) return "—";
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) return input;
  return d.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

/* ---------------- Subcomponents ---------------- */

function StepDot({ status }: { status: StepStatus }) {
  const base =
    "w-8 h-8 rounded-full flex items-center justify-center border-2 flex-shrink-0";

  if (status === "completed") {
    return (
      <div className={`${base} bg-red-600 border-red-600 text-white`}>
        <FaCheck size={12} />
      </div>
    );
  }

  if (status === "current") {
    return (
      <div
        className={`${base} bg-white border-red-600 text-red-600 relative`}
      >
        <span className="w-2.5 h-2.5 rounded-full bg-red-600" />
        <span className="absolute inset-0 rounded-full border-2 border-red-500 animate-ping opacity-40" />
      </div>
    );
  }

  if (status === "rejected") {
    return (
      <div className={`${base} bg-red-700 border-red-700 text-white`}>
        <FaXmark size={14} />
      </div>
    );
  }

  // upcoming
  return (
    <div className={`${base} bg-white border-zinc-300 text-zinc-400`}>
      <span className="w-2.5 h-2.5 rounded-full bg-zinc-300" />
    </div>
  );
}

function StepRow({
  step,
  isLast,
  isNext,
}: {
  step: Step;
  isLast: boolean;
  isNext: boolean;
}) {
  const isUpcoming = step.status === "upcoming";

  return (
    <div className="flex gap-4">
      {/* Left rail */}
      <div className="flex flex-col items-center">
        <StepDot status={step.status} />
        {!isLast && (
          <div
            className={`w-0.5 flex-1 my-1 ${
              isNext ? "bg-red-500" : "bg-zinc-200"
            }`}
          />
        )}
      </div>

      {/* Content */}
      <div className={`flex-1 pb-6 ${isLast ? "pb-0" : ""}`}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <p
              className={`archivo text-sm font-bold ${
                isUpcoming ? "text-zinc-400" : "text-zinc-900"
              }`}
            >
              {step.label}
            </p>
            <p
              className={`archivo text-xs mt-0.5 ${
                isUpcoming ? "text-zinc-400" : "text-zinc-500"
              }`}
            >
              {step.description}
            </p>
          </div>

          {step.date && (
            <span
              className={`archivo text-[11px] whitespace-nowrap px-2 py-1 rounded-md ${
                isUpcoming
                  ? "bg-zinc-100 text-zinc-400"
                  : "bg-red-50 text-red-700"
              }`}
            >
              {formatDate(step.date)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3 py-2">
      <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center flex-shrink-0">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="archivo text-[11px] uppercase tracking-wide text-zinc-400 font-semibold">
          {label}
        </p>
        <p className="archivo text-sm text-zinc-800 truncate">{value}</p>
      </div>
    </div>
  );
}

/* ---------------- Main Component ---------------- */

export default function ApplicationTracker({
  data = MOCK_APPLICATION,
}: {
  data?: ApplicationTrackerData;
}) {
  const navigate = useNavigate();
  const [showNotes, setShowNotes] = useState(true);

  // Find the index of the current step so we can color the connector above it
  const currentIndex = useMemo(
    () => data.steps.findIndex((s) => s.status === "current"),
    [data.steps],
  );

  const isRejected = data.current_status.toLowerCase() === "rejected";
  const isCompleted = data.current_status.toLowerCase() === "completed";

  const statusPill = (() => {
    if (isRejected) return { label: "Rejected", cls: "bg-red-100 text-red-700" };
    if (isCompleted) return { label: "Completed", cls: "bg-emerald-100 text-emerald-700" };
    return {
      label: data.current_status,
      cls: "bg-red-600 text-white",
    };
  })();

  return (
    <div className="w-full flex justify-center py-8">
      <div className="w-[80%] max-w-5xl flex flex-col gap-5">
        {/* Back link */}
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="archivo inline-flex items-center gap-2 text-sm font-bold text-zinc-600 hover:text-red-700 transition-colors self-start cursor-pointer"
        >
          <FaArrowLeft size={12} />
          Back to applications
        </button>

        {/* Header card */}
        <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm p-6">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-start gap-4 min-w-0">
              {/* Logo */}
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-red-500 to-red-700 text-white flex items-center justify-center font-bold text-xl flex-shrink-0">
                {data.job.company.charAt(0)}
              </div>

              <div className="min-w-0">
                <h1 className="archivo text-2xl font-bold text-zinc-900 truncate">
                  {data.job.title}
                </h1>
                <p className="archivo text-sm text-zinc-500 mt-0.5">
                  {data.job.company}
                </p>
                <p className="archivo text-xs text-zinc-400 mt-1">
                  Applied {formatDateTime(data.applied_at)} · App #{data.application_id}
                </p>
              </div>
            </div>

            <span
              className={`archivo text-xs font-bold px-3 py-1.5 rounded-full ${statusPill.cls}`}
            >
              {statusPill.label}
            </span>
          </div>

          {/* Job meta */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 mt-6 pt-5 border-t border-zinc-100">
            <InfoRow icon={<FaBuilding size={12} />} label="Company" value={data.job.company} />
            <InfoRow icon={<FaMapMarkerAlt size={12} />} label="Location" value={data.job.location} />
            <InfoRow icon={<FaBriefcase size={12} />} label="Type" value={data.job.employment_type} />
            <InfoRow icon={<FaMoneyBillWave size={12} />} label="Salary" value={data.job.salary_range} />
          </div>
        </div>

        {/* Two-column body */}
        <div className="grid grid-cols-1 lg:grid-cols-[60fr_40fr] gap-5">
          {/* Left: Progress timeline */}
          <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm p-6">
            <h2 className="archivo text-lg font-bold text-zinc-900 mb-5">
              Application Progress
            </h2>

            <div>
              {data.steps.map((step, i) => (
                <StepRow
                  key={step.key}
                  step={step}
                  isLast={i === data.steps.length - 1}
                  isNext={currentIndex !== -1 && i < currentIndex}
                />
              ))}
            </div>
          </div>

          {/* Right: Sidebar */}
          <div className="flex flex-col gap-5">
            {/* Recruiter */}
            {data.recruiter && (
              <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm p-5">
                <h3 className="archivo text-sm font-bold text-zinc-900 mb-3">
                  Recruiter
                </h3>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-red-100 text-red-700 font-bold flex items-center justify-center">
                    {data.recruiter.name
                      .split(" ")
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join("")}
                  </div>
                  <div className="min-w-0">
                    <p className="archivo text-sm font-bold text-zinc-900 truncate">
                      {data.recruiter.name}
                    </p>
                    <p className="archivo text-xs text-zinc-500 truncate">
                      {data.recruiter.role}
                    </p>
                  </div>
                </div>
                <a
                  href={`mailto:${data.recruiter.email}`}
                  className="archivo mt-3 block text-xs text-red-700 hover:underline truncate"
                >
                  {data.recruiter.email}
                </a>
              </div>
            )}

            {/* Notes */}
            {data.notes && (
              <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm p-5">
                <div className="flex items-center justify-between">
                  <h3 className="archivo text-sm font-bold text-zinc-900">
                    Notes
                  </h3>
                  <button
                    type="button"
                    onClick={() => setShowNotes((v) => !v)}
                    className="archivo text-xs text-red-700 hover:underline cursor-pointer"
                  >
                    {showNotes ? "Hide" : "Show"}
                  </button>
                </div>
                {showNotes && (
                  <p className="archivo text-xs text-zinc-600 mt-2 leading-relaxed">
                    {data.notes}
                  </p>
                )}
              </div>
            )}

            {/* Next step highlight */}
            {currentIndex !== -1 && (
              <div className="bg-gradient-to-br from-red-600 to-red-700 text-white rounded-2xl shadow-sm p-5">
                <div className="flex items-center gap-2">
                  <FaCalendarAlt size={12} />
                  <p className="archivo text-[11px] uppercase tracking-wide font-semibold opacity-90">
                    Next Step
                  </p>
                </div>
                <p className="archivo text-base font-bold mt-2">
                  {data.steps[currentIndex].label}
                </p>
                <p className="archivo text-xs opacity-90 mt-1 leading-relaxed">
                  {data.steps[currentIndex].description}
                </p>
                {data.steps[currentIndex].date && (
                  <p className="archivo text-xs font-bold mt-3 bg-white/15 inline-block px-2.5 py-1 rounded-md">
                    {formatDate(data.steps[currentIndex].date)}
                  </p>
                )}
              </div>
            )}

            {/* Action buttons */}
            <div className="flex flex-col gap-2">
              <button
                type="button"
                className="archivo h-10 px-5 rounded-xl bg-red-700 text-white text-sm font-bold hover:bg-red-800 transition-colors cursor-pointer"
              >
                Message Recruiter
              </button>
              <button
                type="button"
                className="archivo h-10 px-5 rounded-xl bg-white border border-red-200 text-red-700 text-sm font-bold hover:bg-red-50 transition-colors cursor-pointer"
              >
                Withdraw Application
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}