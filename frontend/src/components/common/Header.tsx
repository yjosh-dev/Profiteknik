import { useEffect, useState } from "react";
import { useActionData } from "react-router-dom";

import { IoSearchSharp, IoLogOutSharp } from "react-icons/io5";
import { IoMdMailUnread, IoMdNotifications, IoMdHelp } from "react-icons/io";
import { MdOutlineKeyboardArrowRight } from "react-icons/md";
import { FaUser } from "react-icons/fa";

import Input from "../ui/Input";
import { UseAuth } from "../../hooks/useAuth";
import { CapitalizeFirst } from "../../utils/CapitalizeFirstLetter";

export default function Header() {
  const { userData } = UseAuth();
  
  useEffect(() => {
    console.log(data)
  },[])
  const data = userData?.userData;
  return (
    <div className="w-full h-full bg-[#EDE9E6] rounded-xl component flex items-center justify-between px-6 pr-10 select-none">
      <SearchBar />
      <ProfileBlock user={data?.name} role={data?.role} profile_image={data?.profile_image} />
    </div>
  );
}

function SearchBar({ item }: { item?: string }) {
  return (
    <div className="w-[40%] h-10 bg-white rounded-xl outline-0 px-3 font-medium text-base flex items-center ">
      <IoSearchSharp />
      <input
        className="w-[80%] h-10 bg-white rounded-xl outline-0 px-3 font-medium text-base flex"
        placeholder="Search"
      ></input>
    </div>
  );
}

type ProfileBlockProps = {
  user?: string;
  role?: string;
  profile_image?: string;
};

type DropDownSelectionType = {
  icon: React.ReactNode;
  title: string;
  onClick?: () => void;
};

function ProfileBlock({ user, role, profile_image }: ProfileBlockProps) {
  const [dropdown, setDropdown] = useState(false);
  return (
    <div className="w-[30%] h-12 flex items-center justify-end gap-4">
      <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center hover:bg-gray-200 cursor-pointer">
        <IoMdMailUnread size={22} className="text-gray-600" />
      </div>
      <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center hover:bg-gray-200 cursor-pointer">
        <IoMdNotifications size={26} className="text-gray-600" />
      </div>
      <div className="flex gap-3 relative ">
        <div
          className="w-12 h-12 rounded-full bg-white "
          onClick={() => setDropdown((prev) => !prev)}
        >
          {profile_image ? <img src={`http://localhost:8000/storage/${profile_image}`} className="w-full h-full rounded-full"/> : ""}
        </div>
        {dropdown && <DropdownMenu user={user} role={role} profile_image={profile_image} />}
      </div>
    </div>
  );
}

function DropdownMenu({ user, role, profile_image }: ProfileBlockProps) {
  const menu = [
    {
      icon: <FaUser />,
      title: "View Profile",
    },
    {
      icon: <IoMdHelp />,
      title: "Help & Support",
    },
    {
      icon: <IoLogOutSharp />,
      title: "Log out"
    }
  ];

  return (
    <div className="w-60 z-99 bg-white border rounded-sm shadow border-gray-200 absolute top-13 right-0 px-5 py-2 cursor-pointer">
      <div className="flex mt-3 items-center gap-3">
        <div className="shadow-sm w-11 h-11 rounded-full bg-white">
          <img src={`http://localhost:8000/storage/${profile_image}`} className="w-11 h-11 rounded-full"/>
        </div>
        <div>
          <p className="font-semibold text-sm">
            {user ? user : "Loading....."}
          </p>
          <p className="text-sm">
            {role ? CapitalizeFirst(role) : "Loading....."}
          </p>
        </div>
      </div>
      <hr className="w-[98%] text-gray-300 mt-3 mb-2 " />
      {menu.map((item) => (
        <DropDownSelection icon={item.icon} title={item.title} onClick={() => alert(item.title)} />
      ))}
    </div>
  );
}

function DropDownSelection({ icon, title, onClick }: DropDownSelectionType) {
  return (
    <div className="w-full h-9 rounded-xs hover:bg-gray-100 flex items-center pl-1 justify-between mt-1" onClick={onClick}>
      <div className="w-7 h-7 rounded-full bg-gray-400 flex items-center justify-center relative">
        {icon}
      </div>
      <p className="absolute left-15 font-medium text-sm">{title}</p>
      <MdOutlineKeyboardArrowRight />
    </div>
  );
}
