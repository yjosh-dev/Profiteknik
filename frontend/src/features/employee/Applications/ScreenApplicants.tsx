import { NavLink, Outlet, useLocation } from "react-router-dom";
import { FaClipboardUser, FaComments, FaUserCheck } from "react-icons/fa6";

export default function ScreenApplicants() {
  const location = useLocation();
  // Captures current query parameters (e.g., "?job_id=3&applicant_id=1")
  const currentSearch = location.search;

  const tabs = [
    { label: "Evaluation", path: "evaluation", icon: FaClipboardUser },
    { label: "Interview", path: "interview", icon: FaUserCheck },
    { label: "Conversation", path: "conversation", icon: FaComments },
  ];

  return (
    <div className="w-full p-4 ">
      {/* One card holds both the tabs and the content */}
      <div className="bg-white overflow-hidden">
        {/* Tabs: a single divider line underneath, no boxes around each tab */}
        <nav aria-label="Screening Navigation">
          <ul className="flex items-stretch gap-1 px-3 border-b border-[#E3E0D8] overflow-hidden">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <li key={tab.path} className="shrink-0">
                  <NavLink
                    to={`${tab.path}${currentSearch}`}
                    className={({ isActive }) =>
                      `archivo relative flex items-center gap-2.5 px-4 py-4 text-sm font-bold transition-colors ${
                        isActive
                          ? "text-[#991B1B]"
                          : "text-[#6B6F76] hover:text-[#991B1B]"
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <Icon
                          size={16}
                          className="shrink-0"
                          aria-hidden="true"
                        />
                        <span>{tab.label}</span>

                        {/* Active indicator sits on top of the divider line */}
                        {isActive && (
                          <span className="absolute -bottom-px left-0 right-0 h-0.5 bg-[#991B1B]" />
                        )}
                      </>
                    )}
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Main content area rendered via Outlet */}
        <main className="p-6 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}