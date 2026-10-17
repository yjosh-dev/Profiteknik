import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";

import ApplicantInfoCard from "../../../components/common/ApplicantInfoCard";
import ScreenApplicants from "../../../features/employee/Applications/ScreenApplicants";
import Dialog from "../../../components/ui/Dialog";

import { storageUrl } from "../../../utils/storage";

import { applicantScreeningService } from "../../../service/api/employee/applicantScreeningService";
import StatusChangeModal from "../../../components/common/ChangeStatusModal";

function getStatusLabel(status?: string): string {
  switch (status?.toLowerCase()) {
    case "pending":
      return "Pending";
    case "shortlist":
    case "shortlisted":
      return "Shortlist";
    case "interview":
      return "Interview";
    case "reject":
    case "rejected":
      return "Reject";
    case "completed":
      return "Completed";
    case "onboarding":
      return "Onboarding";
    default:
      return status || "Pending";
  }
}

export function ApplicationLayout() {
  const box = "bg-white border border-[#E3E0D8] rounded-xl shadow-md";

  const [searchParams] = useSearchParams();
  const jobId = searchParams.get("job_id");
  const applicantId = searchParams.get("applicant_id");

  const [screeningData, setScreeningData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --------------------------------------------------
  // RESIZABLE SIDE PANELS
  // --------------------------------------------------

  const layoutRef = useRef<HTMLDivElement | null>(null);

  const [leftWidth, setLeftWidth] = useState(300);
  const [rightWidth, setRightWidth] = useState(280);

  const [leftCollapsed, setLeftCollapsed] = useState(false);
  const [rightCollapsed, setRightCollapsed] = useState(false);

  const [savedLeftWidth, setSavedLeftWidth] = useState(300);
  const [savedRightWidth, setSavedRightWidth] = useState(280);

  const [resizing, setResizing] = useState<"left" | "right" | null>(null);

  const MIN_PANEL_WIDTH = 180;
  const COLLAPSE_THRESHOLD = 120;

  // ---- Resize handler ----
  useEffect(() => {
    if (!resizing) return;

    const handleMouseMove = (event: MouseEvent) => {
      const layout = layoutRef.current;

      if (!layout) return;

      const rect = layout.getBoundingClientRect();

      if (resizing === "left") {
        const newWidth = event.clientX - rect.left;

        if (newWidth <= COLLAPSE_THRESHOLD) {
          setLeftCollapsed(true);
          setLeftWidth(0);
          setResizing(null);
          return;
        }

        const maxLeftWidth = rect.width - rightWidth - 350;

        const clampedWidth = Math.max(
          MIN_PANEL_WIDTH,
          Math.min(newWidth, maxLeftWidth),
        );

        setLeftWidth(clampedWidth);
        setSavedLeftWidth(clampedWidth);
      }

      if (resizing === "right") {
        const newWidth = rect.right - event.clientX;

        if (newWidth <= COLLAPSE_THRESHOLD) {
          setRightCollapsed(true);
          setRightWidth(0);
          setResizing(null);
          return;
        }

        const maxRightWidth = rect.width - leftWidth - 350;

        const clampedWidth = Math.max(
          MIN_PANEL_WIDTH,
          Math.min(newWidth, maxRightWidth),
        );

        setRightWidth(clampedWidth);
        setSavedRightWidth(clampedWidth);
      }
    };

    const handleMouseUp = () => {
      setResizing(null);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);

      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [resizing, leftWidth, rightWidth]);

  // ---- Restore left panel ----
  const restoreLeftPanel = () => {
    setLeftCollapsed(false);
    setLeftWidth(savedLeftWidth || 300);
  };

  // ---- Restore right panel ----
  const restoreRightPanel = () => {
    setRightCollapsed(false);
    setRightWidth(savedRightWidth || 280);
  };

  // ---- Start resizing left ----
  const startLeftResize = (event: React.MouseEvent) => {
    event.preventDefault();

    if (!leftCollapsed) {
      setResizing("left");
    }
  };

  // ---- Start resizing right ----
  const startRightResize = (event: React.MouseEvent) => {
    event.preventDefault();

    if (!rightCollapsed) {
      setResizing("right");
    }
  };

  // --------------------------------------------------
  // STATUS CONFIRMATION
  // --------------------------------------------------

  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<string | null>(null);
  const [statusFrom, setStatusFrom] = useState<string | null>(null);
  // --------------------------------------------------
  // NOTES
  // --------------------------------------------------

  const [noteText, setNoteText] = useState("");
  const [taggedManager, setTaggedManager] = useState("");
  const [savedNote, setSavedNote] = useState<string | null>(null);

  const [managers] = useState([
    { id: "", label: "Tag a manager" },
    { id: "m1", label: "Sarah Chen" },
    { id: "m2", label: "David Park" },
    { id: "m3", label: "Amara Okafor" },
  ]);

  // --------------------------------------------------
  // FETCH APPLICANT
  // --------------------------------------------------

  useEffect(() => {
    const fetchScreeningDetails = async () => {
      if (!jobId || !applicantId) {
        setError("Missing job ID or applicant ID in URL.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const response = await applicantScreeningService.getScreeningDetails(
          jobId,
          applicantId,
        );

        setScreeningData(response.data.data as any);
      } catch (err: any) {
        setError(
          err.response?.data?.message ||
            "Failed to load applicant screening details.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchScreeningDetails();
  }, [jobId, applicantId]);

  // --------------------------------------------------
  // STATUS
  // --------------------------------------------------

  const handleStatusUpdate = (newStatus: string) => {
    if (!screeningData?.application_id) return;
    if (newStatus === screeningData.status) return; // nothing to change

    setStatusFrom(screeningData.status);
    setPendingStatus(newStatus);
    setStatusDialogOpen(true);
  };

  // Throws on failure; the modal shows the error and a retry button
  const confirmStatusUpdate = async () => {
    if (!pendingStatus || !screeningData?.application_id) return;

    await applicantScreeningService.updateStatus(
      screeningData.application_id,
      pendingStatus,
    );

    setScreeningData((prev: any) => ({ ...prev, status: pendingStatus }));
  };

  const closeStatusModal = () => {
    setStatusDialogOpen(false);
    setPendingStatus(null);
  };

  // --------------------------------------------------
  // NOTES
  // --------------------------------------------------

  const handleSaveNote = () => {
    if (!noteText.trim()) return;

    const payload = {
      application_id: screeningData?.application_id,
      note: noteText.trim(),
      tagged_manager: taggedManager || null,
    };

    console.log("Saving note:", payload);

    setSavedNote(noteText.trim());
    setNoteText("");
    setTaggedManager("");
  };

  const handleCancelNote = () => {
    setNoteText("");
    setTaggedManager("");
  };

  // --------------------------------------------------
  // LOADING / ERROR
  // --------------------------------------------------

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[560px]">
        Loading applicant details...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full min-h-[560px] text-red-500">
        {error}
      </div>
    );
  }

  if (!screeningData) {
    return (
      <div className="flex items-center justify-center h-full min-h-[560px]">
        No applicant data found.
      </div>
    );
  }

  const applicant = screeningData.applicant;
  const canSave = noteText.trim().length > 0;

  // --------------------------------------------------
  // DYNAMIC GRID
  // --------------------------------------------------

  const leftColumn = leftCollapsed ? "44px" : `${leftWidth}px`;
  const rightColumn = rightCollapsed ? "44px" : `${rightWidth}px`;

  return (
    <>
      <div
        ref={layoutRef}
        className="w-full h-full min-h-[560px] grid gap-0 overflow-hidden"
        style={{
          gridTemplateColumns: `${leftColumn} minmax(0, 1fr) ${rightColumn}`,
        }}
      >
        {/* =====================================================
            LEFT PANEL
        ====================================================== */}

        {leftCollapsed ? (
          <div className="h-full flex items-center justify-center">
            <button
              type="button"
              onClick={restoreLeftPanel}
              title="Show applicant information"
              className="w-9 h-12 flex items-center justify-center rounded-lg border border-[#E3E0D8] bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition"
            >
              <PanelLeftIcon />
            </button>
          </div>
        ) : (
          <div className="relative h-full min-w-0 pr-2">
            <aside className={`${box} h-full min-w-0 overflow-hidden`}>
              <ApplicantInfoCard
                profileImageUrl={storageUrl(applicant.profile_image_url) ?? ""}
                firstName={applicant.first_name}
                middleName={applicant.middle_name}
                lastName={applicant.last_name}
                email={applicant.email}
                phoneNo={applicant.phone_no}
                telNo={applicant.tel_no}
                onSwap={() => console.log("swap clicked")}
                defaultAction={getStatusLabel(screeningData.status)}
                actions={[
                  {
                    label: "Pending",
                    onClick: () => handleStatusUpdate("pending"),
                  },
                  {
                    label: "Shortlist",
                    onClick: () => handleStatusUpdate("shortlisted"),
                  },
                  {
                    label: "Interview",
                    onClick: () => handleStatusUpdate("interview"),
                  },
                  {
                    label: "Onboarding",
                    onClick: () => handleStatusUpdate("onboarding"),
                  },
                  {
                    label: "Reject",
                    onClick: () => handleStatusUpdate("rejected"),
                  },
                  {
                    label: "Completed",
                    onClick: () => handleStatusUpdate("completed"),
                  },
                ]}
              />
            </aside>

            {/* LEFT RESIZE HANDLE */}
            <div
              onMouseDown={startLeftResize}
              className="absolute top-0 right-0 h-full w-2 cursor-col-resize group z-20"
              title="Drag to resize"
            >
              <div className="absolute right-[3px] top-1/2 -translate-y-1/2 h-16 w-[3px] rounded-full bg-transparent group-hover:bg-gray-300 transition-colors" />
            </div>
          </div>
        )}

        {/* =====================================================
            MAIN APPLICATION EVALUATION
        ====================================================== */}

        <main
          className={`${box} min-w-0 overflow-y-auto h-full flex flex-col mx-0`}
        >
          <ScreenApplicants />
        </main>

        {/* =====================================================
            RIGHT PANEL
        ====================================================== */}

        {rightCollapsed ? (
          <div className="h-full flex items-center justify-center">
            <button
              type="button"
              onClick={restoreRightPanel}
              title="Show notes"
              className="w-9 h-12 flex items-center justify-center rounded-lg border border-[#E3E0D8] bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition"
            >
              <PanelRightIcon />
            </button>
          </div>
        ) : (
          <div className="relative h-full min-w-0 pl-2">
            {/* RIGHT RESIZE HANDLE */}
            <div
              onMouseDown={startRightResize}
              className="absolute top-0 left-0 h-full w-2 cursor-col-resize group z-20"
              title="Drag to resize"
            >
              <div className="absolute left-[3px] top-1/2 -translate-y-1/2 h-16 w-[3px] rounded-full bg-transparent group-hover:bg-gray-300 transition-colors" />
            </div>

            <aside
              className={`${box} h-full min-w-0 flex flex-col overflow-hidden`}
            >
              {/* HEADER */}
              <div className="px-5 pt-5 pb-3 border-b border-[#E3E0D8]">
                <h3 className="text-[15px] font-semibold text-gray-900">
                  Notes
                </h3>

                <p className="flex items-center gap-1 text-[12px] text-gray-500 mt-1">
                  <InfoIcon />
                  Only team members can see notes.
                </p>
              </div>

              {/* BODY */}
              <div className="flex-1 min-h-0 overflow-y-auto px-5 py-4 flex flex-col gap-3">
                {/* TEXTAREA */}
                <textarea
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder="Add a note here"
                  className="w-full min-h-[140px] resize-none rounded-lg border border-[#E3E0D8] bg-white px-3 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C8D7FF] focus:border-[#B6C9FF] transition"
                />

                {/* TAG MANAGER */}
                <div className="relative">
                  <select
                    value={taggedManager}
                    onChange={(e) => setTaggedManager(e.target.value)}
                    className="w-full appearance-none rounded-lg border border-[#E3E0D8] bg-white px-3 py-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#C8D7FF] focus:border-[#B6C9FF] cursor-pointer"
                  >
                    {managers.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.label}
                      </option>
                    ))}
                  </select>

                  <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500" />
                </div>

                {/* SAVED NOTE */}
                {savedNote && (
                  <div className="mt-1 rounded-lg border border-[#E3E0D8] bg-[#FAFAF7] px-3 py-2 text-[12px] text-gray-600">
                    <span className="font-medium text-gray-700">Saved: </span>
                    {savedNote}
                  </div>
                )}
              </div>

              {/* FOOTER */}
              <div className="flex-shrink-0 border-t border-[#E3E0D8] px-5 py-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={handleCancelNote}
                  disabled={!noteText && !taggedManager}
                  className="px-4 py-2 text-sm font-medium rounded-lg bg-[#FCE7E7] text-[#E5484D] hover:bg-[#FAD4D4] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleSaveNote}
                  disabled={!canSave}
                  className="px-4 py-2 text-sm font-medium rounded-lg bg-[#E6F0FF] text-[#2563EB] hover:bg-[#D4E4FF] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Save
                </button>
              </div>
            </aside>
          </div>
        )}
      </div>

      {/* =====================================================
          STATUS CONFIRMATION DIALOG
      ====================================================== */}

      <StatusChangeModal
        isOpen={statusDialogOpen}
        currentStatus={statusFrom}
        newStatus={pendingStatus}
        onConfirm={confirmStatusUpdate}
        onClose={closeStatusModal}
      />
    </>
  );
}

/* ============================================================
   ICONS
============================================================ */

function InfoIcon() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  );
}

function ChevronDownIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

/* ============================================================
   COLLAPSED PANEL ICONS
============================================================ */

function PanelLeftIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <line x1="9" y1="4" x2="9" y2="20" />
      <polyline points="6 10 4 12 6 14" />
    </svg>
  );
}

function PanelRightIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <line x1="15" y1="4" x2="15" y2="20" />
      <polyline points="18 10 20 12 18 14" />
    </svg>
  );
}
