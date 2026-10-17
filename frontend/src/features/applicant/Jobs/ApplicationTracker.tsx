import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  FaArrowLeft,
  FaBuilding,
  FaMapMarkerAlt,
  FaMoneyBillWave,
  FaBriefcase,
} from "react-icons/fa";
import { FaCheck, FaXmark, FaEllipsis } from "react-icons/fa6";

import { applicantsMyJobService } from "../../../service/api/applicants/applicantsMyJobsService";

/* ---------------- Types ---------------- */

type StepStatus = "completed" | "current" | "upcoming" | "rejected";

type Step = {
  key: string;
  label: string;
  description: string;
  date?: string;
  status: StepStatus;
};

type ApplicationTrackerResponse = {
  application_id: number;
  applied_at: string;
  current_status: string;

  job: {
    id: number;
    title: string;
    company: string;
    location: string;
    employment_type: string;
    minimum_salary: number | null;
    maximum_salary: number | null;
  };

  interview: {
    id: number;
    title: string;
    applicant_email: string;
    starts_at: string;
    ends_at: string;
    meet_link: string | null;
  } | null;
};

/* ---------------- Helpers ---------------- */

function formatInterviewTime(startsAt: string, endsAt: string) {
  const start = new Date(startsAt);
  const end = new Date(endsAt);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return `${formatDateTime(startsAt)} - ${formatDateTime(endsAt)}`;
  }

  const date = start.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  const startTime = start.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });

  const endTime = end.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });

  return `${date} · ${startTime} - ${endTime}`;
}

