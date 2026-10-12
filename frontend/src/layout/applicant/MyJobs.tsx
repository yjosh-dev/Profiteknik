import { useEffect, useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import type { HeaderSelectionTypes } from "../../types/MyJobsType";
import { applicantsMyJobService } from "../../service/api/applicants/applicantsMyJobsService";

export default function MyJobs() {
  const [selectionData, setSelectionData] =
    useState<HeaderSelectionTypes>([
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

        if (!token) {
          return;
        }

        const response = await applicantsMyJobService.fetchMyJobs(token);

        const data = response.data;

        setSelectionData([
          {
            name: "Saved",
            count: 0,
          },
          {
            name: "Pending",
            count: data.pending,
          },
          {
            name: "Shortlisted",
            count: data.shortlisted,
          },
          {
            name: "Interviews",
            count: data.interviews,
          },
          {
            name: "Rejected",
            count: data.rejected,
          },
        ]);
      } catch (error) {
        console.error("Failed to fetch my jobs:", error);
      }
    };

    fetchMyJobs();
  }, []);

  return (
    <div className="w-dvw flex justify-center py-10">
      <div className="w-[60%] flex flex-col">

        <Header selectionData={selectionData} />

        <div className="mt-3 w-full">
          <Outlet />
        </div>

      </div>
    </div>
  );
}

function Header({
  selectionData,
}: {
  selectionData: HeaderSelectionTypes;
}) {
  return (
    <div className="flex flex-col">

      {/* Title */}
      <h1 className="archivo text-4xl font-bold">
        My Jobs
      </h1>

      {/* Selection Tabs */}
      <div className="flex gap-8 mt-6 border-b border-gray-200">

        {/* Saved */}
        <button
          className="flex flex-col pb-4 text-gray-600 hover:text-black"
        >
          <span className="text-sm">
            {selectionData[0].count}
          </span>

          <span className="text-base">
            Saved
          </span>
        </button>

        {/* Pending */}
        <NavLink
          to="/applicant/my_jobs/pending_jobs"
          className={({ isActive }) =>
            `flex flex-col pb-4 ${
              isActive
                ? "text-black border-b-2 border-black"
                : "text-gray-600 hover:text-black"
            }`
          }
        >
          <span className="text-sm">
            {selectionData[1].count}
          </span>

          <span className="text-base">
            Pending
          </span>
        </NavLink>

        {/* Shortlisted */}
        <button
          className="flex flex-col pb-4 text-gray-600 hover:text-black"
        >
          <span className="text-sm">
            {selectionData[2].count}
          </span>

          <span className="text-base">
            Shortlisted
          </span>
        </button>

        {/* Interviews */}
        <button
          className="flex flex-col pb-4 text-gray-600 hover:text-black"
        >
          <span className="text-sm">
            {selectionData[3].count}
          </span>

          <span className="text-base">
            Interviews
          </span>
        </button>

        {/* Rejected */}
        <button
          className="flex flex-col pb-4 text-gray-600 hover:text-black"
        >
          <span className="text-sm">
            {selectionData[4].count}
          </span>

          <span className="text-base">
            Rejected
          </span>
        </button>

      </div>
    </div>
  );
}