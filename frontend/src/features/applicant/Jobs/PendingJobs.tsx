import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowRight } from "react-icons/fa6";

import ApplicationCard from "../../../components/common/ApplicationCard";
import { applicantsMyJobService } from "../../../service/api/applicants/applicantsMyJobsService";

const JOB_WALL_PATH = "/applicant/job_wall";
// Where "View and manage details" goes (change to your route)
const applicationDetailPath = (id: number) => `/applicant/my-jobs/${id}`;

type PendingJob = {
  id: number; // application_id (not job_id)
  job_id: number;
  job_title: string;
  applied_at: string; // ISO date
};

// Shape returned by GET /applicant/my-jobs/pending
type PendingResponse = {
  applications?: {
    application_id: number;
    job_id: number;
    date_applied: string;
    job_listing: { job_title: string } | null;
  }[];
};

function toPendingJobs(raw: PendingResponse | null): PendingJob[] {
  return (raw?.applications ?? []).map((a) => ({
    id: a.application_id,
    job_id: a.job_id,
    // job_listing can be null if the listing was deleted
    job_title: a.job_listing?.job_title ?? "Job no longer available",
    applied_at: a.date_applied,
  }));
}

// Browser window with a bookmark ribbon, on a blush backdrop
function EmptyIllustration() {
  return (
    <svg
      viewBox="0 0 340 230"
      role="img"
      aria-label="A browser window with a bookmark ribbon"
      className="w-full max-w-[180px] h-auto"
    >
      {/* Backdrop */}
      <polygon points="2,230 24,88 66,76 310,2 338,230" fill="#fecdd3" />

      {/* Window */}
      <rect x="66" y="48" width="213" height="182" fill="#ffffff" />
      <rect x="66" y="48" width="213" height="32" fill="#7f1d1d" />
      <circle cx="84" cy="64" r="5.5" fill="#fecaca" />
      <circle cx="102" cy="64" r="5.5" fill="#fecaca" />
      <circle cx="120" cy="64" r="5.5" fill="#fecaca" />

      {/* Text lines */}
      <rect x="84" y="122" width="90" height="9" fill="#991b1b" />
      <rect x="84" y="144" width="52" height="9" fill="#991b1b" />
      <rect x="84" y="164" width="60" height="9" fill="#991b1b" />

      {/* Bookmark ribbon */}
      <polygon
        points="214,80 256,80 256,176 235,156 214,176"
        fill="#dc2626"
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

export default function PendingJobs() {
  const navigate = useNavigate();
  const [showHelp, setShowHelp] = useState(false);

  const [pendingJobs, setPendingJobs] = useState<PendingJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  const loadPendingJobs = async (isCancelled: () => boolean = () => false) => {
    try {
      setLoading(true);
      setLoadError(false);
      const token = localStorage.getItem("token") ?? "";
      const res = await applicantsMyJobService.fetchPendingJobs(token);
      if (!isCancelled()) setPendingJobs(toPendingJobs(res.data));
    } catch (err) {
      console.error(err);
      if (!isCancelled()) setLoadError(true);
    } finally {
      if (!isCancelled()) setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    loadPendingJobs(() => cancelled);
    return () => {
      cancelled = true;
    };
  }, []);

  const handleWithdraw = (id: number) => {
    // TODO: needs a backend endpoint (e.g. DELETE /applicant/my-jobs/{id}),
    // plus an "Are you sure?" step before calling it.
    console.log("withdraw", id);
  };

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
          onClick={() => loadPendingJobs()}
          className="archivo mt-3 h-10 px-6 rounded-xl bg-red-700 text-white text-sm font-bold hover:bg-red-800 transition-colors cursor-pointer"
        >
          Try again
        </button>
      </div>
    );
  }

  if (pendingJobs.length > 0) {
    return (
      <div className="w-full px-4 py-2">
        {pendingJobs.map((job) => (
          <ApplicationCard
            key={job.id}
            jobTitle={job.job_title}
            appliedAt={job.applied_at}
            onView={() => navigate(applicationDetailPath(job.id))}
            onWithdraw={() => handleWithdraw(job.id)}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col items-center text-center px-4 py-6">
      <EmptyIllustration />

      <h2 className="archivo mt-4 text-base font-bold text-zinc-900">
        No pending applications
      </h2>
      <p className="archivo mt-1 text-sm text-zinc-500 max-w-xs">
        Jobs you've applied to and haven't heard back on appear here.
      </p>

      <button
        type="button"
        aria-expanded={showHelp}
        onClick={() => setShowHelp((open) => !open)}
        className="archivo mt-3 text-sm font-bold text-red-700 hover:text-red-800 hover:underline cursor-pointer rounded outline-none focus-visible:ring-2 focus-visible:ring-red-500"
      >
        Not seeing an application?
      </button>

      {showHelp && (
        <p className="archivo mt-1 text-xs text-zinc-600 max-w-xs">
          Applications show up here right after you apply. Once an employer
          reviews one, it moves out of this list.
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