import { useState, useEffect } from "react";
import axios from "axios";
import {
  MdWorkOutline,
  MdRemoveRedEye,
  MdGroup,
  MdMoreVert,
  MdCheckCircleOutline,
  MdHourglassEmpty,
} from "react-icons/md";
import { IoSearchSharp, IoFilterSharp } from "react-icons/io5";

// Interface matching your Laravel API response model
interface JobListing {
  job_id: number;
  job_title: string;
  minimum_salary: number;
  maximum_salary: number;
  vacant_position: number;
  employment_type: string;
  posted_until: string;
  status: string;
}

// Interface matching Laravel's Paginated JSON structure
interface PaginatedResponse {
  current_page: number;
  data: JobListing[];
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
}

import { type JobListingDetailData } from "../../types/JobListingTypes";
import { jobListingApi } from "../../service/api/employee/jobListingService";
import { NavLink, useNavigate } from "react-router-dom";

export default function ManageJobListing() {
  // API & Pagination States
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [lastPage, setLastPage] = useState<number>(1);
  const [totalJobs, setTotalJobs] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedJob, setSelectedJob] = useState<JobListingDetailData | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const navigate = useNavigate();

  // Function to fetch data from your Laravel endpoint
  const fetchJobListings = async (page: number, searchKeyword: string) => {
    setLoading(true);
    try {
      const response = await axios.get<PaginatedResponse>(
        `http://localhost:8000/api/employee/job_listings`,
        {
          params: {
            page: page,
            search: searchKeyword,
          },
        },
      );

      // Map Laravel pagination response to React state
      setJobs(response.data.data);
      setCurrentPage(response.data.current_page);
      setLastPage(response.data.last_page);
      setTotalJobs(response.data.total);
    } catch (error) {
      console.error("Error fetching job listings:", error);
    } finally {
      setLoading(false);
    }
  };

  // Trigger fetch when page or search term changes
  useEffect(() => {
    fetchJobListings(currentPage, searchTerm);
  }, [currentPage, searchTerm]);

  // Reset to page 1 whenever search query updates
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  // testing of more details
  const onClick = async (job_id: number) => {
     navigate(`/employee/dash/job_listing?job_id=${job_id}`)
  };

  return (
    <div className="w-full flex flex-col gap-6 p-6 bg-[#FAF9F6] min-h-screen select-none">
      {/* ================= TOP SECTION: STATS DASHBOARD ================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Total Jobs & Views */}
        <div className="bg-[#FAF9F6] border border-[#E3E0D8] rounded-xl p-5 flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex items-center justify-between">
              <span className="archivo text-xs uppercase tracking-wider text-[#6B6F76] font-semibold">
                Postings & Traffic
              </span>
              <div className="w-8 h-8 rounded-lg bg-[#F1EFE9] border border-[#E3E0D8] flex items-center justify-center text-[#1C2321]">
                <MdWorkOutline size={16} />
              </div>
            </div>
            <div className="mt-4 flex items-baseline justify-between">
              <div>
                <p className="font-serif text-3xl font-medium text-[#1C2321]">
                  {totalJobs}
                </p>
                <p className="archivo text-xs text-[#6B6F76] mt-0.5">
                  Total Jobs Posted
                </p>
              </div>
              <div className="text-right border-l border-[#E3E0D8] pl-4">
                <p className="font-serif text-3xl font-medium text-[#1C2321] flex items-center gap-1">
                  1,656
                </p>
                <p className="archivo text-xs text-[#6B6F76] mt-0.5 flex items-center justify-end gap-1">
                  <MdRemoveRedEye size={13} /> Total Views
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Applicants Breakdown */}
        <div className="bg-[#FAF9F6] border border-[#E3E0D8] rounded-xl p-5 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between">
            <span className="archivo text-xs uppercase tracking-wider text-[#6B6F76] font-semibold">
              Applicant Breakdown
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#F1EFE9] border border-[#E3E0D8] flex items-center justify-center text-[#1C2321]">
              <MdGroup size={16} />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 mt-4 text-center">
            <div className="bg-[#F1EFE9] border border-[#E3E0D8]/60 rounded-lg p-2">
              <div className="flex items-center justify-center gap-1 text-[#2E6F40] mb-0.5">
                <span className="archivo text-[10px] font-semibold uppercase">
                  Accepted
                </span>
              </div>
              <p className="font-serif text-xl font-medium text-[#1C2321]">
                24
              </p>
            </div>

            <div className="bg-[#F1EFE9] border border-[#E3E0D8]/60 rounded-lg p-2">
              <div className="flex items-center justify-center gap-1 text-[#8B2626] mb-0.5">
                <span className="archivo text-[10px] font-semibold uppercase">
                  Rejected
                </span>
              </div>
              <p className="font-serif text-xl font-medium text-[#1C2321]">
                41
              </p>
            </div>

            <div className="bg-[#F1EFE9] border border-[#E3E0D8]/60 rounded-lg p-2">
              <div className="flex items-center justify-center gap-1 text-[#8A6D1B] mb-0.5">
                <span className="archivo text-[10px] font-semibold uppercase">
                  Waitlisted
                </span>
              </div>
              <p className="font-serif text-xl font-medium text-[#1C2321]">
                16
              </p>
            </div>
          </div>
        </div>

        {/* Card 3: Overall Performance Metrics */}
        <div className="bg-[#FAF9F6] border border-[#E3E0D8] rounded-xl p-5 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between">
            <span className="archivo text-xs uppercase tracking-wider text-[#6B6F76] font-semibold">
              General Overview
            </span>
            <span className="archivo text-[10px] bg-[#F1EFE9] border border-[#E3E0D8] px-2 py-0.5 rounded text-[#6B6F76]">
              All Listings
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-3">
            <div>
              <p className="archivo text-xs text-[#6B6F76]">Conversion Rate</p>
              <p className="font-serif text-2xl font-medium text-[#1C2321] mt-0.5">
                6.7%
              </p>
              <p className="archivo text-[10px] text-[#6B6F76]">
                Views to Applicants
              </p>
            </div>
            <div>
              <p className="archivo text-xs text-[#6B6F76]">
                Avg. Time to Fill
              </p>
              <p className="font-serif text-2xl font-medium text-[#1C2321] mt-0.5">
                18 Days
              </p>
              <p className="archivo text-[10px] text-[#6B6F76]">
                Across open roles
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ================= BOTTOM SECTION: JOB LISTINGS TABLE ================= */}
      <div className="bg-[#FAF9F6] border border-[#E3E0D8] rounded-xl p-5 shadow-xs flex flex-col gap-4">
        {/* Table Controls / Filter Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            <h2 className="font-serif text-xl font-medium text-[#1C2321]">
              Job Listings
            </h2>
            <p className="archivo text-xs text-[#6B6F76] mt-0.5">
              Manage open positions, edit salary ranges, and track applicant
              counts
            </p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Search Input */}
            <div className="h-9 bg-[#F1EFE9] border border-[#E3E0D8] rounded-lg px-3 flex items-center gap-2 focus-within:border-[#1C2321] focus-within:bg-[#FAF9F6] transition-all w-full sm:w-64">
              <IoSearchSharp size={16} className="text-[#6B6F76] shrink-0" />
              <input
                type="text"
                value={searchTerm}
                onChange={handleSearchChange}
                placeholder="Search job title..."
                className="w-full bg-transparent archivo text-xs text-[#1C2321] placeholder-[#6B6F76] outline-none"
              />
            </div>

            {/* Filter Button */}
            <button className="h-9 px-3 bg-[#F1EFE9] border border-[#E3E0D8] rounded-lg flex items-center gap-1.5 archivo text-xs font-medium text-[#1C2321] hover:bg-[#EAE7E1] transition-colors shrink-0">
              <IoFilterSharp size={14} className="text-[#6B6F76]" /> Filter
            </button>
          </div>
        </div>

        {/* Table Container */}
        <div className="w-full overflow-x-auto rounded-lg border border-[#E3E0D8]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F1EFE9] border-b border-[#E3E0D8]">
                <th className="archivo text-[11px] font-semibold uppercase tracking-wider text-[#6B6F76] px-4 py-3">
                  Job Title
                </th>
                <th className="archivo text-[11px] font-semibold uppercase tracking-wider text-[#6B6F76] px-4 py-3">
                  Salary Range
                </th>
                <th className="archivo text-[11px] font-semibold uppercase tracking-wider text-[#6B6F76] px-4 py-3">
                  Type
                </th>
                <th className="archivo text-[11px] font-semibold uppercase tracking-wider text-[#6B6F76] px-4 py-3">
                  Status
                </th>
                <th className="archivo text-[11px] font-semibold uppercase tracking-wider text-[#6B6F76] px-4 py-3 text-center">
                  Vacancies
                </th>
                <th className="archivo text-[11px] font-semibold uppercase tracking-wider text-[#6B6F76] px-4 py-3">
                  Posted Until
                </th>
                <th className="archivo text-[11px] font-semibold uppercase tracking-wider text-[#6B6F76] px-4 py-3 text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E3E0D8]">
              {loading ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-8 text-center archivo text-xs text-[#6B6F76]"
                  >
                    Loading postings...
                  </td>
                </tr>
              ) : jobs.length > 0 ? (
                jobs.map((job) => (
                  <tr
                    key={job.job_id}
                    className="hover:bg-[#F8F7F2] transition-colors group"
                  >
                    {/* Title */}
                    <td className="px-4 py-3.5">
                      <p className="font-serif text-sm font-medium text-[#1C2321] group-hover:underline cursor-pointer">
                        {job.job_title}
                      </p>
                    </td>

                    {/* Pay Range */}
                    <td className="px-4 py-3.5 archivo text-xs text-[#6B6F76]">
                      ${job.minimum_salary.toLocaleString()} - $
                      {job.maximum_salary.toLocaleString()}
                    </td>

                    {/* Employment Type */}
                    <td className="px-4 py-3.5 archivo text-xs text-[#6B6F76]">
                      {job.employment_type}
                    </td>

                    {/* Status Badge */}
                    <td className="px-4 py-3.5">
                      <StatusBadge status={job.status} />
                    </td>

                    {/* Vacant Positions */}
                    <td className="px-4 py-3.5 archivo text-xs text-[#1C2321] font-medium text-center">
                      {job.vacant_position}
                    </td>

                    {/* Posted Until */}
                    <td className="px-4 py-3.5 archivo text-xs text-[#6B6F76]">
                      {job.posted_until}
                    </td>

                    {/* Actions Menu */}
                    <td className="px-4 py-3.5 text-right">
                      <button
                        type="button"
                        aria-label="Actions"
                        className="w-7 h-7 rounded-md inline-flex items-center justify-center text-[#6B6F76] hover:text-[#1C2321] hover:bg-[#EAE7E1] transition-colors"
                      >
                        <MdMoreVert
                          size={18}
                          onClick={() => onClick(job.job_id)}
                        />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-8 text-center archivo text-xs text-[#6B6F76]"
                  >
                    No job listings found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar Controls */}
        <div className="flex items-center justify-between text-xs text-[#6B6F76] pt-2">
          <p className="archivo">
            Page{" "}
            <span className="font-semibold text-[#1C2321]">{currentPage}</span>{" "}
            of <span className="font-semibold text-[#1C2321]">{lastPage}</span>
          </p>

          <div className="flex items-center gap-2">
            <button
              disabled={currentPage === 1 || loading}
              onClick={() => setCurrentPage((prev) => prev - 1)}
              className="px-3 py-1.5 bg-[#F1EFE9] border border-[#E3E0D8] rounded-md archivo text-xs font-medium text-[#1C2321] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#EAE7E1] transition-colors"
            >
              Previous
            </button>

            <button
              disabled={currentPage === lastPage || loading}
              onClick={() => setCurrentPage((prev) => prev + 1)}
              className="px-3 py-1.5 bg-[#F1EFE9] border border-[#E3E0D8] rounded-md archivo text-xs font-medium text-[#1C2321] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#EAE7E1] transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

{
  /* Helper Status Badge */
}
function StatusBadge({ status }: { status: string }) {
  const normalizedStatus = status.toLowerCase();

  if (normalizedStatus === "active" || normalizedStatus === "open") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#EBF5ED] border border-[#C5E3CA] text-[#2E6F40] archivo text-[11px] font-medium">
        <span className="w-1.5 h-1.5 rounded-full bg-[#2E6F40]" />
        Active
      </span>
    );
  }

  if (normalizedStatus === "closed") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#FDF2F2] border border-[#F8C4C4] text-[#8B2626] archivo text-[11px] font-medium">
        <span className="w-1.5 h-1.5 rounded-full bg-[#8B2626]" />
        Closed
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#F1EFE9] border border-[#E3E0D8] text-[#6B6F76] archivo text-[11px] font-medium">
      <span className="w-1.5 h-1.5 rounded-full bg-[#6B6F76]" />
      Draft
    </span>
  );
}

{
  /* More Details - Individual Data of Job Listing */
}


