import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

import ApplicantInfoCard from "../../../components/common/ApplicantInfoCard";
import ScreenApplicants from "../../../features/employee/Applications/ScreenApplicants";

import { applicantScreeningService } from "../../../service/api/employee/applicantScreeningService";

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

  // ---- Notes state ----
  const [noteText, setNoteText] = useState("");
  const [taggedManager, setTaggedManager] = useState("");
  const [savedNote, setSavedNote] = useState<string | null>(null);
  const [managers] = useState([
    { id: "", label: "Tag a manager" },
    { id: "m1", label: "Sarah Chen" },
    { id: "m2", label: "David Park" },
    { id: "m3", label: "Amara Okafor" },
  ]);

  // Fetch the applicant screening details.
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

  const handleStatusUpdate = async (newStatus: string) => {
    if (!screeningData?.application_id) return;

    try {
      await applicantScreeningService.updateStatus(
        screeningData.application_id,
        newStatus,
      );
    } catch (err) {
      console.error("Failed to update applicant status", err);
    }
  };

  // ---- Notes handlers ----
  const handleSaveNote = () => {
    if (!noteText.trim()) return;

    const payload = {
      application_id: screeningData?.application_id,
      note: noteText.trim(),
      tagged_manager: taggedManager || null,
    };

    console.log("Saving note:", payload);
    // 👉 Replace with real API call, e.g.:
    // await applicantScreeningService.saveNote(payload);

    setSavedNote(noteText.trim());
    setNoteText("");
    setTaggedManager("");
  };

  const handleCancelNote = () => {
    setNoteText("");
    setTaggedManager("");
  };

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

  return (
    <div className="w-full h-full min-h-[560px] grid grid-cols-[28fr_50fr_22fr] gap-4">
      {/* Applicant Information */}
      <aside className={`${box} min-w-0`}>
        <ApplicantInfoCard
          profileImageUrl={applicant.profile_image_url}
          firstName={applicant.first_name}
          middleName={applicant.middle_name}
          lastName={applicant.last_name}
          email={applicant.email}
          phoneNo={applicant.phone_no}
          telNo={applicant.tel_no}
          onSwap={() => console.log("swap clicked")}
          defaultAction={getStatusLabel(screeningData.status)}
          actions={[
            { label: "Pending", onClick: () => handleStatusUpdate("pending") },
            { label: "Shortlist", onClick: () => handleStatusUpdate("shortlisted") },
            { label: "Interview", onClick: () => handleStatusUpdate("interview") },
            { label: "Reject", onClick: () => handleStatusUpdate("rejected") },
            { label: "Completed", onClick: () => handleStatusUpdate("completed") },
          ]}
        />
      </aside>

      {/* Application Evaluation */}
      <main className={`${box} min-w-0 overflow-y-auto h-full flex flex-col`}>
        <ScreenApplicants />
      </main>

      {/* Notes panel */}
      <aside className={`${box} min-w-0 flex flex-col overflow-hidden`}>
        {/* Header */}
        <div className="px-5 pt-5 pb-3 border-b border-[#E3E0D8]">
          <h3 className="text-[15px] font-semibold text-gray-900">Notes</h3>
          <p className="flex items-center gap-1 text-[12px] text-gray-500 mt-1">
            <InfoIcon />
            Only team members can see notes.
          </p>
        </div>

        {/* Body */}
        <div className="flex-1 min-h-0 overflow-y-auto px-5 py-4 flex flex-col gap-3">
          {/* Textarea */}
          <textarea
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder="Add a note here"
            className="w-full min-h-[140px] resize-none rounded-lg border border-[#E3E0D8] bg-white px-3 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C8D7FF] focus:border-[#B6C9FF] transition"
          />

          {/* Tag manager dropdown */}
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

          {/* Last saved note preview */}
          {savedNote && (
            <div className="mt-1 rounded-lg border border-[#E3E0D8] bg-[#FAFAF7] px-3 py-2 text-[12px] text-gray-600">
              <span className="font-medium text-gray-700">Saved: </span>
              {savedNote}
            </div>
          )}
        </div>

        {/* Footer actions */}
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
  );
}

/* ---------- Icons ---------- */

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