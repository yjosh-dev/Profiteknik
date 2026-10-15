import { useEffect, useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import type { HeaderSelectionTypes } from "../../types/MyJobsType";
import { applicantsMyJobService } from "../../service/api/applicants/applicantsMyJobsService";

interface MyJobsCounts {
  applicant_id: number;
  pending: number;
  shortlisted: number;
  interviews: number;
  rejected: number;
}

export default function MyJobs() {
  const [selectionData, setSelectionData] = useState<HeaderSelectionTypes>([
    { name: "Saved", count: 0 },
    { name: "Pending", count: 0 },
    { name: "Shortlisted", count: 0 },
    { name: "Interviews", count: 0 },
    { name: "Rejected", count: 0 },
  ]);

  useEffect(() => {
    const fetchMyJobs = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const response = await applicantsMyJobService.fetchMyJobs(token);
        const data = response.data as MyJobsCounts;

        setSelectionData([
          { name: "Saved", count: 0 },
          { name: "Pending", count: data.pending ?? 0 },
          { name: "Shortlisted", count: data.shortlisted ?? 0 },
          { name: "Interviews", count: data.interviews ?? 0 },
          { name: "Rejected", count: data.rejected ?? 0 },
        ]);
      } catch (error) {
        console.error("Failed to fetch my jobs:", error);
      }
    };

    fetchMyJobs();
  }, []);

  const getCount = (name: string) =>
    selectionData.find((s) => s.name === name)?.count ?? 0;

  return (
    <div className="w-dvw flex justify-center py-10">
      <div className="w-[60%] flex flex-col">
        <Header
          counts={{
            saved: getCount("Saved"),
            pending: getCount("Pending"),
            shortlisted: getCount("Shortlisted"),
            interviews: getCount("Interviews"),
            rejected: getCount("Rejected"),
          }}
        />

        <div className="mt-3 w-full">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

function Header({
  counts,
}: {
  counts: {
    saved: number;
    pending: number;
    shortlisted: number;
    interviews: number;
    rejected: number;
  };
}) {
  const baseTab = "flex flex-col pb-4 transition-colors";
  const inactiveTab = "text-gray-600 hover:text-black";
  const activeTab = "font-semibold text-black border-b-2 border-black";

  return (
    <div className="flex flex-col">
      <h1 className="archivo text-4xl font-bold">My Jobs</h1>

      <div className="flex gap-10 mt-6 border-b border-gray-200">
        {/* Saved */}
        <button className={`${baseTab} ${inactiveTab}`}>
          <span className="text-sm">{counts.saved}</span>
          <span className="text-base">Saved</span>
        </button>

        {/* Pending */}
        <NavLink
          to="/applicant/my_jobs/pending_jobs"
          className={({ isActive }) =>
            `${baseTab} ${isActive ? activeTab : inactiveTab}`
          }
        >
          <span className="text-sm">{counts.pending}</span>
          <span className="text-base">Pending</span>
        </NavLink>

        {/* Shortlisted */}
        <NavLink
          to="/applicant/my_jobs/shortlisted_jobs"
          className={({ isActive }) =>
            `${baseTab} ${isActive ? activeTab : inactiveTab}`
          }
        >
          <span className="text-sm">{counts.shortlisted}</span>
          <span className="text-base">Shortlisted</span>
        </NavLink>

        {/* Interviews */}
        <NavLink
          to="/applicant/my_jobs/interview_jobs"
          className={({ isActive }) =>
            `${baseTab} ${isActive ? activeTab : inactiveTab}`
          }
        >
          <span className="text-sm">{counts.interviews}</span>
          <span className="text-base">Interviews</span>
        </NavLink>

        {/* Rejected */}
        <button className={`${baseTab} ${inactiveTab}`}>
          <span className="text-sm">{counts.rejected}</span>
          <span className="text-base">Rejected</span>
        </button>
      </div>
    </div>
  );
}