import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { jobListingApi } from "../../service/api/employee/jobListingService";
import type { JobListingDetailData } from "../../types/JobListingTypes";

export default function JobListingDetail() {
  const [jobListingData, setJobListingData] = useState<JobListingDetailData>();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Pagination state for table
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(5);

  const [searchParams] = useSearchParams();
  const job_id = searchParams.get("job_id");

  const fetchJobDetail = async (id: string | null) => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      const data = await jobListingApi.getJobListing(Number(id));
      setJobListingData(data.data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch job details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (job_id) {
      fetchJobDetail(job_id);
    }
  }, [job_id]);

  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center p-12 bg-[#FAF9F6]">
        <span className="archivo text-sm text-[#6B6F76]">Loading job details...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-screen flex items-center justify-center p-12 bg-[#FAF9F6]">
        <span className="archivo text-sm text-[#991B1B]">{error}</span>
      </div>
    );
  }

  if (!jobListingData) {
    return (
      <div className="w-full h-screen flex items-center justify-center p-12 bg-[#FAF9F6]">
        <span className="archivo text-sm text-[#6B6F76]">No job selected.</span>
      </div>
    );
  }

  const labelClass = "archivo text-[11px] font-semibold uppercase tracking-wider text-[#6B6F76] mb-1 block";

  const mockApplicants = [
    { id: 101, name: "Juan Dela Cruz", email: "juan@example.com", date: "2026-09-17", status: "Under Review" },
    { id: 102, name: "Maria Clara", email: "maria@example.com", date: "2026-09-16", status: "Shortlisted" },
    { id: 103, name: "Crisostomo Ibarra", email: "ibarra@example.com", date: "2026-09-15", status: "Rejected" },
    { id: 104, name: "Elias Salome", email: "elias@example.com", date: "2026-09-14", status: "Shortlisted" },
    { id: 105, name: "Sisa Santos", email: "sisa@example.com", date: "2026-09-13", status: "Under Review" },
    { id: 106, name: "Basilio Santos", email: "basilio@example.com", date: "2026-09-12", status: "Shortlisted" },
    { id: 107, name: "Crispin Santos", email: "crispin@example.com", date: "2026-09-11", status: "Under Review" },
    { id: 108, name: "Padre Damaso", email: "damaso@example.com", date: "2026-09-10", status: "Rejected" },
    { id: 109, name: "Captain Tiago", email: "tiago@example.com", date: "2026-09-09", status: "Shortlisted" },
    { id: 110, name: "Dona Victorina", email: "victorina@example.com", date: "2026-09-08", status: "Under Review" },
  ];

  const totalItems = mockApplicants.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentApplicants = mockApplicants.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="w-full h-screen p-6 bg-[#FAF9F6] flex flex-col gap-6 overflow-hidden">
      
      {/* FIXED TOP SECTION */}
      <div className="w-full bg-white border border-[#E3E0D8] rounded-xl p-5 shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-6 shrink-0">
        
        {/* Left: Job Information */}
        <div className="lg:col-span-4 border-b lg:border-b-0 lg:border-r border-[#E3E0D8] pb-4 lg:pb-0 lg:pr-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="archivo text-xs text-[#6B6F76] font-medium">
                Job Listing #{jobListingData.job_id}
              </span>
              <span className="archivo text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                Active
              </span>
            </div>

            <h1 className="font-serif text-2xl text-[#1C2321] mb-3 font-bold leading-tight">
              {jobListingData.job_title}
            </h1>

            <div className="grid grid-cols-2 gap-2 mb-2">
              <div className="bg-[#FAF9F6] p-2 rounded-lg border border-[#E3E0D8]">
                <span className={labelClass}>Employment Type</span>
                <span className="text-xs font-semibold text-[#1C2321]">{jobListingData.employment_type}</span>
              </div>
              <div className="bg-[#FAF9F6] p-2 rounded-lg border border-[#E3E0D8]">
                <span className={labelClass}>Vacant Positions</span>
                <span className="text-xs font-semibold text-[#1C2321]">{jobListingData.vacant_position} Position(s)</span>
              </div>
            </div>

            <div className="bg-[#FAF9F6] p-2 rounded-lg border border-[#E3E0D8] mb-2">
              <span className={labelClass}>Salary Range</span>
              <span className="text-xs font-bold text-[#991B1B]">
                ₱{jobListingData.minimum_salary.toLocaleString()} – ₱{jobListingData.maximum_salary.toLocaleString()}
              </span>
            </div>

            <div>
              <span className={labelClass}>Description</span>
              <p className="text-xs text-[#1C2321] bg-[#FAF9F6] p-2 rounded-lg border border-[#E3E0D8] leading-relaxed line-clamp-2">
                {jobListingData.job_description}
              </p>
            </div>
          </div>

          <div className="mt-2 pt-2 border-t border-[#E3E0D8] flex justify-between text-[10px] text-[#6B6F76] archivo">
            <span>Posted: {new Date(jobListingData.posted_at).toLocaleDateString()}</span>
            <span>Until: {new Date(jobListingData.posted_until).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Center: Statistics Grid */}
        <div className="lg:col-span-4 border-b lg:border-b-0 lg:border-r border-[#E3E0D8] pb-4 lg:pb-0 lg:px-6 flex flex-col justify-between">
          <div>
            <h3 className="archivo text-xs font-bold uppercase tracking-wider text-[#6B6F76] mb-3">
              Mock Statistics
            </h3>
            <div className="grid grid-cols-2 gap-2.5">
              <div className="bg-[#FAF9F6] p-3 rounded-xl border border-[#E3E0D8] hover:border-[#D8D5CD] transition-colors">
                <span className={labelClass}>Total Applicants</span>
                <div className="flex items-baseline justify-between mt-1">
                  <span className="text-xl font-bold text-[#1C2321]">48</span>
                  <span className="text-[10px] text-emerald-600 font-medium">+12%</span>
                </div>
              </div>

              <div className="bg-[#FAF9F6] p-3 rounded-xl border border-[#E3E0D8] hover:border-[#D8D5CD] transition-colors">
                <span className={labelClass}>Shortlisted</span>
                <div className="flex items-baseline justify-between mt-1">
                  <span className="text-xl font-bold text-[#1C2321]">12</span>
                  <span className="text-[10px] text-emerald-600 font-medium">+3 this week</span>
                </div>
              </div>

              <div className="bg-[#FAF9F6] p-3 rounded-xl border border-[#E3E0D8] hover:border-[#D8D5CD] transition-colors">
                <span className={labelClass}>Under Review</span>
                <div className="flex items-baseline justify-between mt-1">
                  <span className="text-xl font-bold text-[#1C2321]">28</span>
                  <span className="text-[10px] text-[#6B6F76]">Pending</span>
                </div>
              </div>

              <div className="bg-[#FAF9F6] p-3 rounded-xl border border-[#E3E0D8] hover:border-[#D8D5CD] transition-colors">
                <span className={labelClass}>Conversion Rate</span>
                <div className="flex items-baseline justify-between mt-1">
                  <span className="text-xl font-bold text-[#991B1B]">25%</span>
                  <span className="text-[10px] text-emerald-600 font-medium">High</span>
                </div>
              </div>
            </div>
          </div>

          {/* Minimum Qualifications preview */}
          {jobListingData.requirements && (
            <div className="mt-2 bg-[#FAF9F6] p-2 rounded-xl border border-[#E3E0D8]">
              <span className={labelClass}>Qualifications</span>
              <div className="flex justify-between text-xs text-[#1C2321] font-medium">
                <span>Education: {jobListingData.requirements.highest_education}</span>
                <span>Experience: {jobListingData.requirements.experience} yr(s)</span>
              </div>
            </div>
          )}
        </div>

        {/* Right: Applicants Per Day Graph */}
        <div className="lg:col-span-4 lg:pl-2 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-3">
              <h3 className="archivo text-xs font-bold uppercase tracking-wider text-[#6B6F76]">
                Applicants Per Day
              </h3>
              <span className="text-[10px] text-[#6B6F76] bg-[#FAF9F6] px-2 py-0.5 rounded border border-[#E3E0D8]">
                This Week
              </span>
            </div>

            <div className="bg-[#FAF9F6] h-40 rounded-xl border border-[#E3E0D8] p-3 flex items-end justify-between gap-2">
              {[
                { day: "Mon", count: 8, height: "h-[40%]" },
                { day: "Tue", count: 14, height: "h-[70%]" },
                { day: "Wed", count: 20, height: "h-[100%]" },
                { day: "Thu", count: 10, height: "h-[50%]" },
                { day: "Fri", count: 6, height: "h-[30%]" },
              ].map((bar) => (
                <div key={bar.day} className="flex-1 flex flex-col items-center gap-1 h-full justify-end group">
                  <span className="text-[10px] font-semibold text-[#1C2321] group-hover:text-[#991B1B] transition-colors">
                    {bar.count}
                  </span>
                  <div className={`w-full bg-[#991B1B] group-hover:bg-[#7F1D1D] rounded-t-sm transition-all ${bar.height}`} />
                  <span className="archivo text-[9px] text-[#6B6F76] font-medium">{bar.day}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* SCROLLABLE BOTTOM SECTION */}
      <div className="w-full bg-white border border-[#E3E0D8] rounded-xl p-5 shadow-sm flex flex-col flex-1 overflow-hidden">
        
        {/* Header Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-3 pb-3 border-b border-[#E3E0D8] shrink-0">
          <div>
            <h2 className="font-serif text-xl text-[#1C2321] font-bold">Job Applications</h2>
            <p className="archivo text-xs text-[#6B6F76]">Showing recent applicants</p>
          </div>

          <div className="flex items-center gap-3">
            <span className="archivo text-xs text-[#6B6F76]">Show per page:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="border border-[#D8D5CD] bg-white text-xs text-[#1C2321] rounded p-1.5 focus:outline-none focus:ring-1 focus:ring-[#991B1B]"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
            </select>
          </div>
        </div>

        {/* Scrollable Table Content */}
        <div className="flex-1 overflow-y-auto border border-[#E3E0D8] rounded-lg">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="sticky top-0 bg-[#FAF9F6] z-10 border-b border-[#E3E0D8]">
              <tr className="archivo text-[11px] text-[#6B6F76] uppercase tracking-wider font-semibold">
                <th className="p-3">Applicant Name</th>
                <th className="p-3">Email</th>
                <th className="p-3">Application Date</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E3E0D8] bg-white">
              {currentApplicants.map((app) => (
                <tr key={app.id} className="hover:bg-[#FAF9F6] transition-colors">
                  <td className="p-3 font-medium text-[#1C2321]">{app.name}</td>
                  <td className="p-3 text-[#6B6F76] text-xs">{app.email}</td>
                  <td className="p-3 text-[#6B6F76] text-xs">{app.date}</td>
                  <td className="p-3">
                    <span className={`archivo text-[11px] px-2.5 py-1 rounded-full font-medium border ${
                      app.status === "Shortlisted" 
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : app.status === "Under Review"
                        ? "bg-amber-50 text-amber-700 border-amber-200"
                        : "bg-rose-50 text-rose-700 border-rose-200"
                    }`}>
                      {app.status}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <button className="archivo text-xs text-[#991B1B] hover:text-[#7F1D1D] hover:underline font-semibold transition-colors">
                      View Application
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="flex items-center justify-between pt-3 mt-2 text-xs archivo text-[#6B6F76] shrink-0">
          <span>
            Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, totalItems)} of {totalItems} applicants
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 border border-[#D8D5CD] rounded bg-white hover:bg-[#FAF9F6] disabled:opacity-40 disabled:cursor-not-allowed transition-colors font-medium text-[#1C2321]"
            >
              Previous
            </button>
            <span className="px-2 font-medium text-[#1C2321]">
              {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
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