import React from "react";

function Bone({ className = "" }: { className?: string }) {
  return <div className={`bg-zinc-200 rounded animate-pulse ${className}`} />;
}

export default function JobDetailSkeleton() {
  return (
    <div
      className="flex-1 bg-white h-full overflow-hidden rounded-md pb-10"
      role="status"
      aria-busy="true"
      aria-label="Loading job details"
    >
      {/* Banner */}
      <Bone className="w-full h-40 rounded-md" />

      {/* Logo + action buttons */}
      <div className="flex items-center justify-between px-10 mt-5">
        <Bone className="w-12 h-12 rounded-xl" />
        <div className="flex items-center gap-2">
          <Bone className="w-10 h-10 rounded-full" />
          <Bone className="w-10 h-10 rounded-full" />
        </div>
      </div>

      {/* Title, company, posted time */}
      <div className="flex justify-between px-10 mt-5">
        <div className="space-y-2">
          <Bone className="h-5 w-48" />
          <Bone className="h-4 w-36" />
        </div>
        <Bone className="h-4 w-28 self-center" />
      </div>

      {/* Quick facts */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 px-10 mt-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Bone className="h-3 w-16" />
            <Bone className="h-4 w-24" />
          </div>
        ))}
      </div>

      <hr className="mx-10 mt-6 border-zinc-200" />

      {/* Description */}
      <div className="px-10 mt-6 space-y-2">
        <Bone className="h-5 w-32" />
        <Bone className="h-3.5 w-full max-w-prose" />
        <Bone className="h-3.5 w-full max-w-prose" />
        <Bone className="h-3.5 w-4/5 max-w-prose" />
        <Bone className="h-3.5 w-full max-w-prose mt-4" />
        <Bone className="h-3.5 w-2/3 max-w-prose" />
      </div>

      {/* Requirements */}
      <div className="px-10 mt-6 space-y-3">
        <Bone className="h-5 w-28" />
        <div className="space-y-2">
          <Bone className="h-3 w-28" />
          <Bone className="h-4 w-56" />
        </div>
        <div className="space-y-2">
          <Bone className="h-3 w-20" />
          <Bone className="h-4 w-72 max-w-full" />
        </div>
      </div>

      {/* Screening questions */}
      <div className="px-10 mt-6 space-y-2">
        <Bone className="h-5 w-40" />
        <Bone className="h-3.5 w-64 max-w-full" />
        <Bone className="h-4 w-full max-w-md" />
        <Bone className="h-4 w-5/6 max-w-md" />
        <Bone className="h-4 w-3/4 max-w-md" />
      </div>

      {/* Apply button */}
      <div className="px-10 mt-8">
        <Bone className="h-10 w-32 rounded-md" />
      </div>

      <span className="sr-only">Loading…</span>
    </div>
  );
}
