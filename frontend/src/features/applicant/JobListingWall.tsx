import { FaMagnifyingGlass } from "react-icons/fa6";
import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

import {
  FaLocationDot,
  FaBriefcase,
  FaPesoSign,
  FaHelmetSafety,
} from "react-icons/fa6";
import { RiSearchAiLine } from "react-icons/ri";
import { jobListingService } from "../../service/api/applicants/jobListingService";
import type { PaginatedJobs } from "../../types/JobListingTypes";

import JobDetailPanel from "../../components/common/JobDetail";
import JobDetailSkeleton from "../../components/common/JobDetailSkeleton";
import axios from "axios";
import type { JobDetail } from "../../types/JobDetailType";

export default function JobListingWall() {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedJobId = searchParams.get("job");

  const [jobData, setJobData] = useState<PaginatedJobs | null>(null);
  const [jobDetail, setJobDetail] = useState<JobDetail | null>(null);
  const [nextPage, setNextPage] = useState<number>(2);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [detailError, setDetailError] = useState(false);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const handleSelectJob = (id: string) => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.set("job", id);
        return next;
      },
      { preventScrollReset: true },
    );
  };

  const fetchJobListingInitial = async () => {
    try {
      setLoading(true);
      const res = await jobListingService.fetchJobListings();
      setNextPage(res.data.current_page + 1);
      setJobData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Load the job list once on mount
  useEffect(() => {
    fetchJobListingInitial();
  }, []);

  // Load the job detail whenever the selected job (?job=) changes
  useEffect(() => {
    if (!selectedJobId) {
      setJobDetail(null);
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        setLoadingDetail(true);
        setDetailError(false);
        const res = await axios.get(
          `http://localhost:8000/api/job_listing/${selectedJobId}`,
        );
        if (!cancelled) setJobDetail(res.data);
      } catch (err) {
        console.error(err);
        if (!cancelled) setDetailError(true);
      } finally {
        if (!cancelled) setLoadingDetail(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [selectedJobId]);

  const handleScroll = async (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 1;

    if (!atBottom || loadingMore || !jobData) return;
    if (jobData.current_page >= jobData.last_page) return;

    try {
      setLoadingMore(true);
      const res = await jobListingService.fetchJobListings(nextPage);
      const fetched = res.data;

      setJobData((prev) => ({
        ...fetched,
        data: [...(prev?.data ?? []), ...fetched.data],
      }));
      setNextPage(fetched.current_page + 1);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingMore(false);
    }
  };

  const hasNoJobs = !loading && jobData && jobData.data.length === 0;

  return (
    <div className="w-full h-full flex justify-center px-10 py-6 bg-zinc-50 gap-5">
      {/* SIDE FILTERING */}
      <aside className="w-[18%] h-full">
        <div className="w-full h-full bg-white border border-gray-200 rounded-xl shadow-sm overflow-y-auto">
          <div className="w-full h-[10%] min-h-[56px] border-b border-gray-200 flex items-center justify-between px-4">
            <p className="archivo font-semibold text-[16px] text-zinc-900">
              Filtering
            </p>
            <p className="archivo text-red-800 text-xs font-medium cursor-pointer hover:text-red-600 transition-colors">
              Clear filter
            </p>
          </div>
          <JobTypeFilter />
          <JobLocationFilter />
          <JobExperienceFilter />
          <JobSalaryFilter />
        </div>
      </aside>

      {/* LISTING WALL */}
      <div
        className="w-[40%] max-h-full bg-white border border-gray-200 rounded-xl shadow-sm px-4 py-4 overflow-auto flex flex-col gap-5"
        onScroll={handleScroll}
      >
        <JobSearchBar search={search} onChange={handleSearch} />

        {loading && (
          <>
            <JobCardSkeleton />
            <JobCardSkeleton />
            <JobCardSkeleton />
          </>
        )}

        {hasNoJobs && <NoJobsFound />}

        {jobData?.data.map((item) => (
          <JobCard
            key={item.job_id}
            job_id={String(item.job_id)}
            selected={String(item.job_id) === selectedJobId}
            onSelect={handleSelectJob}
            job_title={item.job_title}
            location="Pasig City"
            job_description={item.job_description}
            job_type={item.employment_type}
            experience_required="12"
            min_salary={item.minimum_salary}
            max_salary={item.maximum_salary}
          />
        ))}

        {loadingMore && <JobCardSkeleton />}
      </div>

      {/* LISTING INFORMATION */}
      <div className="w-[35%] max-h-full bg-white border border-gray-200 rounded-xl shadow-sm">
        {loadingDetail ? (
          <JobCardSkeleton/>
        ) : jobDetail ? (
          <JobDetailPanel job={jobDetail} />
        ) : (
          <div className="h-full flex items-center justify-center px-10 text-center">
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

function JobTypeFilter() {
  const jobTypes = [
    { name: "Full-time", id: "fulltime" },
    { name: "Part-time", id: "parttime" },
    { name: "Contractual", id: "contractual" },
    { name: "Volunteer", id: "volunteer" },
    { name: "Internship", id: "internship" },
  ];

  return (
    <div className="w-full h-[23%] border-b border-gray-200 px-4 py-4">
      <p className="font-semibold text-sm text-zinc-800 mb-3">Job type</p>
      <form className="grid grid-cols-2 gap-y-2.5 gap-x-2">
        {jobTypes.map((item) => (
          <div key={item.id} className="flex items-center gap-2">
            <input
              type="checkbox"
              id={item.id}
              name="jobType"
              value={item.name}
              className="w-4 h-4 rounded border-gray-300 text-red-800 focus:ring-red-500 focus:ring-offset-0 cursor-pointer accent-red-800"
            />
            <label
              htmlFor={item.id}
              className="archivo text-sm text-zinc-600 cursor-pointer select-none"
            >
              {item.name}
            </label>
          </div>
        ))}
      </form>
    </div>
  );
}

function JobLocationFilter() {
  return (
    <div className="w-full h-[17%] border-b border-gray-200 px-4 py-4">
      <p className="font-semibold text-sm text-zinc-800 mb-3">Location</p>
      <form>
        <div className="flex items-center h-10 w-full border border-gray-300 rounded-lg px-3 gap-2 focus-within:border-red-500 focus-within:ring-1 focus-within:ring-red-500 transition-all">
          <FaLocationDot className="text-zinc-400 text-sm shrink-0" />
          <input
            type="text"
            className="w-full archivo text-sm h-full outline-none placeholder-zinc-400 bg-transparent"
            placeholder="Location"
          />
        </div>
      </form>
    </div>
  );
}

function JobExperienceFilter() {
  const yearExperience = [
    { name: "0 yr", id: "exp-0" },
    { name: "1-2 yrs", id: "exp-1-2" },
    { name: "3-5 yrs", id: "exp-3-5" },
    { name: "5-7 yrs", id: "exp-5-7" },
    { name: "8+", id: "exp-8+" },
  ];

  return (
    <div className="w-full h-[23%] border-b border-gray-200 px-4 py-4">
      <p className="font-semibold text-sm text-zinc-800 mb-3">Experience</p>
      <form className="grid grid-cols-2 gap-y-2.5 gap-x-2">
        {yearExperience.map((item) => (
          <div key={item.id} className="flex items-center gap-2">
            <input
              type="checkbox"
              id={item.id}
              name="experience"
              value={item.name}
              className="w-4 h-4 rounded border-gray-300 text-red-800 focus:ring-red-500 focus:ring-offset-0 cursor-pointer accent-red-800"
            />
            <label
              htmlFor={item.id}
              className="archivo text-sm text-zinc-600 cursor-pointer select-none"
            >
              {item.name}
            </label>
          </div>
        ))}
      </form>
    </div>
  );
}

function JobSalaryFilter() {
  return (
    <div className="w-full h-[18%] px-4 py-4">
      <p className="font-semibold text-sm text-zinc-800 mb-3">Salary range</p>
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-lg border border-gray-300 h-10 flex items-center gap-2 px-3 focus-within:border-red-500 focus-within:ring-1 focus-within:ring-red-500 transition-all">
          <FaPesoSign className="text-zinc-400 text-sm shrink-0" />
          <input
            type="text"
            placeholder="Min"
            className="archivo text-sm outline-none w-full placeholder-zinc-400 bg-transparent"
          />
        </div>
        <div className="rounded-lg border border-gray-300 h-10 flex items-center gap-2 px-3 focus-within:border-red-500 focus-within:ring-1 focus-within:ring-red-500 transition-all">
          <FaPesoSign className="text-zinc-400 text-sm shrink-0" />
          <input
            type="text"
            placeholder="Max"
            className="archivo text-sm outline-none w-full placeholder-zinc-400 bg-transparent"
          />
        </div>
      </div>
    </div>
  );
}

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
}: {
  job_id: string;
  selected?: boolean;
  onSelect: (id: string) => void;
  job_title: string;
  location: string;
  job_description: string;
  job_type: string;
  experience_required: string;
  min_salary: number;
  max_salary: number;
}) {
  const salaryRange = `${min_salary} - ${max_salary}`;
  const experience = `${experience_required}+ years`;

  return (
    <div
      role="button"
      tabIndex={0}
      aria-pressed={selected}
      id={`job-${job_id}`}
      onClick={() => onSelect(job_id)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect(job_id);
        }
      }}
      className={`w-full rounded-md border shadow-sm py-5 flex flex-col items-center cursor-pointer transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 ${
        selected
          ? "border-red-700 ring-1 ring-red-700"
          : "border-gray-200 hover:border-gray-300"
      }`}
    >
      <div className="w-full flex justify-between px-5 gap-4 mb-3">
        <div className="flex gap-2 h-auto">
          <div className="w-13 h-13 rounded-md bg-zinc-700 shadow-sm"></div>
          <div className="flex flex-col">
            <p className="archivo font-medium ">{job_title}</p>
            <p className="archivo font-normal text-sm text-zinc-600">
              {location}
            </p>
          </div>
        </div>
        <div className="flex items-center h-full justify-center ">
          <p className="archivo text-sm font-normal text-zinc-500">
            Posted 3 hours ago
          </p>
        </div>
      </div>
      <div className="w-full py-2 px-5 mb-3">
        <p className="archivo text-sm text-zinc-500 line-clamp-4 text-justify">
          {job_description}
        </p>
      </div>
      <div className="w-[95%] h-12 border-t border-zinc-300 grid grid-cols-4 px-2 ">
        <div className="flex items-center  gap-1">
          <FaLocationDot color="#b8b6b6" />
          <p className="archivo text-zinc-500 text-sm">{location}</p>
        </div>
        <div className="flex items-center gap-2">
          <FaBriefcase color="#b8b6b6" />
          <p className="archivo text-zinc-500 text-sm">{job_type}</p>
        </div>
        <div className="flex items-center  gap-2">
          <FaHelmetSafety color="#b8b6b6" />
          <p className="archivo text-zinc-500 text-sm">{experience}</p>
        </div>
        <div className="flex items-center gap-1">
          <FaPesoSign color="#b8b6b6" />
          <p className="archivo text-zinc-500 text-sm font-semibold">
            {salaryRange}
          </p>
        </div>
      </div>
    </div>
  );
}

function JobCardSkeleton() {
  return (
    <div className="w-full rounded-md border border-gray-200 shadow-sm py-5 flex flex-col items-center animate-pulse">
      <div className="w-full flex justify-between px-5 gap-4 mb-3">
        <div className="flex gap-2 h-auto">
          <div className="w-13 h-13 rounded-md bg-zinc-200"></div>
          <div className="flex flex-col gap-2 justify-center">
            <div className="h-4 w-32 rounded bg-zinc-200"></div>
            <div className="h-3 w-20 rounded bg-zinc-200"></div>
          </div>
        </div>
        <div className="flex items-center h-full justify-center">
          <div className="h-3 w-24 rounded bg-zinc-200"></div>
        </div>
      </div>

      <div className="w-full py-2 px-5 mb-3 flex flex-col gap-2">
        <div className="h-3 w-full rounded bg-zinc-200"></div>
        <div className="h-3 w-full rounded bg-zinc-200"></div>
        <div className="h-3 w-full rounded bg-zinc-200"></div>
        <div className="h-3 w-2/3 rounded bg-zinc-200"></div>
      </div>

      <div className="w-[95%] h-12 border-t border-zinc-300 grid grid-cols-4 px-2">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-zinc-200"></div>
          <div className="h-3 w-16 rounded bg-zinc-200"></div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-zinc-200"></div>
          <div className="h-3 w-16 rounded bg-zinc-200"></div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-zinc-200"></div>
          <div className="h-3 w-16 rounded bg-zinc-200"></div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-zinc-200"></div>
          <div className="h-3 w-20 rounded bg-zinc-200"></div>
        </div>
      </div>
    </div>
  );
}

function NoJobsFound() {
  return (
    <div className="w-full rounded-md border border-gray-200 py-16 flex flex-col items-center justify-center text-center px-5">
      <div className="w-16 h-16 rounded-full bg-zinc-100 flex items-center justify-center mb-4">
        <FaMagnifyingGlass className="text-zinc-400" size={22} />
      </div>
      <p className="archivo font-medium text-zinc-700 mb-1">No jobs found</p>
      <p className="archivo font-normal text-sm text-zinc-500 max-w-xs">
        We couldn't find any jobs matching your search. Try adjusting your
        filters or check back later.
      </p>
    </div>
  );
}

type JobSearchBarType = {
  results?: number;
  search?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSearch?: () => void;
};

function JobSearchBar({
  results,
  search,
  onChange,
  onSearch,
}: JobSearchBarType) {
  return (
    <div className="flex flex-col">
      <div className="w-full h-12 border-2 border-gray-200 shadow-xs rounded-md flex items-center px-3 gap-2 relative">
        <RiSearchAiLine color="#b8b6b6" size={21} />
        <input
          type="text"
          value={search}
          onChange={onChange}
          className="w-[80%] h-full outline-none archivo text-base text-zinc-500"
          placeholder="Search jobs...."
        />
        <button
          className="archivo text-white w-[20%] h-full bg-red-700 rounded-md absolute right-0"
          onClick={onSearch}
        >
          Search
        </button>
      </div>
      {search && (
        <span className="flex archivo text-sm text-zinc-400 gap-1 mt-4 ml-1">
          <p>Showing</p> <p>{results ?? 12} total jobs for</p>{" "}
          <p className="font-semibold text-gray-600">{search}</p>
        </span>
      )}
    </div>
  );
}