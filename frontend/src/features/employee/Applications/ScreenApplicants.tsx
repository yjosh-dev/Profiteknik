import { NavLink, Outlet, useLocation } from "react-router-dom";
import { FaClipboardUser, FaComments, FaUserCheck } from "react-icons/fa6";

export default function ScreenApplicants() {
  interface ScreenApplicantsProps {
    data?: any | null;
  }
  const location = useLocation();
  // Captures current query parameters (e.g., "?job_id=3&applicant_id=1")
  const currentSearch = location.search;

  const tabs = [
    { label: "Evaluation", path: "evaluation", icon: FaClipboardUser },
    { label: "Interview", path: "interview", icon: FaUserCheck },
    { label: "Conversation", path: "conversation", icon: FaComments },
  ];

  return (
    <div className="w-full flex flex-col gap-4 p-4">
      {/* Top Tab Selection Navigation */}
      <nav aria-label="Screening Navigation">
        <ul className="flex items-center bg-white rounded-lg border border-[#E3E0D8] overflow-hidden shadow-sm">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <li
                key={tab.path}
                className="flex-1 border-r border-[#E3E0D8] last:border-r-0"
              >
                <NavLink
                  to={`${tab.path}${currentSearch}`}
                  className={({ isActive }) =>
                    `archivo relative flex items-center justify-center gap-2.5 p-4 text-sm font-bold transition-all ${
                      isActive
                        ? "bg-[#FAF9F6] text-[#991B1B]"
                        : "text-[#1C2321] hover:bg-[#FAF9F6] hover:text-[#991B1B]"
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {/* Icon container with lower contrast colors */}
                      <div
                        className={`w-8 h-8 rounded flex items-center justify-center transition-colors ${
                          isActive
                            ? "bg-[#991B1B]/10 text-[#991B1B]"
                            : "bg-[#E8E6E0] text-[#6B6F76]"
                        }`}
                      >
                        <Icon
                          size={16}
                          className="shrink-0"
                          aria-hidden="true"
                        />
                      </div>

                      {/* Label */}
                      <span>{tab.label}</span>

                      {/* Active Indicator Bar on bottom border */}
                      {isActive && (
                        <span className="absolute bottom-0 left-0 right-0 h-1 bg-[#991B1B]" />
                      )}
                    </>
                  )}
                </NavLink>
              </li>
            );
          })}
          {/* Empty space matching layout grid */}
          <li className="flex-1 hidden md:block" />
        </ul>
      </nav>

      {/* Main Content Area rendered via Outlet */}
      <main className="bg-white border border-[#E3E0D8] rounded-xl shadow-md p-6">
        <Outlet />
      </main>
    </div>
  );
}
