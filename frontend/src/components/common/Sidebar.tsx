import { useState } from "react";

import logo from "../../assets/logo/profiteknik_logo_only.svg";
import { NavLink } from "react-router-dom";
import { UseAuth } from "../../hooks/useAuth";

import {
  MdOutlineArrowLeft,
  MdOutlineArrowRight,
  MdManageAccounts,
  MdWorkHistory,
  MdWork
} from "react-icons/md";
import { SiSimpleanalytics } from "react-icons/si";
import { IoIosSave } from "react-icons/io";
import { AiFillDashboard } from "react-icons/ai";


import Tooltip from "../ui/Tooltip";


type SidebarType = {
  handleMinimize: () => void;
  isActive: boolean;
};

type RenderType = {
  content: menuItemType;
  isActive: boolean;
};

type menuItemType = {
  section: string;
  contents: { name: string; icon: React.ReactNode; path: string }[];
}[];

let menuItemsRoot = [
  {
    section: "Analytics",
    contents: [
      {
        name: "Dashboard",
        icon: <AiFillDashboard size={19} />,
        path: "/root/dashboard",
      },
    ],
  },
  {
    section: "Employees",
    contents: [
      {
        name: "Manage",
        icon: <MdManageAccounts size={19} />,
        path: "manage_employee",
      },
      {
        name: "Register",
        icon: <IoIosSave size={19} />,
        path: "register_employee",
      },
    ],
  },
];

let menuItemsEmployee = [
  {
    section: "Analytics",
    contents: [
      {
        name: "Dashboard",
        icon: <AiFillDashboard size={19} />,
        path: "/root/dashboard",
      },
    ],
  },
  {
    section: "Job Listing",
    contents: [
      {
        name: "Post listing",
        icon: <MdWork size={19} />,
        path: "job_listing",
      },
      {
        name: "Manage listing",
        icon: <MdWorkHistory size={19} />,
        path: "manage_job_listing",
      },
    ],
  },
];

export default function Sidebar({ handleMinimize, isActive }: SidebarType) {
  const { userData } = UseAuth();
  const data = userData?.userData;

  if (!data) {
    return;
  }

  const filter = (role: string) => {
    switch (role) {
      case "root":
        return menuItemsRoot;
      case "employee":
        return menuItemsEmployee;
      default:
        return [];
    }
  };

  const activeMenuItems = filter(data.role);

  return (
    <div className="w-full h-full flex items-center">
      {/* navbar content */}
      <div
        className={`w-full h-full flex flex-col rounded-xl component p-3 gap-3`}
      >
        {/* image and text container */}
        <div className="flex flex-col items-center justify-center gap-2">
          <img src={logo} className="w-13 h-13 " />
          {isActive && (
            <p className="font-bold text-sm tracking-widest uppercase text-gray-800">
              Profiteknik Corp
            </p>
          )}
        </div>
        {/* end of image and text container */}
        <hr className="text-gray-400" />
        <RenderContent content={activeMenuItems} isActive={isActive} />
      </div>
      {/* minimize button */}
      <div
        className="rounded-full w-8 h-8 shadow-md border border-gray-200 component -ml-3 flex items-center justify-center -mr-2"
        onClick={handleMinimize}
      >
        {isActive ? (
          <MdOutlineArrowLeft size={70} />
        ) : (
          <MdOutlineArrowRight size={70} />
        )}
      </div>
    </div>
  );
}
import { useEffect } from "react";

function RenderContent({ content, isActive }: RenderType) {
  // this function is for inactive menu where every content[i].content is separated
  const sortedMenu = sortNestedContents(content);
  const [hovered, setHovered] = useState<string | null>(null);
  return (
    <div className="flex flex-col gap-4 pt-3">
      {isActive ? (
        <>
          {content.map((item, index) => (
            <div className="flex flex-col" key={index}>
              <p
                className="font-bold text-base tracking-wider  text-gray-800 mb-2"
                key={index}
              >
                {item.section}
              </p>
              <nav>
                {item.contents.map((contents, index) => (
                  <NavLink
                    className={({ isActive }) =>
                      `my-1 flex items-center justify-between px-3 py-1 transition rounded-md border-l-5 hover:font-bold hover:bg-gray-400 hover:border-red-700 ${
                        isActive
                          ? "font-bold bg-gray-400 border-red-700"
                          : "border-transparent"
                      }`
                    }
                    key={index}
                    to={contents.path}
                  >
                    <p className="text-base font-medium text-gray-700">
                      {contents.name}
                    </p>
                    {contents.icon}
                  </NavLink>
                ))}
              </nav>
            </div>
          ))}
        </>
      ) : (
        <>
          <div className="flex flex-col gap-3">
            {sortedMenu.map((contents) => (
              <div
                className="flex items-center justify-between px-3 hover:font-bold py-1  
                hover:bg-gray-400 hover:border-l-5 hover:border-red-700 transition rounded-md"
                onMouseEnter={() => setHovered(contents.name)}
                onMouseLeave={() => setHovered(null)}
              >
                {hovered == contents.name && (
                  <div className="absolute left-15 z-99">
                    <Tooltip type="horizontal" text={contents.name} />
                  </div>
                )}
                {contents.icon}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

const sortNestedContents = (content: menuItemType) => {
  let sortedContents = [];

  for (let i = 0; i < content.length; i++) {
    for (let j = 0; j < content[i].contents.length; j++) {
      sortedContents.push({
        name: content[i].contents[j].name,
        icon: content[i].contents[j].icon,
      });
    }
  }
  return sortedContents;
};
