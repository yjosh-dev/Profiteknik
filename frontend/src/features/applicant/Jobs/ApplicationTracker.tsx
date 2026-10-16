import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaArrowLeft,
  FaBuilding,
  FaMapMarkerAlt,
  FaMoneyBillWave,
  FaBriefcase,
} from "react-icons/fa";
import { FaCheck, FaXmark, FaEllipsis } from "react-icons/fa6";

/* ---------------- Types ---------------- */

type StepStatus = "completed" | "current" | "upcoming" | "rejected";

type Step = {
  key: string;
  label: string;
  description: string;
  date?: string; // ISO or readable string
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
  current_status: string; // e.g. "Interview"
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
      label: "Applied",
      description: "Your application was received by the employer.",
      date: "2025-05-09",
      status: "completed",
    },
    {
      key: "review",
      label: "Under review",
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
      label: "Interview",
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
      description: "Congratulations, you're hired!",
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
  if (!input) return "";
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) return input;
  return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

function formatDateTime(input?: string) {
  if (!input) return "";
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

const focusRing =
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2";

/* ---------------- Subcomponents ---------------- */

function StepDot({ status }: { status: StepStatus }) {
  const base = "flex h-6 w-6 shrink-0 items-center justify-center rounded-full";

  if (status === "completed") {
    return (
      <span className={`${base} bg-emerald-600 text-white`}>
        <FaCheck size={10} />
      </span>
    );
  }

  if (status === "current") {
    return (
      <span className={`${base} border-2 border-emerald-600 bg-white`}>
        <span className="h-2 w-2 rounded-full bg-emerald-600" />
      </span>
    );
  }

  if (status === "rejected") {
    return (
      <span className={`${base} bg-red-700 text-white`}>
        <FaXmark size={12} />
      </span>
    );
  }

  return <span className={`${base} border-2 border-zinc-200 bg-white`} />;
}

function Stepper({ steps }: { steps: Step[] }) {
  return (
    <div className="overflow-x-auto">
      <ol className="flex min-w-[620px]">
        {steps.map((step, i) => {
          const isLast = i === steps.length - 1;
          const isUpcoming = step.status === "upcoming";
          const solid = step.status === "completed";

          return (
            <li
              key={step.key}
              className="min-w-0 flex-1"
              aria-current={step.status === "current" ? "step" : undefined}
            >
              {/* dot + connector */}
              <div className="flex items-center">
                <StepDot status={step.status} />
                {!isLast && (
                  <div
                    aria-hidden="true"
                    className={`mx-2 h-0 flex-1 border-t-2 ${
                      solid ? "border-emerald-600" : "border-dashed border-zinc-200"
                    }`}
                  />
                )}
              </div>

              {/* label + date */}
              <div className="mt-2 pr-3">
                <p
                  className={`archivo text-xs font-semibold ${
                    isUpcoming ? "text-zinc-400" : "text-zinc-800"
                  }`}
                >
                  {step.label}
                </p>
                <p className="archivo mt-0.5 min-h-[1rem] text-xs text-zinc-500">
                  {step.date ? formatDate(step.date) : ""}
                </p>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function MetaItem({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <span className="archivo inline-flex items-center gap-1.5 text-sm text-zinc-600">
      <span className="text-zinc-400" aria-hidden="true">
        {icon}
      </span>
      {children}
    </span>
  );
}

function InfoCard({
  title,
  action,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-zinc-200 bg-white p-5">
      <div className="flex items-center justify-between gap-3">
        <h3 className="archivo text-xs font-semibold text-zinc-500">{title}</h3>
        {action}
      </div>
      <div className="mt-3">{children}</div>
    </section>
  );
}

/* ---------------- Main Component ---------------- */

export default function ApplicationTracker({
  data = MOCK_APPLICATION,
  onMessageRecruiter,
  onWithdraw,
}: {
  data?: ApplicationTrackerData;
  onMessageRecruiter?: () => void;
  onWithdraw?: () => void;
}) {
  const navigate = useNavigate();
  const [showNotes, setShowNotes] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const currentStep = useMemo(
    () => data.steps.find((s) => s.status === "current"),
    [data.steps],
  );

  const status = data.current_status.toLowerCase();
  const isRejected = status === "rejected";
  const isCompleted = status === "completed";

  const statusPill = isRejected
    ? { label: "Rejected", cls: "bg-red-50 text-red-700 ring-red-100" }
    : isCompleted
      ? { label: "Completed", cls: "bg-emerald-50 text-emerald-800 ring-emerald-100" }
      : { label: data.current_status, cls: "bg-emerald-50 text-emerald-800 ring-emerald-100" };

  /* close the menu on outside click / Escape */
  useEffect(() => {
    if (!menuOpen) return;
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
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
    <div className="flex w-full justify-center px-4 py-8">
      <div className="flex w-full max-w-5xl flex-col gap-5">
        {/* Back link */}
        <button
          type="button"
          onClick={() => navigate(-1)}
          className={`archivo inline-flex cursor-pointer items-center gap-2 self-start rounded text-sm font-semibold text-zinc-600 transition-colors hover:text-zinc-900 ${focusRing}`}
        >
          <FaArrowLeft size={12} />
          Back to applications
        </button>

        {/* Main card */}
        <div className="rounded-xl border border-zinc-200 bg-white p-6">
          {/* Title row */}
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <h1 className="archivo truncate text-2xl font-semibold text-zinc-900">
                {data.job.title}
              </h1>
              <p className="archivo mt-1 text-xs text-zinc-500">
                Applied {formatDateTime(data.applied_at)} · Application #{data.application_id}
              </p>
            </div>

            <span
              className={`archivo rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${statusPill.cls}`}
            >
              {statusPill.label}
            </span>
          </div>

          {/* Meta */}
          <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
            <MetaItem icon={<FaBuilding size={12} />}>{data.job.company}</MetaItem>
            <MetaItem icon={<FaMapMarkerAlt size={12} />}>{data.job.location}</MetaItem>
            <MetaItem icon={<FaBriefcase size={12} />}>{data.job.employment_type}</MetaItem>
            <MetaItem icon={<FaMoneyBillWave size={12} />}>{data.job.salary_range}</MetaItem>
          </div>

          {/* Stepper */}
          <div className="mt-8">
            <Stepper steps={data.steps} />
          </div>

          {/* Actions */}
          <div className="mt-8 flex items-center gap-2 border-t border-zinc-100 pt-5">
            <button
              type="button"
              onClick={onMessageRecruiter}
              className={`archivo h-10 cursor-pointer rounded-lg border border-emerald-900 bg-white px-4 text-sm font-semibold text-emerald-900 transition-colors hover:bg-emerald-50 ${focusRing}`}
            >
              Message recruiter
            </button>

            <div className="relative" ref={menuRef}>
              <button
                type="button"
                aria-label="More actions"
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                onClick={() => setMenuOpen((v) => !v)}
                className={`flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-800 ${focusRing}`}
              >
                <FaEllipsis size={14} />
              </button>

              {menuOpen && (
                <div
                  role="menu"
                  className="absolute left-0 top-full z-10 mt-1 w-48 overflow-hidden rounded-lg border border-zinc-200 bg-white py-1 shadow-lg"
                >
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setMenuOpen(false);
                      onWithdraw?.();
                    }}
                    className="archivo w-full cursor-pointer px-3 py-2 text-left text-sm text-red-700 transition-colors hover:bg-red-50 focus:bg-red-50 focus:outline-none"
                  >
                    Withdraw application
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-[repeat(auto-fit,minmax(240px,1fr))]">
          {currentStep && (
            <InfoCard title="What's next">
              <p className="archivo text-sm font-semibold text-zinc-900">{currentStep.label}</p>
              <p className="archivo mt-1 text-sm leading-relaxed text-zinc-600">
                {currentStep.description}
              </p>
              {currentStep.date && (
                <p className="archivo mt-3 inline-block rounded-md bg-zinc-100 px-2 py-1 text-xs font-semibold text-zinc-700">
                  {formatDate(currentStep.date)}
                </p>
              )}
            </InfoCard>
          )}

          {data.recruiter && (
            <InfoCard title="Recruiter">
              <div className="flex items-center gap-3">
                <div className="archivo flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-sm font-semibold text-zinc-700">
                  {data.recruiter.name
                    .split(" ")
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join("")}
                </div>
                <div className="min-w-0">
                  <p className="archivo truncate text-sm font-semibold text-zinc-900">
                    {data.recruiter.name}
                  </p>
                  <p className="archivo truncate text-xs text-zinc-500">{data.recruiter.role}</p>
                </div>
              </div>
              <a
                href={`mailto:${data.recruiter.email}`}
                className={`archivo mt-3 block truncate rounded text-sm text-emerald-800 underline-offset-2 hover:underline ${focusRing}`}
              >
                {data.recruiter.email}
              </a>
            </InfoCard>
          )}

          {data.notes && (
            <InfoCard
              title="Notes"
              action={
                <button
                  type="button"
                  onClick={() => setShowNotes((v) => !v)}
                  aria-expanded={showNotes}
                  className={`archivo cursor-pointer rounded text-xs font-semibold text-emerald-800 underline-offset-2 hover:underline ${focusRing}`}
                >
                  {showNotes ? "Hide" : "Show"}
                </button>
              }
            >
              {showNotes ? (
                <p className="archivo text-sm leading-relaxed text-zinc-600">{data.notes}</p>
              ) : (
                <p className="archivo text-sm text-zinc-400">Notes hidden.</p>
              )}
            </InfoCard>
          )}
        </div>
      </div>
    </div>
  );
}