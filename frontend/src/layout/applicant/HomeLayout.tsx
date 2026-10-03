import { useState } from "react";
import { Navigate, NavLink, Outlet, useNavigate } from "react-router-dom";
import logo from "../../assets/logo/profiteknik_logo_only.svg";
import {
  IoNotificationsOutline,
  IoChatbubbleEllipsesOutline,
  IoPersonCircleOutline,
} from "react-icons/io5";

export default function HomeLayout() {
  return (
    <div className="w-dvw h-dvh flex flex-col">
      <Navbar />
      <div className="flex-1 overflow-y-auto">
        <Outlet />
      </div>
    </div>
  );
}

function Navbar() {
  const [activeTab, setActiveTab] = useState("Home");
  const navigate = useNavigate();
  const navItems = [
    { title: "Home", path: "" },
    { title: "Jobs", path: "job_wall" },
    { title: "Saved", path: "saved" },
    { title: "Career", path: "careers" },
  ];

  return (
    <header className="w-full h-[12dvh] bg-white border-b border-gray-100 shadow-sm sticky top-0 z-50">
      <div className="max-w-8xl mx-auto px-20 h-full">
        <div className="flex items-center justify-between h-full">
          {/* Logo Section */}
          <div className="flex items-center gap-3 cursor-pointer">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-lg">
              <img src={logo} className="w-full h-full" />
            </div>
            <span className="text-lg text-[#1C2321] tracking-wide font-medium leading-none">
              Profiteknik{" "}
              <span className="archivo text-base uppercase tracking-widest text-red-800 mt-1">
                Corporation
              </span>
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <NavLink
                key={item.title}
                to={item.path}
                onClick={() => setActiveTab(item.title)}
                className={`text-sm font-medium transition-colors hover:text-red-600 relative py-2 ${
                  activeTab === item.title
                    ? "text-zinc-900 font-bold"
                    : "text-zinc-600"
                }`}
              >
                {item.title}
                {activeTab === item.title && (
                  <span className="absolute bottom-0 left-0 w-full h-[2.5px] bg-red-600 rounded-full" />
                )}
              </NavLink>
            ))}
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4">
              <button
                type="button"
                aria-label="Notifications"
                className="p-2 rounded-full text-zinc-600 hover:bg-red-100 hover:text-red-500 transition-colors cursor-pointer"
              >
                <IoNotificationsOutline size={24} />
              </button>
              <button
                type="button"
                aria-label="Messages"
                className="p-2 rounded-full text-zinc-600 hover:bg-red-100 hover:text-red-500 transition-colors cursor-pointer"
              >
                <IoChatbubbleEllipsesOutline size={24} />
              </button>
              <button
                type="button"
                aria-label="Profile"
                className="p-2 rounded-full text-zinc-600 hover:bg-red-100 hover:text-red-500 transition-colors cursor-pointer"
              >
                <IoPersonCircleOutline size={28} />
              </button>
            </div>
            <button
              className="flex items-center justify-center gap-2 rounded-xl border-2 border-red-500/80 bg-red-50/50 px-6 py-2.5 text-sm font-semibold text-red-600 shadow-sm hover:bg-red-600 hover:text-white hover:border-red-600 hover:shadow-md hover:shadow-red-500/20 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all duration-200"
              onClick={() => navigate("/applicant/signin")}
            >
              <span>Login</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
