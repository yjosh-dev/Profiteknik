import React, { useEffect, useState } from "react";

import marbledbg from "../../assets/img/red-marbled-background.jpg";

import { FaShareAlt } from "react-icons/fa";
import { MdBookmarkAdd, MdBookmarkAdded } from "react-icons/md";

import type { JobDetail } from "../../types/JobDetailType";

/* ---------- Types ---------- */

type QualificationStatus = "qualified" | "underqualified" | "overqualified";

export interface JobMatch {
  percentage: number; // 0-100
  status: QualificationStatus;
  breakdown: { label: string; value: number; note: string }[];
}

interface JobDetailPanelProps {
  job: JobDetail;
  isBookmarked?: boolean;
  /** Pass real match data from the backend later. Falls back to mock data. */
  match?: JobMatch;
  onToggleBookmark?: (jobId: number, bookmarked: boolean) => void;
  onShare?: (job: JobDetail) => void;
  onApply?: (job: JobDetail) => void;
}

/* ---------- Helpers ---------- */

const peso = new Intl.NumberFormat("en-PH", {
  style: "currency",
  currency: "PHP",
  maximumFractionDigits: 0,
});

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.max(1, Math.floor(diffMs / 60000));
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString("en-PH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatExperience(years: number): string {
  if (years <= 0) return "No experience required";
  return `${years} year${years === 1 ? "" : "s"}`;
}

/* ---------- Mock match data (replace with API data later) ---------- */

function getMockMatch(job: JobDetail): JobMatch {
  const presets: JobMatch[] = [
    {
      percentage: 86,
      status: "qualified",
      breakdown: [
        { label: "Education", value: 100, note: "Meets requirement" },
        { label: "Experience", value: 85, note: "Within required range" },
        { label: "Skills", value: 74, note: "Most skills matched" },
      ],
    },
    {
      percentage: 48,
      status: "underqualified",
      breakdown: [
        { label: "Education", value: 80, note: "Close to requirement" },
        { label: "Experience", value: 30, note: "Below required years" },
        { label: "Skills", value: 45, note: "Several skills missing" },
      ],
    },
    {
      percentage: 72,
      status: "overqualified",
      breakdown: [
        { label: "Education", value: 100, note: "Exceeds requirement" },
        { label: "Experience", value: 100, note: "Well above required" },
        { label: "Skills", value: 90, note: "Strong skill coverage" },
      ],
    },
  ];
  return presets[job.job_id % presets.length];
}

// Muted, full class strings so Tailwind keeps them
const STATUS_STYLES: Record<
  QualificationStatus,
  { label: string; summary: string; tag: string; bar: string }
> = {
  qualified: {
    label: "Qualified",
    summary: "Your profile lines up well with what this role asks for.",
    tag: "text-emerald-800 bg-emerald-50 border-emerald-200",
    bar: "bg-emerald-600/70",
  },
  underqualified: {
    label: "Underqualified",
    summary:
      "You're missing some required experience or skills. You can still apply.",
    tag: "text-amber-800 bg-amber-50 border-amber-200",
    bar: "bg-amber-600/70",
  },
  overqualified: {
    label: "Overqualified",
    summary: "Your background goes beyond what this role requires.",
    tag: "text-slate-700 bg-slate-100 border-slate-200",
    bar: "bg-slate-500/70",
  },
};

