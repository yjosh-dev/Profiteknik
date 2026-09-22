import { useEffect, useState, useRef } from "react";
import { IoSearchSharp, IoLogOutSharp } from "react-icons/io5";
import { IoMdMailUnread, IoMdNotifications, IoMdHelp } from "react-icons/io";
import { MdOutlineChevronRight } from "react-icons/md";
import { FaUser } from "react-icons/fa";

import { UseAuth } from "../../hooks/useAuth";
import { CapitalizeFirst } from "../../utils/CapitalizeFirstLetter";

export default function Header({onLogout} : {onLogout: () => void}) {
  const { userData } = UseAuth();
  const data = userData?.userData;

  return (
    <header className="w-full h-16 bg-[#FAF9F6] border-b border-[#E3E0D8] flex items-center justify-between px-6 select-none">
      <SearchBar />
      <ProfileBlock
        user={data?.name}
        role={data?.role}
        profile_image={data?.profile_image}
        onLogout={onLogout}
      />
    </header>
  );
}

function SearchBar({ item }: { item?: string }) {
  return (
    <div className="w-80 h-10 bg-[#F1EFE9] border border-[#E3E0D8] rounded-lg px-3 flex items-center gap-2.5 transition-all focus-within:border-[#1C2321] focus-within:bg-[#FAF9F6]">
      <IoSearchSharp size={18} className="text-[#6B6F76] shrink-0" />
      <input
        type="text"
        className="w-full bg-transparent archivo text-sm font-normal text-[#1C2321] placeholder-[#6B6F76] outline-none"
        placeholder="Search anything..."
        defaultValue={item}
      />
    </div>
  );
}

type ProfileBlockProps = {
  user?: string;
  role?: string;
  profile_image?: string;
  onLogout: () => void
};

function ProfileBlock({ user, role, profile_image, onLogout }: ProfileBlockProps) {
  const [dropdown, setDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const imageUrl = profile_image ? `http://localhost:8000/storage/${profile_image}` : null;

  return (
    <div className="flex items-center gap-3" ref={dropdownRef}>
      {/* Quick Actions */}
      <button
        type="button"
        aria-label="Messages"
        className="w-9 h-9 rounded-full bg-[#F1EFE9] border border-[#E3E0D8] flex items-center justify-center text-[#6B6F76] hover:text-[#1C2321] hover:bg-[#EAE7E1] transition-colors"
      >
        <IoMdMailUnread size={18} />
      </button>

      <button
        type="button"
        aria-label="Notifications"
        className="w-9 h-9 rounded-full bg-[#F1EFE9] border border-[#E3E0D8] flex items-center justify-center text-[#6B6F76] hover:text-[#1C2321] hover:bg-[#EAE7E1] transition-colors"
      >
        <IoMdNotifications size={18} />
      </button>

      <div className="h-5 w-[1px] bg-[#E3E0D8] mx-1" />

      {/* Profile Avatar & Dropdown Trigger */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setDropdown((prev) => !prev)}
          className="w-10 h-10 rounded-full border border-[#E3E0D8] bg-[#F1EFE9] overflow-hidden flex items-center justify-center hover:border-[#1C2321] transition-all focus:outline-none"
        >
          {imageUrl ? (
            <img src={imageUrl} alt={user || "Profile"} className="w-full h-full object-cover" />
          ) : (
            <span className="font-serif text-sm font-medium text-[#1C2321]">
              {user ? user.charAt(0).toUpperCase() : "U"}
            </span>
          )}
        </button>

        {dropdown && (
          <DropdownMenu
            user={user}
            role={role}
            profile_image={profile_image}
            onClose={() => setDropdown(false)}
            onLogout={onLogout}
          />
        )}
      </div>
    </div>
  );
}

type DropdownMenuProps = ProfileBlockProps & {
  onClose: () => void;
  onLogout: () => void;
};

function DropdownMenu({ user, role, profile_image, onClose, onLogout }: DropdownMenuProps) {
  const imageUrl = profile_image ? `http://localhost:8000/storage/${profile_image}` : null;

  const menu = [
    {
      icon: <FaUser size={13} />,
      title: "View Profile",
      action: () => alert("View Profile"),
    },
    {
      icon: <IoMdHelp size={15} />,
      title: "Help & Support",
      action: () => alert("Help & Support"),
    },
    {
      icon: <IoLogOutSharp size={15} />,
      title: "Log out",
      action: onLogout,
      isDestructive: true,
    },
  ];

  return (
    <div className="w-64 bg-[#FAF9F6] border border-[#E3E0D8] rounded-xl shadow-lg absolute top-12 right-0 z-50 p-3 flex flex-col gap-2">
      {/* User Header */}
      <div className="flex items-center gap-3 p-2 bg-[#F1EFE9] rounded-lg border border-[#E3E0D8]/60">
        <div className="w-10 h-10 rounded-full border border-[#E3E0D8] bg-[#FAF9F6] overflow-hidden flex items-center justify-center shrink-0">
          {imageUrl ? (
            <img src={imageUrl} alt={user || "Profile"} className="w-full h-full object-cover" />
          ) : (
            <span className="font-serif text-sm font-medium text-[#1C2321]">
              {user ? user.charAt(0).toUpperCase() : "U"}
            </span>
          )}
        </div>
        <div className="flex flex-col min-w-0">
          <p className="font-serif text-sm font-medium text-[#1C2321] truncate">
            {user || "Loading..."}
          </p>
          <p className="archivo text-[10px] uppercase tracking-wider text-[#6B6F76] font-semibold truncate">
            {role ? CapitalizeFirst(role) : "Loading..."}
          </p>
        </div>
      </div>

      <div className="h-[1px] bg-[#E3E0D8] my-0.5" />

      {/* Navigation Actions */}
      <div className="flex flex-col gap-1">
        {menu.map((item, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => {
              item.action();
              onClose();
            }}
            className={`w-full h-9 rounded-lg px-2.5 flex items-center justify-between transition-colors group ${
              item.isDestructive
                ? "hover:bg-[#FDF2F2] text-[#991B1B]"
                : "hover:bg-[#F1EFE9] text-[#1C2321]"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div
                className={`w-7 h-7 rounded-md flex items-center justify-center transition-colors ${
                  item.isDestructive
                    ? "bg-[#FEE2E2] text-[#991B1B]"
                    : "bg-[#F1EFE9] border border-[#E3E0D8] text-[#6B6F76] group-hover:text-[#1C2321] group-hover:bg-[#FAF9F6]"
                }`}
              >
                {item.icon}
              </div>
              <span className="archivo text-xs font-medium">{item.title}</span>
            </div>
            <MdOutlineChevronRight
              size={16}
              className={`transition-transform group-hover:translate-x-0.5 ${
                item.isDestructive ? "text-[#991B1B]" : "text-[#6B6F76]"
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );
}