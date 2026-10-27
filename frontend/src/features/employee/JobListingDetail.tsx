import { useEffect, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

import { jobListingApi } from "../../service/api/employee/jobListingService";
import { JobApplicationService } from "../../service/api/employee/JobApplicationService";
import type { JobListingDetailData } from "../../types/JobListingTypes";

import ApplicationFilters, {
  useApplicationFilters,
} from "../../components/common/ApplicationFilter";

import { IoReturnUpBackSharp } from "react-icons/io5";
import { FaRegEdit } from "react-icons/fa";
import { MdDelete, MdKeyboardArrowDown } from "react-icons/md";

const COLLAPSE_RATIO = 0.6;

const EMPLOYMENT_TYPE_SUGGESTIONS = [
  "Full-time",
  "Part-time",
  "Contract",
  "Internship",
  "Temporary",
];

type EditDraft = {
  job_title: string;
  job_description: string;
  employment_type: string;
  vacant_position: number | "";
  minimum_salary: number | "";
  maximum_salary: number | "";
  posted_at: string; // yyyy-MM-dd
  posted_until: string; // yyyy-MM-dd
  highest_education: string;
  experience: number | "";
};

export default function JobListingDetail() {
  const [jobListingData, setJobListingData] =
    useState<JobListingDetailData>();

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Applications state
  const [applications, setApplications] = useState<any[]>([]);
  const [appsLoading, setAppsLoading] = useState<boolean>(false);
  const [appsError, setAppsError] = useState<string | null>(null);

  // Pagination state for table
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(5);

  // Resize state
  const topInnerRef = useRef<HTMLDivElement>(null);
  const [topOffset, setTopOffset] = useState<number>(0);
  const [naturalTop, setNaturalTop] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [topCollapsed, setTopCollapsed] = useState<boolean>(false);

  // Edit state
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [draft, setDraft] = useState<EditDraft | null>(null);
  const [saving, setSaving] = useState<boolean>(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<
    Record<string, string[]>
  >({});

  const [searchParams] = useSearchParams();
  const job_id = searchParams.get("job_id");

  const navigate = useNavigate();

  /*
  |--------------------------------------------------------------------------
  | Fetch Job Details
  |--------------------------------------------------------------------------
  */

  const fetchJobDetail = async (id: string | null) => {
    if (!id) return;

    try {
      setLoading(true);
      setError(null);

      const response = await jobListingApi.getJobListing(
        Number(id)
      );

      setJobListingData(response.data);
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          "Failed to fetch job details."
      );
    } finally {
      setLoading(false);
    }
  };

  // Refetch without toggling the full-page loading state
  const refreshJobDetail = async (id: string) => {
    const response = await jobListingApi.getJobListing(Number(id));
    setJobListingData(response.data);
  };

  /*
  |--------------------------------------------------------------------------
  | Fetch Applications
  |--------------------------------------------------------------------------
  */

  const fetchApplications = async (id: string | null) => {
    if (!id) return;

    try {
      setAppsLoading(true);
      setAppsError(null);

      const res =
        await JobApplicationService.fetchApplications(id);

      setApplications(res.data);
      setCurrentPage(1);
    } catch (err: any) {
      setAppsError(
        err.response?.data?.message ||
          "Failed to fetch applications."
      );
    } finally {
      setAppsLoading(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Initial Data Fetch
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (job_id) {
      fetchJobDetail(job_id);
      fetchApplications(job_id);
    }
  }, [job_id]);

  /*
  |--------------------------------------------------------------------------
  | Filters
  |--------------------------------------------------------------------------
  */

  const appFilters = useApplicationFilters(applications);

  useEffect(() => {
    setCurrentPage(1);
  }, [appFilters.filtersKey]);

  /*
  |--------------------------------------------------------------------------
  | Resize Handlers
  |--------------------------------------------------------------------------
  */

  const resetTop = () => {
    setTopOffset(0);
    setTopCollapsed(false);
  };

  const startDrag = (
    e: ReactPointerEvent<HTMLDivElement>
  ) => {
    // Layout changes while editing, so dragging is disabled
    if (isEditing) return;

    e.preventDefault();

    const natural =
      topInnerRef.current?.offsetHeight ?? 0;

    if (!natural) return;

    setNaturalTop(natural);
    setIsDragging(true);

    const startY = e.clientY;
    const startOffset = topOffset;

    function onMove(ev: PointerEvent) {
      // Dragging up grows the bottom panel;
      // dragging down shrinks it back.
      const next = Math.max(
        0,
        startOffset + (startY - ev.clientY)
      );

      if (next >= natural * COLLAPSE_RATIO) {
        setTopCollapsed(true);
        setTopOffset(0);
        stop();
        return;
      }

      setTopOffset(next);
    }

    function stop() {
      setIsDragging(false);

      window.removeEventListener(
        "pointermove",
        onMove
      );

      window.removeEventListener(
        "pointerup",
        stop
      );

      window.removeEventListener(
        "pointercancel",
        stop
      );
    }

    window.addEventListener(
      "pointermove",
      onMove
    );

    window.addEventListener(
      "pointerup",
      stop
    );

    window.addEventListener(
      "pointercancel",
      stop
    );
  };

  /*
  |--------------------------------------------------------------------------
  | Edit Handlers
  |--------------------------------------------------------------------------
  */

  const setField = <K extends keyof EditDraft>(
    key: K,
    value: EditDraft[K]
  ) => setDraft((d) => (d ? { ...d, [key]: value } : d));

  const numberOrEmpty = (value: string): number | "" =>
    value === "" ? "" : Number(value);

  const startEdit = () => {
    if (!jobListingData) return;

    // Expand the top panel and clear any drag offset
    resetTop();

    setSaveError(null);
    setFieldErrors({});

    setDraft({
      job_title: jobListingData.job_title ?? "",
      job_description: jobListingData.job_description ?? "",
      employment_type: jobListingData.employment_type ?? "",
      vacant_position: jobListingData.vacant_position ?? "",
      minimum_salary: jobListingData.minimum_salary ?? "",
      maximum_salary: jobListingData.maximum_salary ?? "",
      posted_at: String(jobListingData.posted_at ?? "").slice(0, 10),
      posted_until: String(
        jobListingData.posted_until ?? ""
      ).slice(0, 10),
      highest_education:
        jobListingData.requirements?.highest_education ?? "",
      experience: jobListingData.requirements?.experience ?? "",
    });

    setIsEditing(true);
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setDraft(null);
    setSaveError(null);
    setFieldErrors({});
  };

  const saveEdit = async () => {
    if (!draft || !job_id) return;

    // Quick client-side checks (the server validates too)
    if (!draft.job_title.trim()) {
      setSaveError("Job title is required.");
      return;
    }

    if (
      draft.minimum_salary === "" ||
      draft.maximum_salary === "" ||
      draft.vacant_position === ""
    ) {
      setSaveError(
        "Vacant positions and both salary fields are required."
      );
      return;
    }

    if (Number(draft.minimum_salary) > Number(draft.maximum_salary)) {
      setSaveError("Minimum salary cannot exceed maximum salary.");
      return;
    }

    if (draft.posted_until < draft.posted_at) {
      setSaveError(
        "The 'Until' date cannot be before the posted date."
      );
      return;
    }

    try {
      setSaving(true);
      setSaveError(null);
      setFieldErrors({});

      const { highest_education, experience, ...rest } = draft;

      await jobListingApi.updateJobListing(job_id, {
        ...rest,
        requirements: {
          highest_education,
          experience: experience === "" ? null : experience,
        },
      });

      // Refetch so the page always shows what's actually in the database
      await refreshJobDetail(job_id);

      cancelEdit();
    } catch (err: any) {
      if (err.response?.status === 422) {
        setFieldErrors(err.response.data.errors ?? {});
        setSaveError("Please fix the highlighted fields.");
      } else {
        setSaveError(
          err.response?.data?.message ||
            "Failed to save changes."
        );
      }
    } finally {
      setSaving(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Loading / Error States
  |--------------------------------------------------------------------------
  */

  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center p-12 bg-[#FAF9F6]">
        <span className="archivo text-sm text-[#6B6F76]">
          Loading job details...
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-screen flex items-center justify-center p-12 bg-[#FAF9F6]">
        <span className="archivo text-sm text-[#991B1B]">
          {error}
        </span>
      </div>
    );
  }

  if (!jobListingData) {
    return (
      <div className="w-full h-screen flex items-center justify-center p-12 bg-[#FAF9F6]">
        <span className="archivo text-sm text-[#6B6F76]">
          No job selected.
        </span>
      </div>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Analytics
  |--------------------------------------------------------------------------
  */

  const analytics = jobListingData.analytics;

  const applicantBars =
    analytics?.applicants_per_day ?? [];

  const maxApplicants = Math.max(
    ...applicantBars.map(
      (item) => item.count
    ),
    1
  );

  /*
  |--------------------------------------------------------------------------
  | Styling Helpers
  |--------------------------------------------------------------------------
  */

  const labelClass =
    "archivo text-[11px] font-semibold uppercase tracking-wider text-[#6B6F76] mb-1 block";

  const inputClass =
    "w-full text-xs text-[#1C2321] bg-white border border-[#D8D5CD] rounded-md px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#991B1B]";

  const fieldError = (key: string) =>
    fieldErrors[key]?.[0] ? (
      <span className="text-[10px] text-[#991B1B] block mt-0.5">
        {fieldErrors[key][0]}
      </span>
    ) : null;

  const editing = isEditing && draft !== null;

  const statusStyle = (
    status?: string | null
  ) => {
    switch (status?.toLowerCase()) {
      case "shortlisted":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";

      case "under review":
      case "pending":
        return "bg-amber-50 text-amber-700 border-amber-200";

      case "rejected":
        return "bg-rose-50 text-rose-700 border-rose-200";

      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Pagination
  |--------------------------------------------------------------------------
  */

  const totalItems =
    appFilters.filtered.length;

  const totalPages = Math.max(
    1,
    Math.ceil(
      totalItems / itemsPerPage
    )
  );

  const startIndex =
    (currentPage - 1) *
    itemsPerPage;

  const currentApplicants =
    appFilters.filtered.slice(
      startIndex,
      startIndex + itemsPerPage
    );

  const isResized = topOffset > 0;

  /*
  |--------------------------------------------------------------------------
  | Render
  |--------------------------------------------------------------------------
  */

  return (
    <div
      className={`w-full h-screen p-6 bg-[#FAF9F6] flex flex-col overflow-hidden ${
        isDragging
          ? "select-none cursor-row-resize"
          : ""
      }`}
    >
      {/* TOP SECTION */}
      {topCollapsed ? (
        <div className="w-full bg-white border border-[#E3E0D8] rounded-xl px-5 py-3 shadow-sm flex items-center justify-between gap-4 shrink-0">
          <div className="min-w-0">
            <span className="archivo text-[10px] text-[#6B6F76] font-medium block">
              Job Listing #
              {jobListingData.job_id}
            </span>

            <h1 className="archivo text-base text-[#1C2321] font-bold truncate">
              {jobListingData.job_title}
            </h1>
          </div>

          <button
            onClick={resetTop}
            className="archivo shrink-0 px-4 py-2 rounded-md border border-[#D8D5CD] bg-white shadow-sm flex items-center gap-1 text-sm font-medium text-[#1C2321] hover:bg-[#FAF9F6] transition"
          >
            <MdKeyboardArrowDown size={20} />
            Expand
          </button>
        </div>
      ) : (
        <div
          className={`shrink-0 ${
            isResized
              ? "overflow-hidden"
              : ""
          } ${
            isDragging
              ? ""
              : "transition-[height] duration-200"
          }`}
          style={
            isResized
              ? {
                  height:
                    naturalTop -
                    topOffset,
                }
              : undefined
          }
        >
          <div
            ref={topInnerRef}
            className={`flex flex-col gap-6 ${
              isDragging
                ? ""
                : "transition-transform duration-200"
            }`}
            style={{
              transform: `translateY(-${topOffset}px)`,
            }}
          >
            {/* Action Buttons */}
            <div className="w-full px-3 flex justify-end gap-3">
              {editing ? (
                <>
                  <button
                    onClick={saveEdit}
                    disabled={saving}
                    className="archivo w-24 py-2 rounded-md bg-[#991B1B] text-white text-sm font-medium shadow hover:bg-[#7F1D1D] disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    {saving ? "Saving..." : "Save"}
                  </button>

                  <button
                    onClick={cancelEdit}
                    disabled={saving}
                    className="archivo w-24 py-2 rounded-md border-2 border-zinc-200 bg-white text-sm font-medium text-zinc-600 shadow hover:bg-gray-100 disabled:opacity-50 transition"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={startEdit}
                    className="w-24 py-2 border-2 border-zinc-200 rounded-md shadow flex items-center justify-center gap-1 hover:scale-110 hover:bg-yellow-100 transition"
                  >
                    <FaRegEdit
                      size={18}
                      color="bg-zinc-200"
                    />

                    <p className="archivo font-medium text-sm text-zinc-600">
                      Edit
                    </p>
                  </button>

                  <button className="w-24 py-2 border-2 border-zinc-200 rounded-md shadow flex items-center justify-center gap-1 hover:scale-110 hover:bg-red-100 transition">
                    <MdDelete size={18} />

                    <p className="archivo font-medium text-sm text-zinc-600">
                      Delete
                    </p>
                  </button>

                  <button
                    className="w-24 py-2 rounded-md border border-gray-200 shadow-sm flex items-center justify-center hover:scale-110 hover:bg-gray-100 transition"
                    onClick={() =>
                      navigate(-1)
                    }
                  >
                    <IoReturnUpBackSharp
                      size={21}
                    />
                  </button>
                </>
              )}
            </div>

            {/* Save error banner */}
            {saveError && (
              <div className="mx-3 -mt-3 text-xs text-[#991B1B] bg-rose-50 border border-rose-200 rounded-md px-3 py-2">
                {saveError}
              </div>
            )}

            {/* Job Overview */}
            <div
              className={`w-full bg-white border rounded-xl p-5 shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-6 ${
                editing
                  ? "border-[#991B1B]/40"
                  : "border-[#E3E0D8]"
              }`}
            >

              {/* Left: Job Information */}
              <div className="lg:col-span-4 border-b lg:border-b-0 lg:border-r border-[#E3E0D8] pb-4 lg:pb-0 lg:pr-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="archivo text-xs text-[#6B6F76] font-medium">
                      Job Listing #
                      {jobListingData.job_id}
                    </span>

                    {editing ? (
                      <span className="archivo text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                        Editing
                      </span>
                    ) : (
                      <span className="archivo text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Active
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  {editing && draft ? (
                    <div className="mb-3">
                      <input
                        className={`${inputClass} text-base font-bold`}
                        value={draft.job_title}
                        onChange={(e) =>
                          setField(
                            "job_title",
                            e.target.value
                          )
                        }
                      />
                      {fieldError("job_title")}
                    </div>
                  ) : (
                    <h1 className="archivo text-2xl text-[#1C2321] mb-3 font-bold leading-tight">
                      {jobListingData.job_title}
                    </h1>
                  )}

                  <div className="grid grid-cols-2 gap-2 mb-2">
                    {/* Employment type */}
                    <div className="bg-[#FAF9F6] p-2 rounded-lg border border-[#E3E0D8]">
                      <span
                        className={labelClass}
                      >
                        Employment Type
                      </span>

                      {editing && draft ? (
                        <>
                          <input
                            list="employment-type-options"
                            className={inputClass}
                            value={draft.employment_type}
                            onChange={(e) =>
                              setField(
                                "employment_type",
                                e.target.value
                              )
                            }
                          />
                          <datalist id="employment-type-options">
                            {EMPLOYMENT_TYPE_SUGGESTIONS.map(
                              (t) => (
                                <option
                                  key={t}
                                  value={t}
                                />
                              )
                            )}
                          </datalist>
                          {fieldError("employment_type")}
                        </>
                      ) : (
                        <span className="text-xs font-semibold text-[#1C2321]">
                          {
                            jobListingData.employment_type
                          }
                        </span>
                      )}
                    </div>

                    {/* Vacant positions */}
                    <div className="bg-[#FAF9F6] p-2 rounded-lg border border-[#E3E0D8]">
                      <span
                        className={labelClass}
                      >
                        Vacant Positions
                      </span>

                      {editing && draft ? (
                        <>
                          <input
                            type="number"
                            min={1}
                            className={inputClass}
                            value={draft.vacant_position}
                            onChange={(e) =>
                              setField(
                                "vacant_position",
                                numberOrEmpty(
                                  e.target.value
                                )
                              )
                            }
                          />
                          {fieldError("vacant_position")}
                        </>
                      ) : (
                        <span className="text-xs font-semibold text-[#1C2321]">
                          {
                            jobListingData.vacant_position
                          }{" "}
                          Position(s)
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Salary */}
                  <div className="bg-[#FAF9F6] p-2 rounded-lg border border-[#E3E0D8] mb-2">
                    <span
                      className={labelClass}
                    >
                      Salary Range
                    </span>

                    {editing && draft ? (
                      <>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min={0}
                            placeholder="Min"
                            className={inputClass}
                            value={draft.minimum_salary}
                            onChange={(e) =>
                              setField(
                                "minimum_salary",
                                numberOrEmpty(
                                  e.target.value
                                )
                              )
                            }
                          />

                          <span className="text-xs text-[#6B6F76]">
                            –
                          </span>

                          <input
                            type="number"
                            min={0}
                            placeholder="Max"
                            className={inputClass}
                            value={draft.maximum_salary}
                            onChange={(e) =>
                              setField(
                                "maximum_salary",
                                numberOrEmpty(
                                  e.target.value
                                )
                              )
                            }
                          />
                        </div>
                        {fieldError("minimum_salary")}
                        {fieldError("maximum_salary")}
                      </>
                    ) : (
                      <span className="text-xs font-bold text-[#991B1B]">
                        ₱
                        {jobListingData.minimum_salary.toLocaleString()}
                        {" – "}
                        ₱
                        {jobListingData.maximum_salary.toLocaleString()}
                      </span>
                    )}
                  </div>

                  {/* Description */}
                  <div>
                    <span
                      className={labelClass}
                    >
                      Description
                    </span>

                    {editing && draft ? (
                      <>
                        <textarea
                          rows={4}
                          className={`${inputClass} leading-relaxed resize-y`}
                          value={draft.job_description}
                          onChange={(e) =>
                            setField(
                              "job_description",
                              e.target.value
                            )
                          }
                        />
                        {fieldError("job_description")}
                      </>
                    ) : (
                      <p className="text-xs text-[#1C2321] bg-[#FAF9F6] p-2 rounded-lg border border-[#E3E0D8] leading-relaxed line-clamp-2">
                        {
                          jobListingData.job_description
                        }
                      </p>
                    )}
                  </div>
                </div>

                {/* Dates */}
                {editing && draft ? (
                  <div className="mt-2 pt-2 border-t border-[#E3E0D8] grid grid-cols-2 gap-2">
                    <div>
                      <span className={labelClass}>
                        Posted
                      </span>
                      <input
                        type="date"
                        className={inputClass}
                        value={draft.posted_at}
                        onChange={(e) =>
                          setField(
                            "posted_at",
                            e.target.value
                          )
                        }
                      />
                      {fieldError("posted_at")}
                    </div>

                    <div>
                      <span className={labelClass}>
                        Until
                      </span>
                      <input
                        type="date"
                        className={inputClass}
                        value={draft.posted_until}
                        min={draft.posted_at || undefined}
                        onChange={(e) =>
                          setField(
                            "posted_until",
                            e.target.value
                          )
                        }
                      />
                      {fieldError("posted_until")}
                    </div>
                  </div>
                ) : (
                  <div className="mt-2 pt-2 border-t border-[#E3E0D8] flex justify-between text-[10px] text-[#6B6F76] archivo">
                    <span>
                      Posted:{" "}
                      {new Date(
                        jobListingData.posted_at
                      ).toLocaleDateString()}
                    </span>

                    <span>
                      Until:{" "}
                      {new Date(
                        jobListingData.posted_until
                      ).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>

              {/* Center: Statistics */}
              <div className="lg:col-span-4 border-b lg:border-b-0 lg:border-r border-[#E3E0D8] pb-4 lg:pb-0 lg:px-6 flex flex-col justify-between">
                <div>
                  <h3 className="archivo text-xs font-bold uppercase tracking-wider text-[#6B6F76] mb-3">
                    Application Statistics
                  </h3>

                  <div className="grid grid-cols-2 gap-2.5">

                    {/* Total Applicants */}
                    <div className="bg-[#FAF9F6] p-3 rounded-xl border border-[#E3E0D8] hover:border-[#D8D5CD] transition-colors">
                      <span className={labelClass}>
                        Total Applicants
                      </span>

                      <div className="flex items-baseline justify-between mt-1">
                        <span className="text-xl font-bold text-[#1C2321]">
                          {
                            analytics?.total_applicants ??
                            0
                          }
                        </span>
                      </div>
                    </div>

                    {/* Shortlisted */}
                    <div className="bg-[#FAF9F6] p-3 rounded-xl border border-[#E3E0D8] hover:border-[#D8D5CD] transition-colors">
                      <span className={labelClass}>
                        Shortlisted
                      </span>

                      <div className="flex items-baseline justify-between mt-1">
                        <span className="text-xl font-bold text-[#1C2321]">
                          {
                            analytics?.shortlisted ??
                            0
                          }
                        </span>
                      </div>
                    </div>

                    {/* Under Review */}
                    <div className="bg-[#FAF9F6] p-3 rounded-xl border border-[#E3E0D8] hover:border-[#D8D5CD] transition-colors">
                      <span className={labelClass}>
                        Under Review
                      </span>

                      <div className="flex items-baseline justify-between mt-1">
                        <span className="text-xl font-bold text-[#1C2321]">
                          {
                            analytics?.under_review ??
                            0
                          }
                        </span>

                        <span className="text-[10px] text-[#6B6F76]">
                          Pending
                        </span>
                      </div>
                    </div>

                    {/* Conversion Rate */}
                    <div className="bg-[#FAF9F6] p-3 rounded-xl border border-[#E3E0D8] hover:border-[#D8D5CD] transition-colors">
                      <span className={labelClass}>
                        Conversion Rate
                      </span>

                      <div className="flex items-baseline justify-between mt-1">
                        <span className="text-xl font-bold text-[#991B1B]">
                          {
                            analytics?.conversion_rate ??
                            0
                          }
                          %
                        </span>
                      </div>
                    </div>

                    {/* Rejected */}
                    <div className="bg-[#FAF9F6] p-3 rounded-xl border border-[#E3E0D8] hover:border-[#D8D5CD] transition-colors">
                      <span className={labelClass}>
                        Rejected
                      </span>

                      <div className="flex items-baseline justify-between mt-1">
                        <span className="text-xl font-bold text-[#1C2321]">
                          {
                            analytics?.rejected ??
                            0
                          }
                        </span>
                      </div>
                    </div>

                    {/* Interview */}
                    <div className="bg-[#FAF9F6] p-3 rounded-xl border border-[#E3E0D8] hover:border-[#D8D5CD] transition-colors">
                      <span className={labelClass}>
                        Interview
                      </span>

                      <div className="flex items-baseline justify-between mt-1">
                        <span className="text-xl font-bold text-[#1C2321]">
                          {
                            analytics?.interview ??
                            0
                          }
                        </span>
                      </div>
                    </div>

                  </div>
                </div>

                {/* Qualifications */}
                {(jobListingData.requirements || editing) && (
                  <div className="mt-2 bg-[#FAF9F6] p-2 rounded-xl border border-[#E3E0D8]">
                    <span
                      className={labelClass}
                    >
                      Qualifications
                    </span>

                    {editing && draft ? (
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <span className="text-[10px] text-[#6B6F76] block mb-0.5">
                            Education
                          </span>
                          <input
                            className={inputClass}
                            value={draft.highest_education}
                            onChange={(e) =>
                              setField(
                                "highest_education",
                                e.target.value
                              )
                            }
                          />
                          {fieldError(
                            "requirements.highest_education"
                          )}
                        </div>

                        <div>
                          <span className="text-[10px] text-[#6B6F76] block mb-0.5">
                            Experience (yrs)
                          </span>
                          <input
                            type="number"
                            min={0}
                            className={inputClass}
                            value={draft.experience}
                            onChange={(e) =>
                              setField(
                                "experience",
                                numberOrEmpty(
                                  e.target.value
                                )
                              )
                            }
                          />
                          {fieldError(
                            "requirements.experience"
                          )}
                        </div>
                      </div>
                    ) : (
                      jobListingData.requirements && (
                        <div className="flex justify-between text-xs text-[#1C2321] font-medium">
                          <span>
                            Education:{" "}
                            {
                              jobListingData
                                .requirements
                                .highest_education
                            }
                          </span>

                          <span>
                            Experience:{" "}
                            {
                              jobListingData
                                .requirements
                                .experience
                            }{" "}
                            yr(s)
                          </span>
                        </div>
                      )
                    )}
                  </div>
                )}
              </div>

              {/* Right: Weekly Applicants Graph */}
              <div className="lg:col-span-4 lg:pl-2 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <div>
                      <h3 className="archivo text-xs font-bold uppercase tracking-wider text-[#6B6F76]">
                        Applicants Per Day
                      </h3>

                      <p className="text-[10px] text-[#8A8F98] mt-1">
                        Application activity this week
                      </p>
                    </div>

                    <span className="text-[10px] text-[#6B6F76] bg-[#FAF9F6] px-2 py-0.5 rounded border border-[#E3E0D8]">
                      Mon – Sun
                    </span>
                  </div>

                  <div className="bg-[#FAF9F6] h-40 rounded-xl border border-[#E3E0D8] p-3 flex items-end justify-between gap-2">

                    {applicantBars.length ===
                    0 ? (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-[10px] text-[#6B6F76]">
                          No application data available
                        </span>
                      </div>
                    ) : (
                      applicantBars.map(
                        (bar) => {
                          const heightPercentage =
                            bar.count ===
                            0
                              ? 0
                              : Math.max(
                                  (bar.count /
                                    maxApplicants) *
                                    100,
                                  8
                                );

                          return (
                            <div
                              key={
                                bar.date
                              }
                              className="flex-1 flex flex-col items-center gap-1 h-full justify-end group min-w-0"
                            >
                              {/* Count */}
                              <span className="text-[10px] font-semibold text-[#1C2321] group-hover:text-[#991B1B] transition-colors">
                                {
                                  bar.count
                                }
                              </span>

                              {/* Bar */}
                              <div
                                className="w-full bg-[#991B1B] group-hover:bg-[#7F1D1D] rounded-t-sm transition-all"
                                style={{
                                  height: `${heightPercentage}%`,
                                }}
                              />

                              {/* Day */}
                              <span className="archivo text-[9px] text-[#6B6F76] font-medium">
                                {bar.day}
                              </span>
                            </div>
                          );
                        }
                      )
                    )}

                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* RESIZE HANDLE */}
      {!topCollapsed ? (
        <div
          onPointerDown={startDrag}
          onDoubleClick={isEditing ? undefined : resetTop}
          title={
            isEditing
              ? "Resizing is disabled while editing"
              : "Drag to resize · double-click to reset"
          }
          className={`group w-full h-6 shrink-0 flex items-center justify-center touch-none ${
            isEditing
              ? "cursor-not-allowed opacity-40"
              : "cursor-row-resize"
          }`}
        >
          <div
            className={`h-1.5 w-16 rounded-full transition-colors ${
              isDragging
                ? "bg-[#991B1B]"
                : isEditing
                ? "bg-[#D8D5CD]"
                : "bg-[#D8D5CD] group-hover:bg-[#991B1B]"
            }`}
          />
        </div>
      ) : (
        <div className="h-6 shrink-0" />
      )}

      {/* BOTTOM SECTION */}
      <div className="w-full min-h-0 border border-[#E3E0D8] rounded-xl p-5 shadow-sm flex flex-col flex-1 overflow-auto">

        {/* Header Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-3 pb-3 border-b border-[#E3E0D8] shrink-0">
          <div>
            <h2 className="archivo text-xl text-[#1C2321] font-bold">
              Job Applications
            </h2>

            <p className="archivo text-xs text-[#6B6F76]">
              Showing recent applicants
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="archivo text-xs text-[#6B6F76]">
              Show per page:
            </span>

            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(
                  Number(e.target.value)
                );

                setCurrentPage(1);
              }}
              className="border border-[#D8D5CD] bg-white text-xs text-[#1C2321] rounded p-1.5 focus:outline-none focus:ring-1 focus:ring-[#991B1B]"
            >
              <option value={5}>
                5
              </option>

              <option value={10}>
                10
              </option>
            </select>
          </div>
        </div>

        {/* Search, filters and sorting */}
        <ApplicationFilters
          {...appFilters.filterProps}
        />

        {/* Table */}
        <div className="flex-1 min-h-[320px] overflow-y-auto border border-[#E3E0D8] rounded-lg">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="sticky top-0 bg-[#FAF9F6] z-10 border-b border-[#E3E0D8]">
              <tr className="archivo text-[11px] text-[#6B6F76] uppercase tracking-wider font-semibold">
                <th className="p-3">
                  Applicant Name
                </th>

                <th className="p-3">
                  Email
                </th>

                <th className="p-3">
                  Application Date
                </th>

                <th className="p-3">
                  Status
                </th>

                <th className="p-3 text-right">
                  Action
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#E3E0D8] bg-white">

              {appsLoading ? (
                <tr>
                  <td
                    colSpan={5}
                    className="p-6 text-center text-xs text-[#6B6F76]"
                  >
                    Loading applications...
                  </td>
                </tr>
              ) : appsError ? (
                <tr>
                  <td
                    colSpan={5}
                    className="p-6 text-center text-xs text-[#991B1B]"
                  >
                    {appsError}
                  </td>
                </tr>
              ) : currentApplicants.length ===
                0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="p-6 text-center text-xs text-[#6B6F76]"
                  >
                    {applications.length >
                    0
                      ? "No applications match your filters."
                      : "No applications yet."}
                  </td>
                </tr>
              ) : (
                currentApplicants.map(
                  (app) => (
                    <tr
                      key={
                        app.application_id
                      }
                      className="hover:bg-[#FAF9F6] transition-colors"
                    >
                      <td className="p-3 font-medium text-[#1C2321]">
                        {[
                          app.first_name,
                          app.last_name,
                        ]
                          .filter(Boolean)
                          .join(" ") ||
                          "Unknown applicant"}
                      </td>

                      <td className="p-3 text-[#6B6F76] text-xs">
                        {app.email ?? "—"}
                      </td>

                      <td className="p-3 text-[#6B6F76] text-xs">
                        {app.date_applied ??
                          "—"}
                      </td>

                      <td className="p-3">
                        <span
                          className={`archivo text-[11px] px-2.5 py-1 rounded-full font-medium border ${statusStyle(
                            app.status
                          )}`}
                        >
                          {app.status}
                        </span>
                      </td>

                      <td className="p-3 text-right">
                        <button
                          className="archivo text-xs text-[#991B1B] hover:text-[#7F1D1D] hover:underline font-semibold transition-colors"
                          onClick={() =>
                            navigate(
                              `/employee/dash/job_listing/application?job_id=${job_id}&applicant_id=${app.applicant_id}`
                            )
                          }
                        >
                          View Application
                        </button>
                      </td>
                    </tr>
                  )
                )
              )}

            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="flex items-center justify-between pt-3 mt-2 text-xs archivo text-[#6B6F76] shrink-0">

          <span>
            {totalItems === 0
              ? "No applicants"
              : `Showing ${
                  startIndex + 1
                } to ${Math.min(
                  startIndex +
                    itemsPerPage,
                  totalItems
                )} of ${totalItems} applicants`}
          </span>

          <div className="flex items-center gap-2">

            <button
              onClick={() =>
                setCurrentPage(
                  (prev) =>
                    Math.max(
                      prev - 1,
                      1
                    )
                )
              }
              disabled={
                currentPage === 1
              }
              className="px-3 py-1.5 border border-[#D8D5CD] rounded bg-white hover:bg-[#FAF9F6] disabled:opacity-40 disabled:cursor-not-allowed transition-colors font-medium text-[#1C2321]"
            >
              Previous
            </button>

            <span className="px-2 font-medium text-[#1C2321]">
              {currentPage} of{" "}
              {totalPages}
            </span>

            <button
              onClick={() =>
                setCurrentPage(
                  (prev) =>
                    Math.min(
                      prev + 1,
                      totalPages
                    )
                )
              }
              disabled={
                currentPage ===
                totalPages
              }
              className="px-3 py-1.5 border border-[#D8D5CD] rounded bg-white hover:bg-[#FAF9F6] disabled:opacity-40 disabled:cursor-not-allowed transition-colors font-medium text-[#1C2321]"
            >
              Next
            </button>

          </div>
        </div>

      </div>
    </div>
  );
}