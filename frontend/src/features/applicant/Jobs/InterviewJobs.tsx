import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowRight } from "react-icons/fa6";

import ApplicationCard from "../../../components/common/ApplicationCard";
import { applicantsMyJobService } from "../../../service/api/applicants/applicantsMyJobsService";

const JOB_WALL_PATH = "/applicant/job_wall";
const applicationDetailPath = (id: number) => `/applicant/my-jobs/${id}`;

type InterviewJob = {
  id: number; // application_id
  job_id: number;
  job_title: string;
  applied_at: string;
};

type InterviewResponse = {
  applications?: {
    application_id: number;
    job_id: number;
    date_applied: string;
    job_listing: { job_title: string } | null;
  }[];
};

function toInterviewJobs(raw: InterviewResponse | null): InterviewJob[] {
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
      aria-label="A calendar with a chat bubble"
      className="w-full max-w-[180px] h-auto"
    >
      {/* Backdrop */}
      <polygon points="2,230 24,88 66,76 310,2 338,230" fill="#fecdd3" />

      {/* Calendar */}
      <rect x="70" y="60" width="200" height="170" fill="#ffffff" />
      <rect x="70" y="60" width="200" height="34" fill="#7f1d1d" />
      <circle cx="100" cy="77" r="4" fill="#fecaca" />
      <circle cx="240" cy="77" r="4" fill="#fecaca" />

      {/* Grid dots */}
      <circle cx="105" cy="125" r="5" fill="#991b1b" />
      <circle cx="140" cy="125" r="5" fill="#991b1b" />
      <circle cx="175" cy="125" r="5" fill="#991b1b" />
      <circle cx="210" cy="125" r="5" fill="#991b1b" />
      <circle cx="105" cy="160" r="5" fill="#991b1b" />
      <circle cx="140" cy="160" r="5" fill="#991b1b" />
      <circle cx="175" cy="160" r="5" fill="#991b1b" />
      <circle cx="210" cy="160" r="5" fill="#dc2626" />
      <circle cx="105" cy="195" r="5" fill="#991b1b" />
      <circle cx="140" cy="195" r="5" fill="#991b1b" />

      {/* Chat bubble */}
      <path
        d="M210 180 C210 172 216 166 224 166 L268 166 C276 166 282 172 282 180 L282 200 C282 208 276 214 268 214 L250 214 L240 226 L240 214 L224 214 C216 214 210 208 210 200 Z"
        fill="#dc2626"
      />
      <circle cx="230" cy="190" r="3" fill="#ffffff" />
      <circle cx="246" cy="190" r="3" fill="#ffffff" />
      <circle cx="262" cy="190" r="3" fill="#ffffff" />
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

export default function InterviewJobs() {
  const navigate = useNavigate();
  const [showHelp, setShowHelp] = useState(false);

  const [jobs, setJobs] = useState<InterviewJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  const loadJobs = async (isCancelled: () => boolean = () => false) => {
    try {
      setLoading(true);
      setLoadError(false);
      const token = localStorage.getItem("token") ?? "";
      const res = await applicantsMyJobService.fetchInterviewJobs(token);
      if (!isCancelled()) setJobs(toInterviewJobs(res.data));
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
        No interviews scheduled
      </h2>
      <p className="archivo mt-1 text-sm text-zinc-500 max-w-xs">
        When an employer invites you to an interview, it'll appear here.
      </p>

      <button
        type="button"
        aria-expanded={showHelp}
        onClick={() => setShowHelp((open) => !open)}
        className="archivo mt-3 text-sm font-bold text-red-700 hover:text-red-800 hover:underline cursor-pointer rounded outline-none focus-visible:ring-2 focus-visible:ring-red-500"
      >
        Not seeing an interview?
      </button>

      {showHelp && (
        <p className="archivo mt-1 text-xs text-zinc-600 max-w-xs">
          Interview invites are sent after a shortlist review. Check your email
          and messages — some employers reach out directly.
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
