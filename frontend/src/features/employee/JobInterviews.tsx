import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { applicantScreeningService } from "../../service/api/employee/applicantScreeningService";
import {
  FaChevronLeft,
  FaChevronRight,
  FaVideo,
  FaRegCopy,
  FaCheck,
} from "react-icons/fa";

/* ---------------------------------- types ---------------------------------- */

type Interview = {
  id: number;
  application_id: number;
  applicant_id?: number | string | null;
  applicant_name: string;
  applicant_email: string | null;
  title: string | null;
  meet_link: string | null;
  starts_at: string; // ISO
  ends_at: string; // ISO
};

type Filter = "upcoming" | "past" | "all";
type Phase = "live" | "upcoming" | "past";

/* ------------------------------- data loading ------------------------------- */

// Flip to false once the backend endpoint exists.
const USE_MOCK = false;

async function fetchInterviews(_jobId: string | null): Promise<Interview[]> {
  const res = await applicantScreeningService.getInterviews();
  return res.data?.data ?? [];
}

/* -------------------------------- date helpers -------------------------------- */

const TZ = "Asia/Manila";
const pad = (n: number) => String(n).padStart(2, "0");

const dayFmt = new Intl.DateTimeFormat("en-CA", {
  timeZone: TZ,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

// "2026-10-16" in Manila time, whatever the browser's timezone is
const dayKey = (d: Date) => dayFmt.format(d);

const fmtTime = (d: Date) =>
  d.toLocaleTimeString("en-PH", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: TZ,
  });

// Day keys are plain calendar dates, so format them in UTC to avoid any shifting
const keyToDate = (key: string) => new Date(`${key}T12:00:00Z`);

const fmtDayLabel = (key: string) =>
  keyToDate(key).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });

const addDaysToKey = (key: string, n: number) => {
  const d = keyToDate(key);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
};

const cellKey = (y: number, m: number, d: number) =>
  `${y}-${pad(m + 1)}-${pad(d)}`;

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const phaseOf = (iv: Interview, now: Date): Phase => {
  const s = new Date(iv.starts_at).getTime();
  const e = new Date(iv.ends_at).getTime();
  const t = now.getTime();
  if (t >= e) return "past";
  if (t >= s) return "live";
  return "upcoming";
};

/* ---------------------------------- mock data ---------------------------------- */

function buildMock(): Interview[] {
  const today = dayKey(new Date());
  const base = new Date(`${today}T00:00:00+08:00`).getTime();
  const at = (dayOffset: number, hh: number, mm: number, mins: number) => {
    const s = base + dayOffset * 86_400_000 + (hh * 60 + mm) * 60_000;
    return {
      starts_at: new Date(s).toISOString(),
      ends_at: new Date(s + mins * 60_000).toISOString(),
    };
  };

  const rows: [number, number, number, number, string, string][] = [
    [-6, 10, 0, 30, "Maria Santos", "Technical screen"],
    [-2, 14, 0, 45, "Carlo Reyes", "Interview"],
    [0, 9, 0, 30, "Joshua Vergara", "Interview: Full Stack Intern"],
    [0, 15, 30, 60, "Angela Cruz", "Final interview"],
    [1, 11, 0, 30, "Miguel Tan", "Interview"],
    [3, 13, 0, 45, "Bea Lim", "Technical interview"],
    [3, 16, 0, 30, "Paolo Garcia", "Interview"],
    [7, 10, 0, 60, "Denise Ramos", "Panel interview"],
    [12, 14, 30, 30, "Ivan Dela Cruz", "Interview"],
  ];

  return rows.map(([d, h, m, mins, name, title], i) => ({
    id: i + 1,
    application_id: 100 + i,
    applicant_id: 200 + i,
    applicant_name: name,
    applicant_email: `${name.toLowerCase().replace(/\s+/g, ".")}@example.com`,
    title,
    meet_link: `https://meet.google.com/abc-${pad(i)}-xyz`,
    ...at(d, h, m, mins),
  }));
}

/* ---------------------------------- styles ---------------------------------- */

const focusRing =
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#991B1B] focus-visible:ring-offset-2";

const btnBase = `inline-flex h-9 items-center justify-center gap-2 rounded-md px-3 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${focusRing}`;
const btnPrimary = `${btnBase} bg-[#991B1B] text-white hover:bg-[#7F1616]`;
const btnSecondary = `${btnBase} border border-[#D9D6CE] bg-white text-[#1C2321] hover:bg-[#FAF9F6]`;