function MatchCard({ match }: { match: JobMatch }) {
  const s = STATUS_STYLES[match.status];

  return (
    <section className="archivo mx-5 mt-5 rounded-lg border border-zinc-200 bg-zinc-50 p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
          Job match
        </p>
        <span
          className={`rounded-md border px-2 py-0.5 text-xs font-medium ${s.tag}`}
        >
          {s.label}
        </span>
      </div>

      <div className="mt-2 flex items-baseline gap-3">
        <span className="text-2xl font-semibold text-zinc-800">
          {match.percentage}%
        </span>
        <p className="text-sm text-zinc-600">{s.summary}</p>
      </div>

      <div className="mt-4 space-y-2.5 border-t border-zinc-200 pt-3">
        {match.breakdown.map((item) => (
          <div key={item.label}>
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-700">{item.label}</span>
              <span className="text-zinc-500">{item.note}</span>
            </div>
            <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-zinc-200">
              <div
                className={`h-full rounded-full ${s.bar}`}
                style={{ width: `${item.value}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ---------- Component ---------- */

export default function JobDetailPanel({
  job,
  isBookmarked = false,
  match,
  onToggleBookmark,
  onShare,
  onApply,
}: JobDetailPanelProps) {
  const [bookmarked, setBookmarked] = useState(isBookmarked);

  // Re-sync when a different job is selected or the parent changes the value
  useEffect(() => {
    setBookmarked(isBookmarked);
  }, [job.job_id, isBookmarked]);

  const handleBookmark = () => {
    const next = !bookmarked;
    setBookmarked(next);
    onToggleBookmark?.(job.job_id, next);
  };

  const requirements = job.requirements;
  const questions = job.screening_questions ?? [];
  const jobMatch = match ?? getMockMatch(job);

  return (
    <div className="flex-1 bg-white h-full overflow-y-auto rounded-md pb-10 transition">
      <img
        src={marbledbg}
        alt=""
        className="w-full h-40 object-cover object-center rounded-md"
      />

      <div className="flex justify-between px-5 mt-5">
        <div className="archivo">
          <p className="font-semibold">{job.job_title}</p>
        </div>
        <div className="archivo flex items-center justify-center">
          <p className="text-sm text-zinc-600">
            Posted {timeAgo(job.posted_at)}
          </p>
        </div>
      </div>

      {/* Match + qualification (mock for now) */}
      {/* Quick facts */}
      <div className="archivo grid grid-cols-3 gap-4 px-5 mt-6">
        <div>
          <p className="text-xs text-zinc-500">Salary</p>
          <p className="text-sm font-medium">
            {peso.format(job.minimum_salary)} –{" "}
            {peso.format(job.maximum_salary)}
          </p>
        </div>
        <div>
          <p className="text-xs text-zinc-500">Employment type</p>
          <p className="text-sm font-medium">{job.employment_type}</p>
        </div>
        <div>
          <p className="text-xs text-zinc-500">Apply until</p>
          <p className="text-sm font-medium">{formatDate(job.posted_until)}</p>
        </div>
        <div>
          <p className="text-xs text-zinc-500">Open positions</p>
          <p className="text-sm font-medium">{job.vacant_position}</p>
        </div>
      </div>

      <hr className="mx-5 mt-6 border-zinc-200" />
      <MatchCard match={jobMatch} />

      {/* Description */}
      <section className="archivo px-5 mt-6">
        <h2 className="font-semibold">About this job</h2>
        <div className="mt-2 space-y-3 text-sm text-zinc-700 leading-relaxed max-w-prose">
          {job.job_description.split("\n\n").map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
        </div>
      </section>

      {/* Requirements */}
      {requirements && (
        <section className="archivo px-5 mt-6">
          <h2 className="font-semibold">Requirements</h2>
          <dl className="mt-2 space-y-3 text-sm">
            <div>
              <dt className="text-zinc-500">Highest education</dt>
              <dd className="text-zinc-700">
                {requirements.highest_education}
              </dd>
            </div>
            <div>
              <dt className="text-zinc-500">Experience</dt>
              <dd className="text-zinc-700">
                {formatExperience(requirements.experience)}
              </dd>
            </div>
          </dl>
        </section>
      )}

      {/* Screening questions */}
      {questions.length > 0 && (
        <section className="archivo px-5 mt-6">
          <h2 className="font-semibold">Screening questions</h2>
          <p className="text-sm text-zinc-600 mt-1">
            You'll be asked to answer these when you apply.
          </p>
          <ul className="mt-2 list-disc pl-5 space-y-1.5 text-sm text-zinc-700">
            {questions.map((q) => (
              <li key={q.question_id}>{q.screening_question}</li>
            ))}
          </ul>
        </section>
      )}

      {/* Apply */}
      <div className="archivo px-5 mt-8">
        <button
          type="button"
          onClick={() => onApply?.(job)}
          className="w-full sm:w-auto px-8 py-2.5 rounded-md bg-red-700 text-white text-sm font-medium hover:bg-red-800 transition-colors cursor-pointer"
        >
          Apply now
        </button>
      </div>
    </div>
  );
}
