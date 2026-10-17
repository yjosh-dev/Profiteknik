import { useMemo, useState } from "react";
import {
  MdSearch,
  MdClose,
  MdFilterList,
  MdSort,
  MdKeyboardArrowDown,
} from "react-icons/md";

/* =========================================================
   TYPES
========================================================= */

export interface ApplicationRow {
  applicant_id: number;
  application_id: number;
  first_name?: string | null;
  last_name?: string | null;
  email?: string | null;
  status?: string | null;
  date_applied?: string | null; // "YYYY-MM-DD"
  [key: string]: any;
}

export type SortKey =
  | "default"
  | "newest"
  | "oldest"
  | "name_asc"
  | "name_desc"
  | "status";

export interface Filters {
  search: string;
  statuses: string[]; // lowercase
  dateFrom: string; // "YYYY-MM-DD" or ""
  dateTo: string;
  sort: SortKey;
}

export interface StatusOption {
  value: string;
  count: number;
}

const EMPTY_FILTERS: Filters = {
  search: "",
  statuses: [],
  dateFrom: "",
  dateTo: "",
  sort: "default",
};

const SORT_LABELS: Record<SortKey, string> = {
  default: "Default order",
  newest: "Newest first",
  oldest: "Oldest first",
  name_asc: "Name A to Z",
  name_desc: "Name Z to A",
  status: "Status",
};

/* =========================================================
   HELPERS
========================================================= */

const fullName = (a: ApplicationRow) =>
  [a.first_name, a.last_name].filter(Boolean).join(" ");

const toISO = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

const daysAgo = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return toISO(d);
};

const formatDay = (iso: string) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

const statusTone = (status: string) => {
  switch (status) {
    case "shortlisted":
      return {
        idle: "border-emerald-200 text-emerald-700 hover:bg-emerald-50",
        on: "border-emerald-600 bg-emerald-600 text-white",
      };
    case "pending":
    case "under review":
      return {
        idle: "border-amber-200 text-amber-700 hover:bg-amber-50",
        on: "border-amber-500 bg-amber-500 text-white",
      };
    case "rejected":
      return {
        idle: "border-rose-200 text-rose-700 hover:bg-rose-50",
        on: "border-rose-600 bg-rose-600 text-white",
      };
    default:
      return {
        idle: "border-[#D8D5CD] text-[#1C2321] hover:bg-[#FAF9F6]",
        on: "border-[#1C2321] bg-[#1C2321] text-white",
      };
  }
};

/* =========================================================
   HOOK
   Filters and sorts the applications on the client.
========================================================= */

export function useApplicationFilters(applications: ApplicationRow[]) {
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);

  const statusOptions = useMemo<StatusOption[]>(() => {
    const counts = new Map<string, number>();
    applications.forEach((a) => {
      const key = (a.status ?? "").toLowerCase();
      if (key) counts.set(key, (counts.get(key) ?? 0) + 1);
    });
    return [...counts.entries()]
      .map(([value, count]) => ({ value, count }))
      .sort((a, b) => a.value.localeCompare(b.value));
  }, [applications]);

  const filtered = useMemo(() => {
    const tokens = filters.search.toLowerCase().split(/\s+/).filter(Boolean);

    const rows = applications.filter((app) => {
      if (tokens.length) {
        const haystack = `${fullName(app)} ${app.email ?? ""}`.toLowerCase();
        if (!tokens.every((t) => haystack.includes(t))) return false;
      }

      if (
        filters.statuses.length &&
        !filters.statuses.includes((app.status ?? "").toLowerCase())
      ) {
        return false;
      }

      const day = (app.date_applied ?? "").slice(0, 10);
      if (filters.dateFrom && (!day || day < filters.dateFrom)) return false;
      if (filters.dateTo && (!day || day > filters.dateTo)) return false;

      return true;
    });

    const byDate = (a: ApplicationRow, b: ApplicationRow) =>
      (a.date_applied ?? "").localeCompare(b.date_applied ?? "");
    const byName = (a: ApplicationRow, b: ApplicationRow) =>
      `${a.last_name ?? ""} ${a.first_name ?? ""}`.localeCompare(
        `${b.last_name ?? ""} ${b.first_name ?? ""}`,
      );

    switch (filters.sort) {
      case "newest":
        return [...rows].sort((a, b) => byDate(b, a));
      case "oldest":
        return [...rows].sort(byDate);
      case "name_asc":
        return [...rows].sort(byName);
      case "name_desc":
        return [...rows].sort((a, b) => byName(b, a));
      case "status":
        return [...rows].sort((a, b) =>
          (a.status ?? "").localeCompare(b.status ?? ""),
        );
      default:
        return rows;
    }
  }, [applications, filters]);

  return {
    filtered,
    // Changes whenever a filter changes (use it to reset pagination)
    filtersKey: JSON.stringify(filters),
    filterProps: {
      filters,
      setFilters,
      statusOptions,
      resultCount: filtered.length,
      totalCount: applications.length,
    },
  };
}

