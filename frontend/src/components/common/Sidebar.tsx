import { useState } from "react";
import { NavLink } from "react-router-dom";
import logo from "../../assets/logo/profiteknik_logo_only.svg";
import { UseAuth } from "../../hooks/useAuth";

import {
  MdOutlineChevronLeft,
  MdOutlineChevronRight,
  MdManageAccounts,
  MdWorkHistory,
  MdWork,
} from "react-icons/md";
import { AiFillDashboard } from "react-icons/ai";
import { IoIosSave } from "react-icons/io";

type SidebarProps = {
  handleMinimize: () => void;
  isActive: boolean;
};

type MenuItem = {
  name: string;
  icon: React.ReactNode;
  path: string;
};

type MenuSection = {
  section: string;
  contents: MenuItem[];
};

const menuItemsRoot: MenuSection[] = [
  {
    section: "Analytics",
    contents: [
      {
        name: "Dashboard",
        icon: <AiFillDashboard size={18} />,
        path: "/root/dashboard",
      },
    ],
  },
  {
    section: "Employees",
    contents: [
      {
        name: "Manage",
        icon: <MdManageAccounts size={18} />,
        path: "manage_employee",
      },
      {
        name: "Register",
        icon: <IoIosSave size={18} />,
        path: "register_employee",
      },
    ],
  },
];

const menuItemsEmployee: MenuSection[] = [
  {
    section: "Analytics",
    contents: [
      {
        name: "Dashboard",
        icon: <AiFillDashboard size={18} />,
        path: "dashboard",
      },
    ],
  },
  {
    section: "Job Listing",
    contents: [
      {
        name: "Post listing",
        icon: <MdWork size={18} />,
        path: "create_job_listing",
      },
      {
        name: "Manage listing",
        icon: <MdWorkHistory size={18} />,
        path: "manage_job_listing",
      },
    ],
  },
];

export default function Sidebar({ handleMinimize, isActive }: SidebarProps) {
  const { userData } = UseAuth();
  const data = userData?.userData;

  if (!data) return null;

  const getMenuByRole = (role: string): MenuSection[] => {
    switch (role) {
      case "root":
        return menuItemsRoot;
      case "employee":
        return menuItemsEmployee;
      default:
        return [];
    }
  };

  const activeMenuItems = getMenuByRole(data.role);

  return (
    <aside className="relative h-full flex items-center select-none">
      {/* Sidebar Panel */}
      <div
        className={`h-full flex flex-col justify-between border-r border-[#E3E0D8] bg-[#FAF9F6] p-4 transition-all duration-300 ease-in-out ${
          isActive ? "w-64" : "w-20"
        }`}
      >
        <div className="flex flex-col gap-6">
          {/* Logo & Branding */}
          <div className="flex items-center gap-3 px-2 py-1">
            <img src={logo} alt="Profiteknik" className="w-9 h-9 object-contain" />
            {isActive && (
              <div className="flex flex-col overflow-hidden whitespace-nowrap">
                <span className="text-base text-[#1C2321] tracking-wide font-medium leading-none">
                  Profiteknik
                </span>
                <span className="archivo text-[10px] uppercase tracking-widest text-red-800 mt-1">
                  Corporation
                </span>
              </div>
            )}
          </div>

          <div className="h-[1px] bg-[#E3E0D8] w-full" />

          {/* Navigation Links */}
          <RenderContent content={activeMenuItems} isActive={isActive} />
        </div>
      </div>

      {/* Collapse/Expand Toggle Button */}
      <button
        type="button"
        onClick={handleMinimize}
        aria-label={isActive ? "Collapse sidebar" : "Expand sidebar"}
        className="absolute -right-3.5 top-8 z-20 flex items-center justify-center w-7 h-7 rounded-full bg-[#FAF9F6] border border-[#E3E0D8] text-[#1C2321] shadow-sm hover:bg-[#F1EFE9] transition-colors"
      >
        {isActive ? <MdOutlineChevronLeft size={18} /> : <MdOutlineChevronRight size={18} />}
      </button>
    </aside>
  );
}

type RenderProps = {
  content: MenuSection[];
  isActive: boolean;
};

function RenderContent({ content, isActive }: RenderProps) {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-6">
      {content.map((group, groupIdx) => (
        <div key={groupIdx} className="flex flex-col gap-1.5">
          {/* Section Heading */}
          {isActive ? (
            <p className="archivo text-[11px] font-semibold tracking-wider text-[#6B6F76] uppercase px-2 mb-1">
              {group.section}
            </p>
          ) : (
            <div className="h-2" />
          )}

          {/* Navigation Items */}
          <nav className="flex flex-col gap-1">
            {group.contents.map((item, itemIdx) => (
              <NavLink
                key={itemIdx}
                to={item.path}
                onMouseEnter={() => setHoveredItem(item.name)}
                onMouseLeave={() => setHoveredItem(null)}
                className={({ isActive: isLinkActive }) =>
                  `relative flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 group ${
                    isActive ? "justify-start gap-3" : "justify-center"
                  } ${
                    isLinkActive
                      ? "bg-[#F1EFE9] text-[#1C2321]"
                      : "text-[#6B6F76] hover:bg-[#F8F7F2] hover:text-[#1C2321]"
                  }`
                }
              >
                {({ isActive: isLinkActive }) => (
                  <>
                    <span
                      className={`transition-colors ${
                        isLinkActive ? "text-[#1C2321]" : "text-[#6B6F76] group-hover:text-[#1C2321]"
                      }`}
                    >
                      {item.icon}
                    </span>

                    {isActive && (
                      <span className="archivo text-sm leading-none whitespace-nowrap">
                        {item.name}
                      </span>
                    )}

                    {/* Collapsed Hover Tooltip */}
                    {!isActive && hoveredItem === item.name && (
                      <div className="absolute left-full ml-3 z-30 px-3 py-1.5 bg-[#1C2321] text-[#FAF9F6] text-xs archivo font-normal rounded shadow-md whitespace-nowrap pointer-events-none">
                        {item.name}
                      </div>
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>
        </div>
      ))}
    </div>
  );
}