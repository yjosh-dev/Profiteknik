import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowRight } from "react-icons/fa6";

import ApplicationCard from "../../../components/common/ApplicationCard";
import { applicantsMyJobService } from "../../../service/api/applicants/applicantsMyJobsService";

const JOB_WALL_PATH = "/applicant/job_wall";
const applicationDetailPath = (id: number) => `/applicant/my-jobs/${id}`;

type ShortlistedJob = {
  id: number; // application_id
  job_id: number;
  job_title: string;
  applied_at: string;
};

type ShortlistedResponse = {
  applications?: {
    application_id: number;
    job_id: number;
    date_applied: string;
    job_listing: { job_title: string } | null;
  }[];
};

function toShortlistedJobs(raw: ShortlistedResponse | null): ShortlistedJob[] {
  return (raw?.applications ?? []).map((a) => ({
    id: a.application_id,
    job_id: a.job_id,
    job_title: a.job_listing?.job_title ?? "Job no longer available",
    applied_at: a.date_applied,
  }));
}

function EmptyIllustration() {
  return (
    <svg
      viewBox="0 0 340 230"
      role="img"
      aria-label="A document with a checkmark"
      className="w-full max-w-[180px] h-auto"
    >
      {/* Backdrop */}
      <polygon points="2,230 24,88 66,76 310,2 338,230" fill="#fecdd3" />

      {/* Document */}
      <rect x="80" y="48" width="180" height="182" fill="#ffffff" />
      <rect x="80" y="48" width="180" height="18" fill="#7f1d1d" />

      {/* Text lines */}
      <rect x="100" y="96" width="120" height="9" fill="#991b1b" />
      <rect x="100" y="118" width="90" height="9" fill="#991b1b" />
      <rect x="100" y="140" width="100" height="9" fill="#991b1b" />

      {/* Checkmark badge */}
      <circle cx="230" cy="180" r="34" fill="#dc2626" />
      <polyline
        points="215,180 225,190 245,170"
        fill="none"
        stroke="#ffffff"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SkeletonRow() {
  return (
    <div className="flex items-start gap-4 border-b border-gray-200 px-2 py-4 animate-pulse">
      <div className="w-10 h-10 shrink-0 rounded-lg bg-zinc-200" />
      <div className="flex-1 space-y-2">
        <div className="h-4 w-14 rounded bg-zinc-200" />
        <div className="h-4 w-48 rounded bg-zinc-200" />
        <div className="h-3.5 w-28 rounded bg-zinc-200" />
      </div>
    </div>
  );
}

export default function ShortlistedJobs() {
  const navigate = useNavigate();
  const [showHelp, setShowHelp] = useState(false);

  const [jobs, setJobs] = useState<ShortlistedJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  const loadJobs = async (isCancelled: () => boolean = () => false) => {
    try {
      setLoading(true);
      setLoadError(false);
      const token = localStorage.getItem("token") ?? "";
      const res = await applicantsMyJobService.fetchShortlistedJobs(token);
      if (!isCancelled()) setJobs(toShortlistedJobs(res.data));
    } catch (err) {
      console.error(err);
      if (!isCancelled()) setLoadError(true);
    } finally {
      if (!isCancelled()) setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    loadJobs(() => cancelled);
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="w-full px-4 py-4">
        <SkeletonRow />
        <SkeletonRow />
        <SkeletonRow />
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="w-full flex flex-col items-center text-center px-4 py-8">
        <p className="archivo text-base font-bold text-zinc-900">
          We couldn't load your applications
        </p>
        <button
          type="button"
          onClick={() => loadJobs()}
          className="archivo mt-3 h-10 px-6 rounded-xl bg-red-700 text-white text-sm font-bold hover:bg-red-800 transition-colors cursor-pointer"
        >
          Try again
        </button>
      </div>
    );
  }

  if (jobs.length > 0) {
    return (
      <div className="w-full px-4 py-2">
        {jobs.map((job) => (
          <ApplicationCard
            key={job.id}
            jobTitle={job.job_title}
            appliedAt={job.applied_at}
            onView={() =>
              navigate(`/applicant/my_jobs/track_application/${job.id}`)
            }
            onWithdraw={() => alert()}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col items-center text-center px-4 py-6">
      <EmptyIllustration />

      <h2 className="archivo mt-4 text-base font-bold text-zinc-900">
        No shortlisted applications
      </h2>
      <p className="archivo mt-1 text-sm text-zinc-500 max-w-xs">
        Employers who shortlist you will show up here.
      </p>

      <button
        type="button"
        aria-expanded={showHelp}
        onClick={() => setShowHelp((open) => !open)}
        className="archivo mt-3 text-sm font-bold text-red-700 hover:text-red-800 hover:underline cursor-pointer rounded outline-none focus-visible:ring-2 focus-visible:ring-red-500"
      >
        Not seeing a shortlist?
      </button>

      {showHelp && (
        <p className="archivo mt-1 text-xs text-zinc-600 max-w-xs">
          Shortlisting happens after an employer reviews your application. If
          it's been a while, you can follow up from the application details
          page.
        </p>
      )}

      <button
        type="button"
        onClick={() => navigate(JOB_WALL_PATH)}
        className="archivo mt-4 inline-flex items-center gap-2 h-10 px-6 rounded-xl bg-red-700 text-white text-sm font-bold hover:bg-red-800 transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
      >
        Find jobs
        <FaArrowRight size={14} aria-hidden="true" />
      </button>
    </div>
  );
}