const PHASE_BADGE: Record<Phase, { label: string; cls: string }> = {
  live: {
    label: "Happening now",
    cls: "bg-emerald-50 text-emerald-800 ring-emerald-100",
  },
  upcoming: {
    label: "Upcoming",
    cls: "bg-[#991B1B]/10 text-[#991B1B] ring-[#991B1B]/10",
  },
  past: { label: "Done", cls: "bg-[#EFEDE7] text-[#6B6F76] ring-[#E3E0D8]" },
};

/* ---------------------------------- parts ---------------------------------- */

function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded bg-[#E8E6E0] motion-reduce:animate-none ${className}`}
    />
  );
}

function InterviewRow({
  iv,
  phase,
  copied,
  onCopy,
}: {
  iv: Interview;
  phase: Phase;
  copied: boolean;
  onCopy: () => void;
}) {
  const start = new Date(iv.starts_at);
  const end = new Date(iv.ends_at);
  const badge = PHASE_BADGE[phase];

  return (
    <li
      className={`flex flex-col gap-3 rounded-lg border bg-white p-4 sm:flex-row sm:items-center sm:gap-4 ${
        phase === "live" ? "border-emerald-200" : "border-[#E3E0D8]"
      } ${phase === "past" ? "opacity-75" : ""}`}
    >
      <div className="shrink-0 sm:w-24">
        <p className="text-sm font-bold">{fmtTime(start)}</p>
        <p className="text-xs text-[#6B6F76]">to {fmtTime(end)}</p>
      </div>

      <div
        className="hidden h-10 w-px bg-[#E3E0D8] sm:block"
        aria-hidden="true"
      />

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="truncate text-sm font-bold">{iv.applicant_name}</p>
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-semibold ring-1 ring-inset ${badge.cls}`}
          >
            {badge.label}
          </span>
        </div>
        <p className="mt-0.5 truncate text-xs text-[#6B6F76]">
          {iv.title || "Interview"}
          {iv.applicant_email ? ` · ${iv.applicant_email}` : ""}
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {iv.meet_link ? (
          <>
            <button
              type="button"
              onClick={onCopy}
              aria-label={
                copied
                  ? "Link copied"
                  : `Copy Meet link for ${iv.applicant_name}`
              }
              className={`${btnSecondary} w-9 px-0`}
            >
              {copied ? <FaCheck size={12} /> : <FaRegCopy size={12} />}
            </button>
            {phase !== "past" && (
              <a
                href={iv.meet_link}
                target="_blank"
                rel="noreferrer"
                className={btnPrimary}
              >
                <FaVideo size={12} aria-hidden="true" />
                {phase === "live" ? "Join now" : "Open Meet"}
              </a>
            )}
          </>
        ) : (
          <span className="text-xs text-[#6B6F76]">No Meet link</span>
        )}
      </div>
    </li>
  );
}

/* ---------------------------------- component ---------------------------------- */

export default function JobInterviews() {
  const [searchParams] = useSearchParams();
  const jobId = searchParams.get("job_id");

  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [now, setNow] = useState(() => new Date());
  const todayKey = dayKey(now);

  const [view, setView] = useState(() => {
    const [y, m] = dayKey(new Date()).split("-").map(Number);
    return { y, m: m - 1 };
  });
  const [selected, setSelected] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("upcoming");
  const [copiedId, setCopiedId] = useState<number | null>(null);

  /* load */
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchInterviews(jobId)
      .then((rows) => {
        if (!cancelled) setInterviews(rows);
      })
      .catch((err) => {
        console.error("Load interviews failed", err);
        if (!cancelled)
          setError("Could not load interviews. Please refresh and try again.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [jobId]);

  /* keep "happening now" fresh */
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(t);
  }, []);

  /* derived */
  const sorted = useMemo(
    () =>
      [...interviews].sort(
        (a, b) => +new Date(a.starts_at) - +new Date(b.starts_at),
      ),
    [interviews],
  );

  const byDay = useMemo(() => {
    const map: Record<string, Interview[]> = {};
    for (const iv of sorted) {
      const k = dayKey(new Date(iv.starts_at));
      (map[k] ??= []).push(iv);
    }
    return map;
  }, [sorted]);

  const counts = useMemo(() => {
    let upcoming = 0;
    let past = 0;
    for (const iv of sorted) {
      if (phaseOf(iv, now) === "past") past++;
      else upcoming++;
    }
    return { upcoming, past, all: sorted.length };
  }, [sorted, now]);

  const visible = useMemo(() => {
    if (selected) return byDay[selected] ?? [];

    if (filter === "upcoming")
      return sorted.filter((iv) => phaseOf(iv, now) !== "past");
    if (filter === "past")
      return sorted.filter((iv) => phaseOf(iv, now) === "past").reverse();
    return sorted;
  }, [selected, filter, byDay, sorted, now]);

  const groups = useMemo(() => {
    const out: { key: string; items: Interview[] }[] = [];
    for (const iv of visible) {
      const k = dayKey(new Date(iv.starts_at));
      const last = out[out.length - 1];
      if (last && last.key === k) last.items.push(iv);
      else out.push({ key: k, items: [iv] });
    }
    return out;
  }, [visible]);

  const groupLabel = (key: string) => {
    if (key === todayKey) return "Today";
    if (key === addDaysToKey(todayKey, 1)) return "Tomorrow";
    if (key === addDaysToKey(todayKey, -1)) return "Yesterday";
    return fmtDayLabel(key);
  };

  /* calendar grid */
  const monthLabel = new Date(Date.UTC(view.y, view.m, 1)).toLocaleDateString(
    "en-US",
    {
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    },
  );
  const firstWeekday = new Date(Date.UTC(view.y, view.m, 1)).getUTCDay();
  const daysInMonth = new Date(Date.UTC(view.y, view.m + 1, 0)).getUTCDate();
  const monthPrefix = `${view.y}-${pad(view.m + 1)}-`;
  const monthCount = sorted.filter((iv) =>
    dayKey(new Date(iv.starts_at)).startsWith(monthPrefix),
  ).length;

  const shiftMonth = (delta: number) =>
    setView(({ y, m }) => {
      const d = new Date(Date.UTC(y, m + delta, 1));
      return { y: d.getUTCFullYear(), m: d.getUTCMonth() };
    });

  const goToday = () => {
    const [y, m] = todayKey.split("-").map(Number);
    setView({ y, m: m - 1 });
    setSelected(todayKey);
  };

  const copyLink = async (iv: Interview) => {
    if (!iv.meet_link) return;
    try {
      await navigator.clipboard.writeText(iv.meet_link);
      setCopiedId(iv.id);
      setTimeout(() => setCopiedId((c) => (c === iv.id ? null : c)), 2000);
    } catch {
      // Clipboard unavailable
    }
  };

  /* ------------------------------- loading / error ------------------------------- */

  if (loading) {
    return (
      <div
        className="archivo mx-auto w-full max-w-6xl"
        role="status"
        aria-label="Loading interviews"
      >
        <Skeleton className="h-7 w-40" />
        <Skeleton className="mt-2 h-4 w-64" />
        <div className="mt-6 grid gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">
          <Skeleton className="h-96" />
          <div className="flex flex-col gap-3">
            <Skeleton className="h-9 w-72" />
            <Skeleton className="h-20" />
            <Skeleton className="h-20" />
            <Skeleton className="h-20" />
          </div>
        </div>
        <span className="sr-only">Loading…</span>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="archivo rounded-md border border-[#991B1B]/30 bg-[#991B1B]/5 p-4 text-sm text-[#991B1B]"
        role="alert"
      >
        {error}
      </div>
    );
  }

  /* ----------------------------------- UI ----------------------------------- */

  const FILTERS: { key: Filter; label: string }[] = [
    { key: "upcoming", label: "Upcoming" },
    { key: "past", label: "Past" },
    { key: "all", label: "All" },
  ];

  return (
    <section
      className="archivo mx-auto w-full max-w-6xl text-[#1C2321]"
      aria-labelledby="ji-heading"
    >
      {/* HEADER */}
      <header className="mb-6">
        <h2 id="ji-heading" className="text-2xl font-bold leading-tight">
          Interviews
        </h2>
        <p className="mt-1 text-sm text-[#6B6F76]">
          {counts.upcoming === 0
            ? "No upcoming interviews."
            : `${counts.upcoming} upcoming ${counts.upcoming === 1 ? "interview" : "interviews"}. Times are in Philippine Time.`}
        </p>
      </header>

      <div className="grid items-start gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">
        {/* CALENDAR */}
        <div className="rounded-lg border border-[#E3E0D8] bg-white p-4 lg:sticky lg:top-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold" aria-live="polite">
              {monthLabel}
            </h3>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => shiftMonth(-1)}
                aria-label="Previous month"
                className={`${btnSecondary} w-8 px-0`}
              >
                <FaChevronLeft size={10} />
              </button>
              <button
                type="button"
                onClick={goToday}
                className={`${btnSecondary} h-8 px-3 text-xs`}
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => shiftMonth(1)}
                aria-label="Next month"
                className={`${btnSecondary} w-8 px-0`}
              >
                <FaChevronRight size={10} />
              </button>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-7 text-center text-xs font-semibold text-[#9A9EA5]">
            {WEEKDAYS.map((w) => (
              <div key={w} className="py-1">
                {w}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-y-1">
            {Array.from({ length: firstWeekday }).map((_, i) => (
              <div key={`b${i}`} />
            ))}

            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((d) => {
              const key = cellKey(view.y, view.m, d);
              const items = byDay[key] ?? [];
              const isToday = key === todayKey;
              const isSelected = key === selected;

              return (
                <button
                  key={key}
                  type="button"
                  aria-pressed={isSelected}
                  aria-label={`${fmtDayLabel(key)}, ${
                    items.length === 0
                      ? "no interviews"
                      : `${items.length} ${items.length === 1 ? "interview" : "interviews"}`
                  }`}
                  onClick={() => setSelected(isSelected ? null : key)}
                  className={`relative mx-auto flex h-11 w-11 flex-col items-center justify-center rounded-md text-sm transition-colors ${focusRing} ${
                    isSelected
                      ? "bg-[#991B1B] font-bold text-white"
                      : isToday
                        ? "bg-[#991B1B]/10 font-bold text-[#991B1B] hover:bg-[#991B1B]/15"
                        : "text-[#1C2321] hover:bg-[#F3F1EC]"
                  }`}
                >
                  {d}
                  {items.length > 0 && (
                    <span className="mt-0.5 flex gap-0.5" aria-hidden="true">
                      {items.slice(0, 3).map((_, i) => (
                        <span
                          key={i}
                          className={`h-1 w-1 rounded-full ${isSelected ? "bg-white" : "bg-[#991B1B]"}`}
                        />
                      ))}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <p className="mt-4 border-t border-[#EFEDE7] pt-3 text-xs text-[#6B6F76]">
            {monthCount === 0
              ? `No interviews in ${monthLabel}.`
              : `${monthCount} ${monthCount === 1 ? "interview" : "interviews"} in ${monthLabel}.`}
          </p>
        </div>

        {/* LIST */}
        <div className="min-w-0">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            {selected ? (
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold">{fmtDayLabel(selected)}</h3>
                <button
                  type="button"
                  onClick={() => setSelected(null)}
                  className={`rounded text-sm font-semibold text-[#991B1B] underline-offset-2 hover:underline ${focusRing}`}
                >
                  Show all
                </button>
              </div>
            ) : (
              <div
                className="inline-flex overflow-hidden rounded-md border border-[#D9D6CE]"
                role="group"
                aria-label="Filter interviews"
              >
                {FILTERS.map((f, i) => (
                  <button
                    key={f.key}
                    type="button"
                    aria-pressed={filter === f.key}
                    onClick={() => setFilter(f.key)}
                    className={`h-9 px-4 text-sm font-medium transition-colors ${
                      i > 0 ? "border-l border-[#D9D6CE]" : ""
                    } ${focusRing} focus-visible:ring-offset-0 focus-visible:ring-inset ${
                      filter === f.key
                        ? "bg-[#991B1B] text-white"
                        : "bg-white text-[#1C2321] hover:bg-[#FAF9F6]"
                    }`}
                  >
                    {f.label}
                    <span
                      className={`ml-1.5 text-xs ${filter === f.key ? "opacity-80" : "text-[#9A9EA5]"}`}
                    >
                      {counts[f.key]}
                    </span>
                  </button>
                ))}
              </div>
            )}

            <p className="text-xs text-[#6B6F76]">
              {visible.length} {visible.length === 1 ? "meeting" : "meetings"}
            </p>
          </div>

          {groups.length === 0 ? (
            <div className="rounded-lg border border-dashed border-[#D9D6CE] bg-[#FAF9F6] px-6 py-12 text-center">
              <p className="text-sm font-bold">
                {selected
                  ? "Nothing scheduled this day"
                  : "No interviews to show"}
              </p>
              <p className="mx-auto mt-1 max-w-xs text-sm text-[#6B6F76]">
                {selected
                  ? "Pick another date on the calendar, or show all meetings."
                  : filter === "upcoming"
                    ? "Meetings you schedule from an applicant's Interview tab will appear here."
                    : "Nothing matches this filter yet."}
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {groups.map((g) => (
                <div key={g.key}>
                  {!selected && (
                    <h4 className="mb-2 flex items-center gap-2 text-sm font-bold">
                      {groupLabel(g.key)}
                      {groupLabel(g.key) !== fmtDayLabel(g.key) && (
                        <span className="text-xs font-normal text-[#6B6F76]">
                          {fmtDayLabel(g.key)}
                        </span>
                      )}
                    </h4>
                  )}
                  <ul className="flex flex-col gap-2">
                    {g.items.map((iv) => (
                      <InterviewRow
                        key={iv.id}
                        iv={iv}
                        phase={phaseOf(iv, now)}
                        copied={copiedId === iv.id}
                        onCopy={() => copyLink(iv)}
                      />
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
