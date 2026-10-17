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
import { applicantNotificationService } from "../../service/api/applicants/applicantNotificationService";

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
  id: number;
  title: string;
  message: string;
  created_at: string;
  job_id?: number | null;
  application_id?: number | null;
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

  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const navigate = useNavigate();
  const auth = useContext(AuthContext);

  // `unauthenticated` starts as true, so wait for `loading` to finish first
  // to avoid flashing the Login button for logged-in users.
  const loading = auth?.loading ?? false;
  const isAuthenticated = !!auth && !auth.unauthenticated;

  const currentUser = auth?.userData?.userData;

  const hasNotifications = notifications.length > 0;
  const notificationCount = notifications.length;

  const navItems = [
    { title: "Home", path: "" },
    { title: "Jobs", path: "job_wall" },
    { title: "Saved", path: "my_jobs" },
    { title: "Career", path: "careers" },
  ];

  /* =========================================================
     FETCH NOTIFICATIONS
  ========================================================= */

  useEffect(() => {
    if (!isAuthenticated) {
      setNotifications([]);
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      setNotifications([]);
      return;
    }

    const fetchNotifications = async () => {
      try {
        setNotificationsLoading(true);

        const response =
          await applicantNotificationService.fetchNotifications(token);

        const data = response.data?.data ?? [];

        const mappedNotifications: AppNotification[] = data.map(
          (notification: {
            record_id: number;
            notification_title: string;
            notification_body: string;
            date_created: string;
            job_id?: number | null;
            application_id?: number | null;
          }) => ({
            id: notification.record_id,
            title: notification.notification_title,
            message: notification.notification_body,
            created_at: notification.date_created,
            job_id: notification.job_id,
            application_id: notification.application_id,
          }),
        );

        setNotifications(mappedNotifications);
      } catch (error) {
        console.error("Failed to fetch notifications:", error);
        setNotifications([]);
      } finally {
        setNotificationsLoading(false);
      }
    };

    fetchNotifications();
  }, [isAuthenticated]);

  /* =========================================================
     CLOSE DROPDOWN ON OUTSIDE CLICK / ESCAPE
  ========================================================= */

  useEffect(() => {
    if (!openMenu) return;

    const handleClick = (e: MouseEvent) => {
      const ref = openMenu === "profile" ? menuRef : notifRef;

      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpenMenu(null);
      }
    };

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpenMenu(null);
      }
    };

    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);

    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [openMenu]);

  /* =========================================================
     DEACTIVATE NOTIFICATION
  ========================================================= */

  const deactivateNotification = async (id: number) => {
    const token = localStorage.getItem("token");

    if (!token) return;

    try {
      await applicantNotificationService.deactivateNotification(id, token);

      setNotifications((prev) =>
        prev.filter((notification) => notification.id !== id),
      );
    } catch (error) {
      console.error("Failed to deactivate notification:", error);
    }
  };

  /* =========================================================
     OPEN NOTIFICATION
  ========================================================= */

  const handleNotificationOpen = async (notification: AppNotification) => {
    setOpenMenu(null);

    if (notification.application_id) {
      navigate(
        `/applicant/my_jobs/track_application/${notification.application_id}`,
      );
    }
  };

  /* =========================================================
     LOGOUT
  ========================================================= */

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
        <div className="flex items-center justify-between h-full">
          {/* =====================================================
              LOGO SECTION
          ===================================================== */}

          <div className="flex items-center gap-3 cursor-pointer">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-lg">
              <img
                src={logo}
                className="w-full h-full"
                alt="Profiteknik Corporation"
              />
            </div>

            <span className="text-lg text-[#1C2321] tracking-wide font-medium leading-none">
              Profiteknik{" "}
              <span className="archivo text-base uppercase tracking-widest text-red-800 mt-1">
                Corporation
              </span>
            </span>
          </div>

          {/* =====================================================
              NAVIGATION LINKS
          ===================================================== */}

          <nav className="hidden md:flex items-center gap-8 -ml-30">
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

          {/* =====================================================
              RIGHT SIDE ACTIONS
          ===================================================== */}

          <div className="flex items-center gap-6">
            {loading ? (
              // Placeholder while the token is being verified
              <div className="w-36 h-10 rounded-xl bg-zinc-200 animate-pulse" />
            ) : isAuthenticated ? (
              <div className="flex items-center gap-4">
                {/* =================================================
                    NOTIFICATIONS
                ================================================= */}

                <div ref={notifRef} className="relative">
                  <button
                    type="button"
                    aria-label={
                      hasNotifications
                        ? `Notifications, ${notificationCount} active`
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

                    {/* Notification indicator */}
                    {hasNotifications && (
                      <span className="absolute top-1.5 right-2 flex h-2.5 w-2.5">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-60" />

                        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-600 ring-2 ring-white" />
                      </span>
                    )}
                  </button>

                  {openMenu === "notifications" && (
                    <NotificationDropdown
                      notifications={notifications}
                      loading={notificationsLoading}
                      onOpen={handleNotificationOpen}
                      onDelete={async (id) => {
                        const token = localStorage.getItem("token");

                        if (!token) return;

                        try {
                          await applicantNotificationService.deleteNotification(
                            id,
                            token,
                          );

                          setNotifications((prev) =>
                            prev.filter(
                              (notification) => notification.id !== id,
                            ),
                          );
                        } catch (error) {
                          console.error(
                            "Failed to delete notification:",
                            error,
                          );
                        }
                      }}
                    />
                  )}
                </div>

                {/* =================================================
                    MESSAGES
                ================================================= */}

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

                {/* =================================================
                    PROFILE
                ================================================= */}

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
  loading: boolean;
  onOpen: (notification: AppNotification) => void;
  onDelete: (id: number) => void;
};

function NotificationDropdown({
  notifications,
  loading,
  onOpen,
  onDelete,
}: NotificationDropdownProps) {
  return (
    <div
      role="menu"
      className="w-80 max-w-[calc(100vw-2rem)] bg-[#FAF9F6] border border-[#E3E0D8] rounded-xl shadow-lg absolute top-12 right-0 z-50 overflow-hidden"
    >
      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <h3 className="archivo text-sm font-bold text-[#1C2321]">
            Notifications
          </h3>

          {notifications.length > 0 && (
            <span className="archivo px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-[11px] font-bold">
              {notifications.length}
            </span>
          )}
        </div>
      </div>

      {/* =====================================================
          LIST
      ===================================================== */}

      <div className="max-h-80 overflow-y-auto px-2 pb-2">
        {loading ? (
          <div className="flex flex-col items-center gap-2 py-10 text-[#6B6F76]">
            <div className="w-7 h-7 rounded-full border-2 border-[#E3E0D8] border-t-red-600 animate-spin" />

            <p className="archivo text-sm">Loading notifications...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-10 text-[#6B6F76]">
            <div className="w-11 h-11 rounded-full bg-[#F1EFE9] flex items-center justify-center">
              <IoNotificationsOutline size={20} />
            </div>

            <p className="archivo text-sm">You're all caught up</p>
          </div>
        ) : (
          <ul className="flex flex-col gap-1">
            {notifications.map((notification) => (
              <li key={notification.id} className="group relative">
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => onOpen(notification)}
                  className="w-full text-left flex items-start gap-3 rounded-lg px-3 py-2.5 pr-10 transition-colors cursor-pointer hover:bg-[#F1EFE9]"
                >
                  {/* Notification dot */}
                  <span className="mt-1.5 h-2 w-2 rounded-full shrink-0 bg-red-600" />

                  <div className="min-w-0 flex-1">
                    <p className="archivo text-sm text-[#1C2321] font-bold truncate">
                      {notification.title}
                    </p>

                    <p className="archivo text-xs text-[#6B6F76] leading-relaxed line-clamp-2">
                      {notification.message}
                    </p>

                    <p className="archivo text-[11px] text-[#6B6F76]/80 mt-1">
                      {timeAgo(notification.created_at)}
                    </p>
                  </div>
                </button>

                {/* Delete button */}
                <button
                  type="button"
                  aria-label="Delete notification"
                  onClick={(event) => {
                    event.stopPropagation();
                    onDelete(notification.id);
                  }}
                  className="absolute right-2 top-2.5 w-7 h-7 rounded-md flex items-center justify-center text-[#6B6F76] opacity-0 group-hover:opacity-100 hover:bg-[#FEE2E2] hover:text-[#991B1B] transition-all cursor-pointer"
                >
                  ×
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
      {/* =====================================================
          USER HEADER
      ===================================================== */}

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

      {/* =====================================================
          NAVIGATION ACTIONS
      ===================================================== */}

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