/* =========================================================
   COMPONENT
========================================================= */

interface ApplicationFiltersProps {
  filters: Filters;
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;
  statusOptions: StatusOption[];
  resultCount: number;
  totalCount: number;
}

export default function ApplicationFilters({
  filters,
  setFilters,
  statusOptions,
  resultCount,
  totalCount,
}: ApplicationFiltersProps) {
  const [open, setOpen] = useState(false);

  const update = (patch: Partial<Filters>) =>
    setFilters((prev) => ({ ...prev, ...patch }));

  const toggleStatus = (value: string) =>
    setFilters((prev) => ({
      ...prev,
      statuses: prev.statuses.includes(value)
        ? prev.statuses.filter((s) => s !== value)
        : [...prev.statuses, value],
    }));

  const hasDates = !!(filters.dateFrom || filters.dateTo);
  const advancedCount = filters.statuses.length + (hasDates ? 1 : 0);
  const anyActive = !!filters.search.trim() || advancedCount > 0;

  const today = toISO(new Date());
  const presets = [
    { label: "Today", from: today, to: today },
    { label: "Last 7 days", from: daysAgo(6), to: today },
    { label: "Last 30 days", from: daysAgo(29), to: today },
    {
      label: "This month",
      from: toISO(new Date(new Date().getFullYear(), new Date().getMonth(), 1)),
      to: today,
    },
  ];

  const dateLabel =
    filters.dateFrom && filters.dateTo
      ? `${formatDay(filters.dateFrom)} to ${formatDay(filters.dateTo)}`
      : filters.dateFrom
        ? `From ${formatDay(filters.dateFrom)}`
        : filters.dateTo
          ? `Until ${formatDay(filters.dateTo)}`
          : "";

  const chip =
    "archivo inline-flex items-center gap-1 rounded-full border border-[#E3E0D8] bg-[#FAF9F6] pl-2.5 pr-1.5 py-1 text-[11px] font-medium text-[#1C2321]";
  const chipX =
    "flex h-4 w-4 items-center justify-center rounded-full text-[#6B6F76] transition-colors hover:bg-[#991B1B] hover:text-white";
  const inputClass =
    "archivo h-9 rounded-lg border border-[#D8D5CD] bg-white px-2.5 text-xs text-[#1C2321] focus:outline-none focus:ring-1 focus:ring-[#991B1B]";

  return (
    <div className="mb-3 shrink-0">
      {/* TOP ROW */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Search */}
        <div className="relative min-w-[220px] flex-1">
          <MdSearch
            size={18}
            className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-[#6B6F76]"
          />
          <input
            value={filters.search}
            onChange={(e) => update({ search: e.target.value })}
            onKeyDown={(e) => e.key === "Escape" && update({ search: "" })}
            placeholder="Search by name or email"
            className={`${inputClass} w-full pl-8 pr-8`}
            aria-label="Search applicants"
          />
          {filters.search && (
            <button
              type="button"
              onClick={() => update({ search: "" })}
              aria-label="Clear search"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-[#6B6F76] hover:text-[#991B1B]"
            >
              <MdClose size={16} />
            </button>
          )}
        </div>

        {/* Filters toggle */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className={`archivo inline-flex h-9 items-center gap-1.5 rounded-lg border px-3 text-xs font-semibold transition-colors ${
            open || advancedCount > 0
              ? "border-[#991B1B] bg-[#991B1B]/5 text-[#991B1B]"
              : "border-[#D8D5CD] bg-white text-[#1C2321] hover:bg-[#FAF9F6]"
          }`}
        >
          <MdFilterList size={18} />
          Filters
          {advancedCount > 0 && (
            <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-[#991B1B] px-1 text-[10px] font-bold text-white">
              {advancedCount}
            </span>
          )}
          <MdKeyboardArrowDown
            size={18}
            className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          />
        </button>

        {/* Sort */}
        <div className="relative">
          <MdSort
            size={16}
            className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-[#6B6F76]"
          />
          <select
            value={filters.sort}
            onChange={(e) => update({ sort: e.target.value as SortKey })}
            className={`${inputClass} cursor-pointer pl-8 pr-2`}
            aria-label="Sort applicants"
          >
            {(Object.keys(SORT_LABELS) as SortKey[]).map((key) => (
              <option key={key} value={key}>
                {SORT_LABELS[key]}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ADVANCED PANEL (animated open/close) */}
      <div
        className={`grid transition-[grid-template-rows] duration-300 ease-out ${
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">
          <div className="mt-2 grid gap-5 rounded-xl border border-[#E3E0D8] bg-[#FAF9F6] p-4 md:grid-cols-2">
            {/* Status */}
            <div>
              <span className="archivo mb-2 block text-[11px] font-semibold uppercase tracking-wider text-[#6B6F76]">
                Status
              </span>
              {statusOptions.length === 0 ? (
                <p className="archivo text-xs text-[#6B6F76]">
                  No applications to filter yet.
                </p>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {statusOptions.map(({ value, count }) => {
                    const on = filters.statuses.includes(value);
                    const tone = statusTone(value);
                    return (
                      <button
                        key={value}
                        type="button"
                        onClick={() => toggleStatus(value)}
                        aria-pressed={on}
                        className={`archivo inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                          on ? tone.on : `bg-white ${tone.idle}`
                        }`}
                      >
                        {capitalize(value)}
                        <span
                          className={`rounded-full px-1.5 text-[10px] font-bold ${
                            on ? "bg-white/25" : "bg-black/5"
                          }`}
                        >
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Date applied */}
            <div>
              <span className="archivo mb-2 block text-[11px] font-semibold uppercase tracking-wider text-[#6B6F76]">
                Date applied
              </span>

              <div className="flex flex-wrap items-center gap-2">
                <input
                  type="date"
                  value={filters.dateFrom}
                  max={filters.dateTo || undefined}
                  onChange={(e) => update({ dateFrom: e.target.value })}
                  className={inputClass}
                  aria-label="Applied from"
                />
                <span className="archivo text-xs text-[#6B6F76]">to</span>
                <input
                  type="date"
                  value={filters.dateTo}
                  min={filters.dateFrom || undefined}
                  onChange={(e) => update({ dateTo: e.target.value })}
                  className={inputClass}
                  aria-label="Applied until"
                />
              </div>

              <div className="mt-2 flex flex-wrap gap-1.5">
                {presets.map((p) => {
                  const on = filters.dateFrom === p.from && filters.dateTo === p.to;
                  return (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() =>
                        on
                          ? update({ dateFrom: "", dateTo: "" })
                          : update({ dateFrom: p.from, dateTo: p.to })
                      }
                      aria-pressed={on}
                      className={`archivo rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors ${
                        on
                          ? "border-[#991B1B] bg-[#991B1B] text-white"
                          : "border-[#D8D5CD] bg-white text-[#1C2321] hover:bg-white/60"
                      }`}
                    >
                      {p.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ACTIVE FILTERS + RESULT COUNT */}
      <div className="mt-2 flex min-h-6 flex-wrap items-center gap-1.5">
        {filters.search.trim() && (
          <span className={chip}>
            Search: “{filters.search.trim()}”
            <button
              type="button"
              onClick={() => update({ search: "" })}
              aria-label="Remove search filter"
              className={chipX}
            >
              <MdClose size={12} />
            </button>
          </span>
        )}

        {filters.statuses.map((s) => (
          <span key={s} className={chip}>
            {capitalize(s)}
            <button
              type="button"
              onClick={() => toggleStatus(s)}
              aria-label={`Remove ${s} filter`}
              className={chipX}
            >
              <MdClose size={12} />
            </button>
          </span>
        ))}

        {hasDates && (
          <span className={chip}>
            {dateLabel}
            <button
              type="button"
              onClick={() => update({ dateFrom: "", dateTo: "" })}
              aria-label="Remove date filter"
              className={chipX}
            >
              <MdClose size={12} />
            </button>
          </span>
        )}

        {anyActive && (
          <button
            type="button"
            onClick={() => setFilters(EMPTY_FILTERS)}
            className="archivo text-[11px] font-semibold text-[#991B1B] hover:underline"
          >
            Clear all
          </button>
        )}

        <span
          className="archivo ml-auto text-[11px] text-[#6B6F76]"
          aria-live="polite"
        >
          {anyActive
            ? `${resultCount} of ${totalCount} applicant${totalCount === 1 ? "" : "s"}`
            : `${totalCount} applicant${totalCount === 1 ? "" : "s"}`}
        </span>
      </div>
    </div>
  );
}