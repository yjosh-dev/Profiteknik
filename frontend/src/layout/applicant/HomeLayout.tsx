import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import logo from "../../assets/logo/profiteknik_logo_only.svg";

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
            <div className="relative hidden lg:block w-48 xl:w-64">
              <input
                type="text"
                placeholder="Search"
                className="w-full pl-9 pr-4 py-2 bg-transparent text-sm text-zinc-800 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-red-500 rounded-full border border-zinc-200 focus:border-red-500 transition-all"
              />
            </div>
            <button className="flex items-center gap-2 bg-red-800 hover:bg-red-700 text-white font-medium text-sm px-15 py-2.5 rounded-xl shadow-md hover:shadow-lg transition-all duration-200">
              <span>Login</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}