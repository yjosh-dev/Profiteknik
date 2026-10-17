import { FaMagnifyingGlass } from "react-icons/fa6";
import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import logo from "../../assets/logo/profiteknik_logo_only.svg";

import {
  FaLocationDot,
  FaBriefcase,
  FaPesoSign,
  FaHelmetSafety,
} from "react-icons/fa6";

import { RiSearchAiLine } from "react-icons/ri";

import { jobListingService } from "../../service/api/applicants/jobListingService";

import JobDetailPanel from "../../components/common/JobDetail";
import type { JobDetail } from "../../types/JobDetailType";

/*
 * ============================================================
 * INTERNAL TYPES
 * ============================================================
 */

interface JobListingItem {
  job_id: number;
  job_title: string;
  job_description: string;
  minimum_salary: number;
  maximum_salary: number;
  vacant_position: number;
  employment_type: string;
  posted_at: string;
  posted_until?: string | null;
}

interface PaginatedJobs {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;

  from: number | null;
  to: number | null;

  first_page_url?: string;
  last_page_url?: string;

  next_page_url?: string | null;
  prev_page_url?: string | null;

  path?: string;

  data: JobListingItem[];
}

interface JobSearchBarType {
  results?: number;
  search?: string;
  onChange?: (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => void;
  onSearch?: () => void;
}

/*
 * ============================================================
 * MAIN COMPONENT
 * ============================================================
 */

export default function JobListingWall() {
  const [searchParams, setSearchParams] =
    useSearchParams();

  const selectedJobId =
    searchParams.get("job");

  const [jobData, setJobData] =
    useState<PaginatedJobs | null>(null);

  const [jobDetail, setJobDetail] =
    useState<JobDetail | null>(null);

  const [nextPage, setNextPage] =
    useState<number>(2);

  const [search, setSearch] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [loadingMore, setLoadingMore] =
    useState(false);

  const [loadingDetail, setLoadingDetail] =
    useState(false);

  const [detailError, setDetailError] =
    useState(false);

  const navigate = useNavigate();

  /*
   * ============================================================
   * SEARCH
   * ============================================================
   */

  const handleSearch = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setSearch(e.target.value);
  };

  /*
   * ============================================================
   * SELECT JOB
   * ============================================================
   */

  const handleSelectJob = (
    id: string,
  ) => {
    setSearchParams(
      (prev) => {
        const next =
          new URLSearchParams(prev);

        next.set("job", id);

        return next;
      },
      {
        preventScrollReset: true,
      },
    );
  };

  /*
   * ============================================================
   * INITIAL JOB LIST
   * ============================================================
   */

