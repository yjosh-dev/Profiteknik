import Input from "../ui/Input";
import { IoSearchSharp } from "react-icons/io5";
import { IoMdMailUnread, IoMdNotifications } from "react-icons/io";
import { useEffect, useState } from "react";
import { useActionData } from "react-router-dom";
import { UseAuth } from "../../hooks/useAuth";

export default function Header() {
  const {userData} = UseAuth()
  const data = userData?.userData

  return (
    <div className="w-full h-full bg-[#EDE9E6] rounded-xl component flex items-center justify-between px-4">
      <SearchBar />
      <ProfileBlock name={data?.name} role={data?.role}/>
    </div>
  );
}

function SearchBar({ item }: { item?: string }) {
  return (
    <div className="w-[40%] h-10 bg-white rounded-xl outline-0 px-3 font-medium text-base flex  items-center">
      <IoSearchSharp />
      <input
        className="w-[80%] h-10 bg-white rounded-xl outline-0 px-3 font-medium text-base flex"
        placeholder="Search"
      ></input>
    </div>
  );
}

type ProfileBlockProps = {
  name?: string;
  role?: string;
};

function ProfileBlock({name, role}: ProfileBlockProps) {
  const [dropdown, setDropdown] = useState(false);
  return (
    <div className="w-[30%] h-12 flex items-center gap-4">
      <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center hover:bg-gray-200">
        <IoMdMailUnread size={22} className="text-gray-600" />
      </div>
      <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center hover:bg-gray-200">
        <IoMdNotifications size={26} className="text-gray-600" />
      </div>
      <div className="flex gap-3 relative">
        <div
          className="w-12 h-12 rounded-full bg-white"
          onClick={() => setDropdown((prev) => !prev)}
        ></div>
        <div className="flex flex-col relative">
          <p className="text-medium font-semibold">{name ? name : "Loading....."}</p>
          <p className="text-sm text-gray-600">{role ? role: "Loading...."} </p>
        </div>
        {dropdown && <DropdownMenu />}
      </div>
    </div>
  );
}

function DropdownMenu() {
  return (
    <div className="w-full h-30 bg-white border rounded-sm shadow border-gray-200 absolute top-15"></div>
  );
}
