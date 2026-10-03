import React, { useEffect, useState } from "react";

import marbledbg from "../../assets/img/red-marbled-background.jpg";

import { FaShareAlt } from "react-icons/fa";
import { MdBookmarkAdd, MdBookmarkAdded } from "react-icons/md";

import type { JobDetail } from "../../types/JobDetailType";

interface JobDetailPanelProps {
  job: JobDetail;
  isBookmarked?: boolean;
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

/* ---------- Component ---------- */

export default function JobDetailPanel({
  job,
  isBookmarked = false,
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

  return (
    <div className="flex-1 bg-white h-full overflow-y-auto rounded-md pb-10 transition">
      <img
        src={marbledbg}
        alt=""
        className="w-full h-40 object-cover object-center rounded-md"
      />

      <div className="flex items-center justify-between px-5 mt-5">
        <div className="w-12 h-12 rounded-xl bg-red-700 shadow-md ring-1 ring-black/5" />
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Share"
            onClick={() => onShare?.(job)}
            className="p-2.5 rounded-full text-zinc-600 hover:bg-red-100 hover:text-red-500 transition-colors cursor-pointer"
          >
            <FaShareAlt size={21} />
          </button>
          <button
            type="button"
            aria-label={bookmarked ? "Remove bookmark" : "Bookmark"}
            aria-pressed={bookmarked}
            onClick={handleBookmark}
            className={`p-2.5 rounded-full hover:bg-red-100 hover:text-red-500 transition-colors cursor-pointer ${
              bookmarked ? "text-red-600" : "text-zinc-600"
            }`}
          >
            {bookmarked ? (
              <MdBookmarkAdded size={21} />
            ) : (
              <MdBookmarkAdd size={21} />
            )}
          </button>
        </div>
      </div>

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
              <dd className="text-zinc-700">{requirements.highest_education}</dd>
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