  const fetchJobListingInitial =
    async () => {
      try {
        setLoading(true);

        const res =
          await jobListingService.fetchJobListings();

        setNextPage(
          res.data.current_page + 1,
        );

        setJobData(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    void fetchJobListingInitial();
  }, []);

  /*
   * ============================================================
   * JOB DETAIL
   * ============================================================
   */

  useEffect(() => {
    if (!selectedJobId) {
      setJobDetail(null);
      return;
    }

    let cancelled = false;

    const fetchJobDetail =
      async () => {
        try {
          setLoadingDetail(true);
          setDetailError(false);

          const res =
            await jobListingService.fetchJobListing(
              selectedJobId,
            );

          if (!cancelled) {
            setJobDetail(res.data);
          }
        } catch (err) {
          console.error(err);

          if (!cancelled) {
            setDetailError(true);
          }
        } finally {
          if (!cancelled) {
            setLoadingDetail(false);
          }
        }
      };

    void fetchJobDetail();

    return () => {
      cancelled = true;
    };
  }, [selectedJobId]);

  /*
   * ============================================================
   * INFINITE SCROLL
   * ============================================================
   */

  const handleScroll = async (
    e: React.UIEvent<HTMLDivElement>,
  ) => {
    const el =
      e.currentTarget;

    const atBottom =
      el.scrollTop +
        el.clientHeight >=
      el.scrollHeight - 1;

    if (
      !atBottom ||
      loadingMore ||
      !jobData
    ) {
      return;
    }

    if (
      jobData.current_page >=
      jobData.last_page
    ) {
      return;
    }

    try {
      setLoadingMore(true);

      const res =
        await jobListingService.fetchJobListings(
          nextPage,
        );

      const fetched =
        res.data;

      setJobData(
        (prev) => ({
          ...fetched,

          data: [
            ...(prev?.data ?? []),
            ...fetched.data,
          ],
        }),
      );

      setNextPage(
        fetched.current_page + 1,
      );
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingMore(false);
    }
  };

  /*
   * ============================================================
   * EMPTY STATE
   * ============================================================
   */

  const hasNoJobs =
    !loading &&
    jobData !== null &&
    jobData.data.length === 0;

  /*
   * ============================================================
   * RENDER
   * ============================================================
   */

  return (
    <div className="flex h-full w-full justify-center gap-5 bg-zinc-50 px-10 py-6">

      {/* ======================================================
          FILTER SIDEBAR
          ====================================================== */}

      <aside className="h-full w-[18%]">

        <div className="h-full w-full overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-sm">

          <div className="flex h-[10%] min-h-[56px] w-full items-center justify-between border-b border-gray-200 px-4">

            <p className="archivo text-[16px] font-semibold text-zinc-900">
              Filtering
            </p>

            <p className="archivo cursor-pointer text-xs font-medium text-red-800 transition-colors hover:text-red-600">
              Clear filter
            </p>

          </div>

          <JobTypeFilter />

          <JobLocationFilter />

          <JobExperienceFilter />

          <JobSalaryFilter />

        </div>

      </aside>

      {/* ======================================================
          JOB LIST
          ====================================================== */}

      <div
        className="flex max-h-full w-[40%] flex-col gap-5 overflow-auto rounded-xl border border-gray-200 bg-white px-4 py-4 shadow-sm"
        onScroll={handleScroll}
      >

        <JobSearchBar
          search={search}
          onChange={handleSearch}
        />

        {/* Loading */}
        {loading && (
          <>
            <JobCardSkeleton />
            <JobCardSkeleton />
            <JobCardSkeleton />
          </>
        )}

        {/* Empty */}
        {hasNoJobs && (
          <NoJobsFound />
        )}

        {/* Job cards */}
        {jobData?.data.map(
          (item) => (
            <JobCard
              key={item.job_id}

              job_id={String(
                item.job_id,
              )}

              selected={
                String(
                  item.job_id,
                ) === selectedJobId
              }

              onSelect={
                handleSelectJob
              }

              job_title={
                item.job_title
              }

              location="Pasig City"

              job_description={
                item.job_description
              }

              job_type={
                item.employment_type
              }

              experience_required="12"

              min_salary={
                item.minimum_salary
              }

              max_salary={
                item.maximum_salary
              }

              posted_at={
                item.posted_at
              }
            />
          ),
        )}

        {/* Loading more */}
        {loadingMore && (
          <JobCardSkeleton />
        )}

      </div>

      {/* ======================================================
          JOB DETAIL
          ====================================================== */}

      <div className="max-h-full w-[35%] rounded-xl border border-gray-200 bg-white shadow-sm">

        {loadingDetail ? (
          <JobCardSkeleton />
        ) : jobDetail ? (
          <JobDetailPanel
            job={jobDetail}
            onApply={() =>
              navigate(
                `/applicant/${selectedJobId}/apply`,
              )
            }
          />
        ) : (
          <div className="flex h-full items-center justify-center px-10 text-center">

            <p className="archivo text-sm text-zinc-500">
              {detailError
                ? "We couldn't load this job. Try selecting it again."
                : "Select a job to see its details."}
            </p>

          </div>
        )}

      </div>

    </div>
  );
}

/*
 * ============================================================
 * JOB TYPE FILTER
 * ============================================================
 */

function JobTypeFilter() {
  const jobTypes = [
    {
      name: "Full-time",
      id: "fulltime",
    },
    {
      name: "Part-time",
      id: "parttime",
    },
    {
      name: "Contractual",
      id: "contractual",
    },
    {
      name: "Volunteer",
      id: "volunteer",
    },
    {
      name: "Internship",
      id: "internship",
    },
  ];

  return (
    <div className="h-[23%] w-full border-b border-gray-200 px-4 py-4">

      <p className="mb-3 text-sm font-semibold text-zinc-800">
        Job type
      </p>

      <form className="grid grid-cols-2 gap-x-2 gap-y-2.5">

        {jobTypes.map(
          (item) => (
            <div
              key={item.id}
              className="flex items-center gap-2"
            >

              <input
                type="checkbox"
                id={item.id}
                name="jobType"
                value={item.name}
                className="h-4 w-4 cursor-pointer rounded border-gray-300 text-red-800 accent-red-800 focus:ring-red-500 focus:ring-offset-0"
              />

              <label
                htmlFor={item.id}
                className="archivo cursor-pointer select-none text-sm text-zinc-600"
              >
                {item.name}
              </label>

            </div>
          ),
        )}

      </form>

    </div>
  );
}

/*
 * ============================================================
 * LOCATION FILTER
 * ============================================================
 */

function JobLocationFilter() {
  return (
    <div className="h-[17%] w-full border-b border-gray-200 px-4 py-4">

      <p className="mb-3 text-sm font-semibold text-zinc-800">
        Location
      </p>

      <form>

        <div className="flex h-10 w-full items-center gap-2 rounded-lg border border-gray-300 px-3 transition-all focus-within:border-red-500 focus-within:ring-1 focus-within:ring-red-500">

          <FaLocationDot className="shrink-0 text-sm text-zinc-400" />

          <input
            type="text"
            className="archivo h-full w-full bg-transparent text-sm outline-none placeholder:text-zinc-400"
            placeholder="Location"
          />

        </div>

      </form>

    </div>
  );
}

/*
 * ============================================================
 * EXPERIENCE FILTER
 * ============================================================
 */

function JobExperienceFilter() {
  const yearExperience = [
    {
      name: "0 yr",
      id: "exp-0",
    },
    {
      name: "1-2 yrs",
      id: "exp-1-2",
    },
    {
      name: "3-5 yrs",
      id: "exp-3-5",
    },
    {
      name: "5-7 yrs",
      id: "exp-5-7",
    },
    {
      name: "8+",
      id: "exp-8+",
    },
  ];

  return (
    <div className="h-[23%] w-full border-b border-gray-200 px-4 py-4">

      <p className="mb-3 text-sm font-semibold text-zinc-800">
        Experience
      </p>

      <form className="grid grid-cols-2 gap-x-2 gap-y-2.5">

        {yearExperience.map(
          (item) => (
            <div
              key={item.id}
              className="flex items-center gap-2"
            >

              <input
                type="checkbox"
                id={item.id}
                name="experience"
                value={item.name}
                className="h-4 w-4 cursor-pointer rounded border-gray-300 text-red-800 accent-red-800 focus:ring-red-500 focus:ring-offset-0"
              />

              <label
                htmlFor={item.id}
                className="archivo cursor-pointer select-none text-sm text-zinc-600"
              >
                {item.name}
              </label>

            </div>
          ),
        )}

      </form>

    </div>
  );
}

/*
 * ============================================================
 * SALARY FILTER
 * ============================================================
 */

function JobSalaryFilter() {
  return (
    <div className="h-[18%] w-full px-4 py-4">

      <p className="mb-3 text-sm font-semibold text-zinc-800">
        Salary range
      </p>

      <div className="grid grid-cols-2 gap-2">

        <div className="flex h-10 items-center gap-2 rounded-lg border border-gray-300 px-3 transition-all focus-within:border-red-500 focus-within:ring-1 focus-within:ring-red-500">

          <FaPesoSign className="shrink-0 text-sm text-zinc-400" />

          <input
            type="text"
            placeholder="Min"
            className="archivo w-full bg-transparent text-sm outline-none placeholder:text-zinc-400"
          />

        </div>

        <div className="flex h-10 items-center gap-2 rounded-lg border border-gray-300 px-3 transition-all focus-within:border-red-500 focus-within:ring-1 focus-within:ring-red-500">

          <FaPesoSign className="shrink-0 text-sm text-zinc-400" />

          <input
            type="text"
            placeholder="Max"
            className="archivo w-full bg-transparent text-sm outline-none placeholder:text-zinc-400"
          />

        </div>

      </div>

    </div>
  );
}

/*
 * ============================================================
 * TIME AGO
 * ============================================================
 */

function timeAgo(
  iso: string,
): string {
  const date =
    new Date(iso);

  const timestamp =
    date.getTime();

  if (
    Number.isNaN(timestamp)
  ) {
    return "";
  }

  const diffMs =
    Date.now() - timestamp;

  const minutes =
    Math.max(
      1,
      Math.floor(
        diffMs / 60000,
      ),
    );

  if (minutes < 60) {
    return `${minutes} minute${
      minutes === 1
        ? ""
        : "s"
    } ago`;
  }

  const hours =
    Math.floor(
      minutes / 60,
    );

  if (hours < 24) {
    return `${hours} hour${
      hours === 1
        ? ""
        : "s"
    } ago`;
  }

  const days =
    Math.floor(
      hours / 24,
    );

  return `${days} day${
    days === 1
      ? ""
      : "s"
  } ago`;
}

/*
 * ============================================================
 * NUMBER FORMAT
 * ============================================================
 */

const number =
  new Intl.NumberFormat(
    "en-PH",
    {
      maximumFractionDigits: 0,
    },
  );

/*
 * ============================================================
 * JOB CARD
 * ============================================================
 */

function JobCard({
  job_id,
  selected = false,
  onSelect,
  job_title,
  location,
  job_description,
  job_type,
  experience_required,
  min_salary,
  max_salary,
  posted_at,
}: {
  job_id: string;
  selected?: boolean;
  onSelect: (
    id: string,
  ) => void;
  job_title: string;
  location: string;
  job_description: string;
  job_type: string;
  experience_required: string;
  min_salary: number;
  max_salary: number;
  posted_at: string;
}) {
  const salaryRange =
    `${number.format(
      min_salary,
    )} - ${number.format(
      max_salary,
    )}`;

  const experience =
    `${experience_required}+ years`;

  return (
    <div
      role="button"
      tabIndex={0}
      aria-pressed={selected}
      id={`job-${job_id}`}
      onClick={() =>
        onSelect(job_id)
      }
      onKeyDown={(e) => {
        if (
          e.key === "Enter" ||
          e.key === " "
        ) {
          e.preventDefault();

          onSelect(job_id);
        }
      }}
      className={`flex w-full cursor-pointer flex-col rounded-xl border bg-white py-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 ${
        selected
          ? "border-red-700 shadow-sm ring-1 ring-red-700"
          : "border-zinc-200 shadow-xs hover:border-zinc-300"
      }`}
    >

      {/* Header */}
      <div className="mb-3 flex w-full items-start justify-between gap-4 px-5">

        <div className="flex min-w-0 gap-3">

          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-white p-2 shadow-sm ring-1 ring-zinc-200">

            <img
              src={logo}
              alt=""
              className="h-full w-full object-contain"
            />

          </div>

          <div className="flex min-w-0 flex-col">

            <p className="archivo truncate font-semibold text-zinc-900">
              {job_title}
            </p>

            <p className="archivo truncate text-sm font-normal text-zinc-600">
              {location}
            </p>

          </div>

        </div>

        <p className="archivo shrink-0 text-sm font-normal text-zinc-500">
          {timeAgo(posted_at)}
        </p>

      </div>

      {/* Description */}
      <div className="mb-4 w-full px-5">

        <p className="archivo line-clamp-4 text-sm leading-relaxed text-zinc-500">
          {job_description}
        </p>

      </div>

      {/* Footer */}
      <div className="mx-5 grid grid-cols-2 gap-x-3 gap-y-2 border-t border-zinc-200 pt-3.5 sm:grid-cols-4">

        <div className="flex min-w-0 items-center gap-2">

          <FaLocationDot
            className="shrink-0"
            color="#b8b6b6"
          />

          <p className="archivo truncate text-sm text-zinc-500">
            {location}
          </p>

        </div>

        <div className="flex min-w-0 items-center gap-2">

          <FaBriefcase
            className="shrink-0"
            color="#b8b6b6"
          />

          <p className="archivo truncate text-sm text-zinc-500">
            {job_type}
          </p>

        </div>

        <div className="flex min-w-0 items-center gap-2">

          <FaHelmetSafety
            className="shrink-0"
            color="#b8b6b6"
          />

          <p className="archivo truncate text-sm text-zinc-500">
            {experience}
          </p>

        </div>

        <div className="flex min-w-0 items-center gap-1">

          <FaPesoSign
            className="shrink-0"
            color="#b8b6b6"
          />

          <p className="archivo truncate text-sm font-semibold text-zinc-500">
            {salaryRange}
          </p>

        </div>

      </div>

    </div>
  );
}

/*
 * ============================================================
 * JOB CARD SKELETON
 * ============================================================
 */

function JobCardSkeleton() {
  return (
    <div className="flex w-full animate-pulse flex-col items-center rounded-md border border-gray-200 py-5 shadow-sm">

      <div className="mb-3 flex w-full justify-between gap-4 px-5">

        <div className="flex h-auto gap-2">

          <div className="h-13 w-13 rounded-md bg-zinc-200" />

          <div className="flex flex-col justify-center gap-2">

            <div className="h-4 w-32 rounded bg-zinc-200" />

            <div className="h-3 w-20 rounded bg-zinc-200" />

          </div>

        </div>

        <div className="flex h-full items-center justify-center">

          <div className="h-3 w-24 rounded bg-zinc-200" />

        </div>

      </div>

      <div className="mb-3 flex w-full flex-col gap-2 px-5 py-2">

        <div className="h-3 w-full rounded bg-zinc-200" />

        <div className="h-3 w-full rounded bg-zinc-200" />

        <div className="h-3 w-full rounded bg-zinc-200" />

        <div className="h-3 w-2/3 rounded bg-zinc-200" />

      </div>

      <div className="grid h-12 w-[95%] grid-cols-4 border-t border-zinc-300 px-2">

        <div className="flex items-center gap-2">

          <div className="h-4 w-4 rounded-full bg-zinc-200" />

          <div className="h-3 w-16 rounded bg-zinc-200" />

        </div>

        <div className="flex items-center gap-2">

          <div className="h-4 w-4 rounded-full bg-zinc-200" />

          <div className="h-3 w-16 rounded bg-zinc-200" />

        </div>

        <div className="flex items-center gap-2">

          <div className="h-4 w-4 rounded-full bg-zinc-200" />

          <div className="h-3 w-16 rounded bg-zinc-200" />

        </div>

        <div className="flex items-center gap-2">

          <div className="h-4 w-4 rounded-full bg-zinc-200" />

          <div className="h-3 w-20 rounded bg-zinc-200" />

        </div>

      </div>

    </div>
  );
}

/*
 * ============================================================
 * NO JOBS FOUND
 * ============================================================
 */

function NoJobsFound() {
  return (
    <div className="flex w-full flex-col items-center justify-center rounded-md border border-gray-200 px-5 py-16 text-center">

      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-zinc-100">

        <FaMagnifyingGlass
          className="text-zinc-400"
          size={22}
        />

      </div>

      <p className="archivo mb-1 font-medium text-zinc-700">
        No jobs found
      </p>

      <p className="archivo max-w-xs text-sm font-normal text-zinc-500">
        We couldn't find any jobs matching
        your search. Try adjusting your
        filters or check back later.
      </p>

    </div>
  );
}

/*
 * ============================================================
 * SEARCH BAR
 * ============================================================
 */

function JobSearchBar({
  results,
  search,
  onChange,
  onSearch,
}: JobSearchBarType) {
  return (
    <div className="flex flex-col">

      <div className="relative flex h-12 w-full items-center gap-2 rounded-md border-2 border-gray-200 px-3 shadow-xs">

        <RiSearchAiLine
          color="#b8b6b6"
          size={21}
        />

        <input
          type="text"
          value={search}
          onChange={onChange}
          className="archivo h-full w-[80%] text-base text-zinc-500 outline-none"
          placeholder="Search jobs...."
        />

        <button
          className="archivo absolute right-0 h-full w-[20%] rounded-md bg-red-700 text-white"
          onClick={onSearch}
        >
          Search
        </button>

      </div>

      {search && (
        <span className="archivo mt-4 ml-1 flex gap-1 text-sm text-zinc-400">

          <p>Showing</p>

          <p>
            {results ?? 12} total jobs for
          </p>

          <p className="font-semibold text-gray-600">
            {search}
          </p>

        </span>
      )}

    </div>
  );
}