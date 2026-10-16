import { useContext, useEffect, useRef, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import logo from "../../assets/logo/profiteknik_logo_only.svg";
import {
  IoNotificationsOutline,
  IoChatbubbleEllipsesOutline,
  IoPersonCircleOutline,
  IoLogOutSharp,
} from "react-icons/io5";
import { FaUser } from "react-icons/fa6";
import { IoMdHelp } from "react-icons/io";
import { MdOutlineChevronRight } from "react-icons/md";

import { AuthContext } from "../../context/AuthProvider";

// Where "View Profile" goes, and where uploaded images are served from
const PROFILE_PATH = "/applicant/profile";
const STORAGE_URL =
  import.meta.env.VITE_STORAGE_URL ?? "http://localhost:8000/storage";

const CapitalizeFirst = (text: string) =>
  text.charAt(0).toUpperCase() + text.slice(1);

/* =========================================================
   NOTIFICATIONS
========================================================= */

export type AppNotification = {
  id: number | string;
  title: string;
  message: string;
  created_at: string; // ISO string
  read: boolean;
  link?: string; // optional route to open when clicked
};

const timeAgo = (iso: string) => {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
};

// TODO: remove this sample data and load real notifications from your API
const minutesAgo = (m: number) =>
  new Date(Date.now() - m * 60 * 1000).toISOString();

const SAMPLE_NOTIFICATIONS: AppNotification[] = [
  {
    id: 1,
    title: "Interview scheduled",
    message: "Your interview for Software Engineer has been scheduled.",
    created_at: minutesAgo(5),
    read: false,
  },
  {
    id: 2,
    title: "Application viewed",
    message: "An employer viewed your application.",
    created_at: minutesAgo(120),
    read: false,
  },
  {
    id: 3,
    title: "Welcome to Profiteknik",
    message: "Complete your profile to get better job matches.",
    created_at: minutesAgo(60 * 48),
    read: true,
  },
];

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
  // Only one dropdown can be open at a time
  const [openMenu, setOpenMenu] = useState<"notifications" | "profile" | null>(
    null,
  );
  const [notifications, setNotifications] = useState<AppNotification[]>(
    SAMPLE_NOTIFICATIONS,
  );
  const menuRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const auth = useContext(AuthContext);

  // `unauthenticated` starts as true, so wait for `loading` to finish first
  // to avoid flashing the Login button for logged-in users.
  const loading = auth?.loading ?? false;
  const isAuthenticated = !!auth && !auth.unauthenticated;

  const currentUser = auth?.userData?.userData;

  const unreadCount = notifications.filter((n) => !n.read).length;
  const hasUnread = unreadCount > 0;

  const navItems = [
    { title: "Home", path: "" },
    { title: "Jobs", path: "job_wall" },
    { title: "Saved", path: "my_jobs" },
    { title: "Career", path: "careers" },
  ];

  // Close the open dropdown on outside click or Escape
  useEffect(() => {
    if (!openMenu) return;

    const handleClick = (e: MouseEvent) => {
      const ref = openMenu === "profile" ? menuRef : notifRef;
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpenMenu(null);
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenMenu(null);
    };

    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [openMenu]);

  const markAsRead = (id: AppNotification["id"]) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
    // TODO: call your API to mark this notification as read
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    // TODO: call your API to mark all notifications as read
  };

  const handleLogout = async () => {
    const verifyType = localStorage.getItem("verify_type") ?? "applicant";
    localStorage.removeItem("token");
    localStorage.removeItem("verify_type");
    auth?.setUserData(null);
    setNotifications([]);
    // With no token, checkAuth marks the user as unauthenticated
    await auth?.checkAuth(verifyType);
    navigate("/applicant");
  };

  return (
    <header className="w-full h-[12dvh] bg-white border-b border-gray-100 shadow-sm sticky top-0 z-50">
      <div className="max-w-8xl mx-auto px-10 h-full">
        <div className="flex items-center  justify-between h-full">
          {/* Logo Section */}
          <div className="flex items-center gap-3 cursor-pointer ">
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
          <nav className="hidden md:flex items-center gap-8 -ml-30 ">
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
            {loading ? (
              // Placeholder while the token is being verified (keeps layout stable)
              <div className="w-36 h-10 rounded-xl bg-zinc-200 animate-pulse" />
            ) : isAuthenticated ? (
              <div className="flex items-center gap-4">
                {/* Notifications + dropdown */}
                <div ref={notifRef} className="relative">
                  <button
                    type="button"
                    aria-label={
                      hasUnread
                        ? `Notifications, ${unreadCount} unread`
                        : "Notifications"
                    }
                    aria-haspopup="menu"
                    aria-expanded={openMenu === "notifications"}
                    onClick={() =>
                      setOpenMenu((open) =>
                        open === "notifications" ? null : "notifications",
                      )
                    }
                    className={`relative p-2 rounded-full hover:bg-red-100 hover:text-red-500 transition-colors cursor-pointer ${
                      openMenu === "notifications"
                        ? "bg-red-100 text-red-500"
                        : "text-zinc-600"
                    }`}
                  >
                    <IoNotificationsOutline size={24} />

                    {/* Unread indicator */}
                    {hasUnread && (
                      <span className="absolute top-1.5 right-2 flex h-2.5 w-2.5">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-60" />
                        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-600 ring-2 ring-white" />
                      </span>
                    )}
                  </button>

                  {openMenu === "notifications" && (
                    <NotificationDropdown
                      notifications={notifications}
                      unreadCount={unreadCount}
                      onMarkRead={markAsRead}
                      onMarkAllRead={markAllAsRead}
                      onOpen={(n) => {
                        markAsRead(n.id);
                        setOpenMenu(null);
                        if (n.link) navigate(n.link);
                      }}
                    />
                  )}
                </div>

                <NavLink
                  to="conversations"
                  aria-label="Messages"
                  className={({ isActive }) =>
                    `p-2 rounded-full transition-colors cursor-pointer ${
                      isActive
                        ? "bg-red-100 text-red-500"
                        : "text-zinc-600 hover:bg-red-100 hover:text-red-500"
                    }`
                  }
                >
                  <IoChatbubbleEllipsesOutline size={24} />
                </NavLink>

                {/* Profile + dropdown */}
                <div ref={menuRef} className="relative">
                  <button
                    type="button"
                    aria-label="Profile"
                    aria-haspopup="menu"
                    aria-expanded={openMenu === "profile"}
                    onClick={() =>
                      setOpenMenu((open) =>
                        open === "profile" ? null : "profile",
                      )
                    }
                    className={`p-2 rounded-full hover:bg-red-100 hover:text-red-500 transition-colors cursor-pointer ${
                      openMenu === "profile"
                        ? "bg-red-100 text-red-500"
                        : "text-zinc-600"
                    }`}
                  >
                    <IoPersonCircleOutline size={28} />
                  </button>

                  {openMenu === "profile" && (
                    <DropdownMenu
                      user={currentUser?.name}
                      role={currentUser?.role}
                      profile_image={currentUser?.profile_image}
                      onClose={() => setOpenMenu(null)}
                      onLogout={handleLogout}
                      onViewProfile={() => navigate(PROFILE_PATH)}
                    />
                  )}
                </div>
              </div>
            ) : (
              <button
                className="flex items-center justify-center gap-2 rounded-xl border-2 border-red-500/80 bg-red-50/50 px-6 py-2.5 text-sm font-semibold text-red-600 shadow-sm hover:bg-red-600 hover:text-white hover:border-red-600 hover:shadow-md hover:shadow-red-500/20 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all duration-200"
                onClick={() => navigate("/applicant/signin")}
              >
                <span>Login</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

/* =========================================================
   NOTIFICATION DROPDOWN
========================================================= */

type NotificationDropdownProps = {
  notifications: AppNotification[];
  unreadCount: number;
  onOpen: (notification: AppNotification) => void;
  onMarkRead: (id: AppNotification["id"]) => void;
  onMarkAllRead: () => void;
};

function NotificationDropdown({
  notifications,
  unreadCount,
  onOpen,
  onMarkAllRead,
}: NotificationDropdownProps) {
  return (
    <div
      role="menu"
      className="w-80 max-w-[calc(100vw-2rem)] bg-[#FAF9F6] border border-[#E3E0D8] rounded-xl shadow-lg absolute top-12 right-0 z-50 overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <h3 className="archivo text-sm font-bold text-[#1C2321]">
            Notifications
          </h3>
          {unreadCount > 0 && (
            <span className="archivo px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-[11px] font-bold">
              {unreadCount} new
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={onMarkAllRead}
          disabled={unreadCount === 0}
          className="archivo text-xs font-semibold text-[#991B1B] hover:underline disabled:text-[#6B6F76] disabled:no-underline disabled:cursor-not-allowed cursor-pointer"
        >
          Mark all as read
        </button>
      </div>

      {/* List */}
      <div className="max-h-80 overflow-y-auto px-2 pb-2">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-10 text-[#6B6F76]">
            <div className="w-11 h-11 rounded-full bg-[#F1EFE9] flex items-center justify-center">
              <IoNotificationsOutline size={20} />
            </div>
            <p className="archivo text-sm">You're all caught up</p>
          </div>
        ) : (
          <ul className="flex flex-col gap-1">
            {notifications.map((n) => (
              <li key={n.id}>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => onOpen(n)}
                  className={`w-full text-left flex items-start gap-3 rounded-lg px-3 py-2.5 transition-colors cursor-pointer ${
                    n.read
                      ? "hover:bg-[#F1EFE9]"
                      : "bg-[#FDF2F2] hover:bg-[#FBE7E7]"
                  }`}
                >
                  {/* Unread dot */}
                  <span
                    className={`mt-1.5 h-2 w-2 rounded-full shrink-0 ${
                      n.read ? "bg-transparent" : "bg-red-600"
                    }`}
                  />

                  <div className="min-w-0 flex-1">
                    <p
                      className={`archivo text-sm text-[#1C2321] truncate ${
                        n.read ? "font-medium" : "font-bold"
                      }`}
                    >
                      {n.title}
                    </p>
                    <p className="archivo text-xs text-[#6B6F76] leading-relaxed line-clamp-2">
                      {n.message}
                    </p>
                    <p className="archivo text-[11px] text-[#6B6F76]/80 mt-1">
                      {timeAgo(n.created_at)}
                    </p>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

/* =========================================================
   PROFILE DROPDOWN
========================================================= */

type DropdownMenuProps = {
  user?: string;
  role?: string;
  profile_image?: string | null;
  onClose: () => void;
  onLogout: () => void;
  onViewProfile: () => void;
};

function DropdownMenu({
  user,
  role,
  profile_image,
  onClose,
  onLogout,
  onViewProfile,
}: DropdownMenuProps) {
  const imageUrl = profile_image ? `${STORAGE_URL}/${profile_image}` : null;

  const menu = [
    {
      icon: <FaUser size={13} />,
      title: "View Profile",
      action: onViewProfile,
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
    <div
      role="menu"
      className="w-64 bg-[#FAF9F6] border border-[#E3E0D8] rounded-xl shadow-lg absolute top-12 right-0 z-50 p-3 flex flex-col gap-2"
    >
      {/* User Header */}
      <div className="flex items-center gap-3 p-2 bg-[#F1EFE9] rounded-lg border border-[#E3E0D8]/60">
        <div className="w-10 h-10 rounded-full border border-[#E3E0D8] bg-[#FAF9F6] overflow-hidden flex items-center justify-center shrink-0">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={user || "Profile"}
              className="w-full h-full object-cover"
            />
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
            role="menuitem"
            onClick={() => {
              item.action();
              onClose();
            }}
            className={`w-full h-9 rounded-lg px-2.5 flex items-center justify-between transition-colors group cursor-pointer ${
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