function formatDate(input?: string) {
  if (!input) return "";

  const d = new Date(input);

  if (Number.isNaN(d.getTime())) {
    return input;
  }

  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatDateTime(input?: string) {
  if (!input) return "";

  const d = new Date(input);

  if (Number.isNaN(d.getTime())) {
    return input;
  }

  return d.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatSalary(
  minimumSalary: number | null,
  maximumSalary: number | null,
) {
  if (minimumSalary !== null && maximumSalary !== null) {
    return `₱${minimumSalary.toLocaleString()} – ₱${maximumSalary.toLocaleString()}`;
  }

  if (minimumSalary !== null) {
    return `₱${minimumSalary.toLocaleString()}+`;
  }

  if (maximumSalary !== null) {
    return `Up to ₱${maximumSalary.toLocaleString()}`;
  }

  return "Salary not specified";
}

function buildSteps(currentStatus: string, appliedAt: string): Step[] {
  const status = currentStatus.toLowerCase();

  const steps: Step[] = [
    {
      key: "applied",
      label: "Applied",
      description: "Your application was received by the employer.",
      date: appliedAt,
      status: "completed",
    },
    {
      key: "review",
      label: "Under Review",
      description: "The hiring team is reviewing your application.",
      status: "upcoming",
    },
    {
      key: "shortlisted",
      label: "Shortlisted",
      description: "You were shortlisted from the initial applicant pool.",
      status: "upcoming",
    },
    {
      key: "interview",
      label: "Interview",
      description: "Your application has reached the interview stage.",
      status: "upcoming",
    },
    {
      key: "completed",
      label: "Completed",
      description: "The application process has been completed.",
      status: "upcoming",
    },
  ];

  if (status === "rejected") {
    return [
      steps[0],
      {
        key: "review",
        label: "Under Review",
        description: "The hiring team reviewed your application.",
        status: "completed",
      },
      {
        key: "rejected",
        label: "Rejected",
        description: "Your application was not selected to proceed further.",
        status: "rejected",
      },
    ];
  }

  const statusPosition: Record<string, number> = {
    pending: 1,
    shortlisted: 2,
    interview: 3,
    completed: 4,
  };

  const currentPosition = statusPosition[status] ?? 0;

  return steps.map((step, index) => {
    const position = index;

    if (position < currentPosition) {
      return {
        ...step,
        status: "completed",
      };
    }

    if (position === currentPosition) {
      return {
        ...step,
        status: "current",
      };
    }

    return {
      ...step,
      status: "upcoming",
    };
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
              <div className="flex items-center">
                <StepDot status={step.status} />

                {!isLast && (
                  <div
                    aria-hidden="true"
                    className={`mx-2 h-0 flex-1 border-t-2 ${
                      solid
                        ? "border-emerald-600"
                        : "border-dashed border-zinc-200"
                    }`}
                  />
                )}
              </div>

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

function MetaItem({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
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

export default function ApplicationTracker() {
  const navigate = useNavigate();
  const { applicationId } = useParams<{
    applicationId: string;
  }>();

  const [data, setData] = useState<ApplicationTrackerResponse | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [menuOpen, setMenuOpen] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);

  /*
   * Fetch application tracking information
   */
  useEffect(() => {
    const fetchTracking = async () => {
      if (!applicationId) {
        setError("Application ID is missing.");
        setLoading(false);
        return;
      }

      const token = localStorage.getItem("token");

      if (!token) {
        setError("You are not authenticated.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const response = await applicantsMyJobService.fetchApplicationTracking(
          Number(applicationId),
          token,
        );

        setData(response.data);
      } catch (err) {
        console.error("Failed to load application tracking:", err);

        setError("Unable to load the application details.");
      } finally {
        setLoading(false);
      }
    };

    fetchTracking();
  }, [applicationId]);

  /*
   * Close menu when clicking outside or pressing Escape
   */
  useEffect(() => {
    if (!menuOpen) return;

    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", onClick);

    document.addEventListener("keydown", onKey);

    return () => {
      document.removeEventListener("mousedown", onClick);

      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  /*
   * Generate timeline from current database status
   */
  const steps = useMemo(() => {
    if (!data) return [];

    return buildSteps(data.current_status, data.applied_at);
  }, [data]);

  const currentStep = useMemo(
    () => steps.find((step) => step.status === "current"),
    [steps],
  );

  /*
   * Loading state
   */
  if (loading) {
    return (
      <div className="flex w-full justify-center px-4 py-8">
        <div className="flex w-full max-w-5xl items-center justify-center rounded-xl border border-zinc-200 bg-white py-20">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-200 border-t-emerald-600" />

            <p className="archivo text-sm text-zinc-500">
              Loading application...
            </p>
          </div>
        </div>
      </div>
    );
  }

  /*
   * Error state
   */
  if (error || !data) {
    return (
      <div className="flex w-full justify-center px-4 py-8">
        <div className="w-full max-w-5xl rounded-xl border border-zinc-200 bg-white p-6">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className={`archivo inline-flex cursor-pointer items-center gap-2 rounded text-sm font-semibold text-zinc-600 transition-colors hover:text-zinc-900 ${focusRing}`}
          >
            <FaArrowLeft size={12} />
            Back to applications
          </button>

          <div className="mt-12 text-center">
            <p className="archivo text-sm font-semibold text-zinc-900">
              Unable to load application
            </p>

            <p className="archivo mt-1 text-sm text-zinc-500">
              {error || "The application could not be found."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const status = data.current_status.toLowerCase();

  const isRejected = status === "rejected";
  const isCompleted = status === "completed";

  const statusPill = isRejected
    ? {
        label: "Rejected",
        cls: "bg-red-50 text-red-700 ring-red-100",
      }
    : isCompleted
      ? {
          label: "Completed",
          cls: "bg-emerald-50 text-emerald-800 ring-emerald-100",
        }
      : {
          label: data.current_status,
          cls: "bg-emerald-50 text-emerald-800 ring-emerald-100",
        };

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
                Applied {formatDateTime(data.applied_at)}
                {" · "}
                Application #{data.application_id}
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
            <MetaItem icon={<FaBuilding size={12} />}>
              {data.job.company}
            </MetaItem>

            <MetaItem icon={<FaMapMarkerAlt size={12} />}>
              {data.job.location}
            </MetaItem>

            <MetaItem icon={<FaBriefcase size={12} />}>
              {data.job.employment_type}
            </MetaItem>

            <MetaItem icon={<FaMoneyBillWave size={12} />}>
              {formatSalary(data.job.minimum_salary, data.job.maximum_salary)}
            </MetaItem>
          </div>

          {/* Stepper */}

          <div className="mt-8">
            <Stepper steps={steps} />
          </div>

          {/* Actions */}

          <div className="mt-8 flex items-center gap-2 border-t border-zinc-100 pt-5">
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
          {data.interview ? (
            <InfoCard title="What's next">
              <p className="archivo text-sm font-semibold text-zinc-900">
                Interview
              </p>

              <p className="archivo mt-1 text-sm leading-relaxed text-zinc-600">
                {data.interview.title || "Your interview has been scheduled."}
              </p>

              <div className="mt-4 space-y-2">
                <div>
                  <p className="archivo text-xs font-semibold text-zinc-500">
                    Date and time
                  </p>

                  <p className="archivo mt-1 text-sm font-semibold text-zinc-900">
                    {formatInterviewTime(
                      data.interview.starts_at,
                      data.interview.ends_at,
                    )}
                  </p>
                </div>

                {data.interview.meet_link && (
                  <a
                    href={data.interview.meet_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`archivo mt-3 inline-flex items-center rounded-lg bg-emerald-700 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-800 ${focusRing}`}
                  >
                    Join Google Meet
                  </a>
                )}
              </div>
            </InfoCard>
          ) : currentStep ? (
            <InfoCard title="What's next">
              <p className="archivo text-sm font-semibold text-zinc-900">
                {currentStep.label}
              </p>

              <p className="archivo mt-1 text-sm leading-relaxed text-zinc-600">
                {currentStep.description}
              </p>

              {currentStep.date && (
                <p className="archivo mt-3 inline-block rounded-md bg-zinc-100 px-2 py-1 text-xs font-semibold text-zinc-700">
                  {formatDate(currentStep.date)}
                </p>
              )}
            </InfoCard>
          ) : null}

          <InfoCard title="Application">
            <p className="archivo text-sm text-zinc-600">
              Application #
              <span className="font-semibold text-zinc-900">
                {data.application_id}
              </span>
            </p>

            <p className="archivo mt-2 text-sm text-zinc-600">
              Submitted{" "}
              <span className="font-semibold text-zinc-900">
                {formatDate(data.applied_at)}
              </span>
            </p>

            <p className="archivo mt-2 text-sm text-zinc-600">
              Current status{" "}
              <span className="font-semibold capitalize text-zinc-900">
                {data.current_status}
              </span>
            </p>
          </InfoCard>

          {isRejected && (
            <InfoCard title="Application status">
              <p className="archivo text-sm leading-relaxed text-zinc-600">
                Your application was not selected to proceed further.
              </p>
            </InfoCard>
          )}

          {isCompleted && (
            <InfoCard title="Application status">
              <p className="archivo text-sm leading-relaxed text-zinc-600">
                The application process has been completed.
              </p>
            </InfoCard>
          )}
        </div>
      </div>
    </div>
  );
}
