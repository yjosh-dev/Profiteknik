import { useState } from "react";

import logo from "../../assets/logo/profiteknik_logo_only.svg";

import {
  MdOutlineArrowLeft,
  MdOutlineArrowRight,
  MdManageAccounts,
} from "react-icons/md";
import { SiSimpleanalytics } from "react-icons/si";

type SidebarType = {
  handleMinimize: () => void;
  isA: boolean;
};

type RenderType = {
  content: { title: string; icon: React.ReactNode }[];
  isA: boolean;
};

let contents = [
  { title: "Analytics", icon: <SiSimpleanalytics size={16} /> },
  { title: "Employees", icon: <MdManageAccounts size={16} /> },
];

export default function Sidebar({ handleMinimize, isA }: SidebarType) {
  return (
    <div className="w-full h-full flex items-center">
      {/* navbar content */}
      <div
        className={`w-full h-full flex flex-col rounded-xl component p-3 gap-3`}
      >
        {/* image and text container */}
        <div className="flex flex-col items-center justify-center gap-2">
          <img src={logo} className="w-13 h-13 " />
          {isA && (
            <p className="font-bold text-sm tracking-widest uppercase text-gray-800">
              Profiteknik Corp
            </p>
          )}
        </div>
        {/* end of image and text container */}
        <hr className="text-gray-400" />
        <RenderContent content={contents} isA={isA} />
      </div>
      {/* minimize button */}
      <div
        className="rounded-full w-8 h-8 shadow-md border border-gray-200 component -ml-3 flex items-center justify-center -mr-2"
        onClick={handleMinimize}
      >
        {isA ? (
          <MdOutlineArrowLeft size={70} />
        ) : (
          <MdOutlineArrowRight size={70} />
        )}
      </div>
    </div>
  );
}

function RenderContent({ content, isA }: RenderType) {
  const [hovered, setHovered] = useState(false);

  return (
    <div className="flex flex-col gap-4 pt-3">
      {isA ? (
        <>
          {content.map((item) => (
            <div className="hover:bg-gray-300 hover:border-l-3 hover:border-red-700 hover:p-2 flex items-center justify-between font-medium px-3">
              <p className="text-sm">{item.title}</p>
              {item.icon}
            </div>
          ))}
        </>
      ) : (
        <>
          {content.map((item) => (
            <div
              className="hover:bg-gray-300 hover:w-8 hover:p-2 rounded-xl flex items-center justify-center"
              onMouseEnter={() => setHovered(true)}
            >
              {item.icon}
            </div>
          ))}
        </>
      )}
    </div>
  );
}
