import ContentContainer from "../../components/ui/ContentContainer";
import { FaMagnifyingGlass } from "react-icons/fa6";
import React, { useEffect, useState } from "react";

import {
  FaLocationDot,
  FaBriefcase,
  FaPesoSign,
  FaHelmetSafety,
} from "react-icons/fa6";
import { RiSearchAiLine } from "react-icons/ri";
import { jobListingService } from "../../service/api/applicants/jobListingService";
import type { PaginatedJobs } from "../../types/JobListingTypes";

export default function JobListingWall() {
  type jobDataType = {
    jobData: string[];
    currentPage: number;
    lastPage: number;
    totalListing: number;
  };
  const [jobData, setJobData] = useState<PaginatedJobs | null>(null);
  const [nextPage, setNextPage] = useState();
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const fetchJobListingInitial = async () => {
    try {
      setLoading(true);
      const jobData = await jobListingService.fetchJobListing();
      setNextPage(jobData.data.current_page + 1);
      setJobData(jobData.data);
      console.log(jobData.data);
    } catch (err) {
    } finally {
      setLoading(false);
    }
  };

  const fetchJobListing = async () => {
    try {
      return await jobListingService.fetchJobListing(nextPage);
    } catch (err) {
    } finally {
    }
  };

  useEffect(() => {
    fetchJobListingInitial();
  }, []);

  const handleScroll = async (e: any) => {
    if (
      e.target.scrollTop + e.target.clientHeight >=
      e.target.scrollHeight - 1
    ) {

      if (jobData?.current_page == jobData?.last_page) {
        alert("last_page");
        return;
      }
 
      const fetchListingData = await fetchJobListing();
      const fetchedData = fetchListingData?.data
      const previousData = jobData?.data
      const mergedDataList = [
         ...(previousData ?? []),
         ...fetchedData.data
      ]

      console.log(fetchedData)
      setJobData({
         ...fetchedData,
         data: mergedDataList
      })
    } 
  };

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
        {jobData?.data &&
          jobData.data.map((item, key) => (
            <JobCard
              job_id={item.job_id}
              job_title={item.job_title}
              location="Pasig City"
              job_description={item.job_description}
              job_type={item.employment_type}
              experience_required="12"
              min_salary={item.minimum_salary}
              max_salary={item.maximum_salary}
            />
          ))}
      </div>

      {/* LISTING INFORMATION */}
      <div className="w-[35%] h-full bg-white border border-gray-200 rounded-xl shadow-sm"></div>
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
    { name: "0 yr", id: "0" },
    { name: "1-2 yrs", id: "1-2" },
    { name: "3-5 yrs", id: "3-5" },
    { name: "5-7 yrs", id: "5-7" },
    { name: "8+", id: "8+" },
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
  job_title,
  location,
  job_description,
  job_type,
  experience_required,
  min_salary,
  max_salary,
}: {
  job_id: string;
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
      className="w-full rounded-md border border-gray-200 shadow-sm py-5 flex flex-col items-center cursor-pointer transition-all duration-200 hover:shadow-md hover:border-gray-300 hover:-translate-y-0.5"
      id={job_id}
      onClick={() => alert(job_id)}
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
          <p>Showing</p> <p>{results?.toString()}</p> <p>total jobs for</p>{" "}
          <p className="font-semibold text-gray-600">{search}</p>
        </span>
      )}
    </div>
  );
}
