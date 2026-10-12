import { useEffect, useState } from "react";
import { FaBuilding, FaEllipsis, FaFileLines, FaXmark } from "react-icons/fa6";
import { MdRemoveCircle } from "react-icons/md";

type ApplicationCardProps = {
  jobTitle: string;
  appliedAt: string; // ISO date, e.g. "2026-09-27T08:00:00Z"
  onView: () => void;
  onWithdraw: () => void;
  onTitleClick?: () => void;
};

// "2026-09-27" -> "Sep 27" (adds the year when it isn't this year)
function formatApplied(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const sameYear = date.getFullYear() === new Date().getFullYear();
  return date.toLocaleDateString("en-PH", {
    month: "short",
    day: "numeric",
    ...(sameYear ? {} : { year: "numeric" }),
  });
}

function ManageModal({
  onClose,
  onView,
  onWithdraw,
}: {
  onClose: () => void;
  onView: () => void;
  onWithdraw: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  const row =
    "archivo w-full flex items-center gap-4 px-6 py-4 text-left text-base font-bold text-zinc-800 border-t border-gray-100 hover:bg-red-50 hover:text-red-700 transition-colors cursor-pointer outline-none focus-visible:bg-red-50";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Manage this application"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded-2xl bg-white shadow-xl overflow-hidden"
      >
        <div className="flex items-center justify-between px-6 py-4">
          <h2 className="archivo text-base font-bold text-zinc-700">
            Manage this application:
          </h2>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="p-1.5 rounded-full text-zinc-700 hover:bg-red-50 hover:text-red-700 transition-colors cursor-pointer"
          >
            <FaXmark size={16} />
          </button>
        </div>

        <button
          type="button"
          onClick={() => {
            onClose();
            onView();
          }}
          className={row}
        >
          <FaFileLines size={18} aria-hidden="true" />
          View and manage details
        </button>

        <button
          type="button"
          onClick={() => {
            onClose();
            onWithdraw();
          }}
          className={row}
        >
          <MdRemoveCircle size={20} aria-hidden="true" />
          Withdraw application
        </button>
      </div>
    </div>
  );
}

export default function ApplicationCard({
  jobTitle,
  appliedAt,
  onView,
  onWithdraw,
  onTitleClick,
}: ApplicationCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const applied = formatApplied(appliedAt);

  return (
    <div className="flex items-start gap-4 border-b border-gray-200 px-2 py-4">
      {/* Icon */}
      <div className="w-10 h-10 shrink-0 rounded-lg bg-zinc-100 text-zinc-600 flex items-center justify-center">
        <FaBuilding size={18} aria-hidden="true" />
      </div>

      {/* Details */}
      <div className="min-w-0 flex-1">
        <span className="archivo inline-block rounded-md bg-red-50 px-2 py-0.5 text-xs font-bold text-red-700">
          Applied
        </span>

        {onTitleClick ? (
          <button
            type="button"
            onClick={onTitleClick}
            className="archivo mt-1 block max-w-full text-left text-base font-bold text-zinc-900 underline truncate cursor-pointer hover:text-red-700"
          >
            {jobTitle}
          </button>
        ) : (
          <p className="archivo mt-1 text-base font-bold text-zinc-900 underline truncate">
            {jobTitle}
          </p>
        )}

        {applied && (
          <p className="archivo mt-1 text-sm text-zinc-500">
            Applied on {applied}
          </p>
        )}
      </div>

      {/* Menu */}
      <button
        type="button"
        aria-label="Manage this application"
        aria-haspopup="dialog"
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen(true)}
        className="shrink-0 p-2 rounded-full text-zinc-700 hover:bg-red-50 hover:text-red-700 transition-colors cursor-pointer"
      >
        <FaEllipsis size={16} />
      </button>

      {menuOpen && (
        <ManageModal
          onClose={() => setMenuOpen(false)}
          onView={onView}
          onWithdraw={onWithdraw}
        />
      )}
    </div>
  );
}