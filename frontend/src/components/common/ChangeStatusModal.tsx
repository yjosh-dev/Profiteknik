import { useEffect, useState } from "react";

type Phase = "confirm" | "saving" | "success" | "error";

const STEPS = [
  { key: "pending", label: "Pending" },
  { key: "shortlisted", label: "Shortlist" },
  { key: "interview", label: "Interview" },
  { key: "onboarding", label: "Onboarding" },
  { key: "completed", label: "Completed" },
];

const normalize = (status?: string | null) => {
  const value = (status ?? "pending").toLowerCase();
  if (value === "shortlist") return "shortlisted";
  if (value === "reject") return "rejected";
  return value;
};

const labelFor = (key: string) =>
  key === "rejected"
    ? "Rejected"
    : (STEPS.find((s) => s.key === key)?.label ?? key);

interface StatusChangeModalProps {
  isOpen: boolean;
  /** Status before the change (keep it fixed while the modal is open) */
  currentStatus?: string | null;
  newStatus: string | null;
  /** Should throw if the update fails, so the modal can show a retry */
  onConfirm: () => Promise<void>;
  onClose: () => void;
}

export default function StatusChangeModal({
  isOpen,
  currentStatus,
  newStatus,
  onConfirm,
  onClose,
}: StatusChangeModalProps) {
  const from = normalize(currentStatus);
  const to = normalize(newStatus);

  const fromIndex = STEPS.findIndex((s) => s.key === from);
  const toIndex = STEPS.findIndex((s) => s.key === to);
  const isReject = to === "rejected";

  const [phase, setPhase] = useState<Phase>("confirm");
  const [errorMessage, setErrorMessage] = useState("");

  // The step the animation has reached. It starts at the current status and
  // moves to the new one shortly after the modal opens.
  const [shownIndex, setShownIndex] = useState(fromIndex);
  const [showReject, setShowReject] = useState(false);

  // Reset and play the step animation each time the modal opens
  useEffect(() => {
    if (!isOpen) return;

    setPhase("confirm");
    setErrorMessage("");
    setShownIndex(fromIndex);
    setShowReject(false);

    const timer = setTimeout(() => {
      if (isReject) setShowReject(true);
      else setShownIndex(toIndex);
    }, 350);

    return () => clearTimeout(timer);
  }, [isOpen, fromIndex, toIndex, isReject]);

  // Close automatically a moment after success
  useEffect(() => {
    if (phase !== "success") return;
    const timer = setTimeout(onClose, 1800);
    return () => clearTimeout(timer);
  }, [phase, onClose]);

  // Esc closes (but not while saving)
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && phase !== "saving") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, phase, onClose]);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    setPhase("saving");
    try {
      // Keep the "saving" state visible for at least a moment
      await Promise.all([
        onConfirm(),
        new Promise((resolve) => setTimeout(resolve, 700)),
      ]);
      setPhase("success");
    } catch {
      setErrorMessage("We couldn't update the status. Please try again.");
      setPhase("error");
    }
  };

  const rejected = isReject && showReject;
  const tone = rejected
    ? { fill: "bg-red-500", node: "bg-red-500 border-red-500" }
    : { fill: "bg-emerald-500", node: "bg-emerald-500 border-emerald-500" };

  // The track runs from the first to the last circle (10% to 90% of the width)
  const lineWidth =
    shownIndex <= 0 ? 0 : (shownIndex / (STEPS.length - 1)) * 80;
  const stepMs = 700 / Math.max(1, Math.abs(toIndex - fromIndex));

  const titles: Record<Phase, string> = {
    confirm: "Change applicant status?",
    saving: "Updating status...",
    success: "Status updated",
    error: "Something went wrong",
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={titles[phase]}
      onClick={() => phase !== "saving" && onClose()}
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
    >
      <style>{`
        @keyframes sc-pop { from { opacity: 0; transform: scale(.94) translateY(8px); } to { opacity: 1; transform: none; } }
        @keyframes sc-draw { to { stroke-dashoffset: 0; } }
        @keyframes sc-spin { to { transform: rotate(360deg); } }
        @keyframes sc-badge { 0% { transform: scale(.5); } 60% { transform: scale(1.12); } 100% { transform: scale(1); } }
      `}</style>

      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
        style={{ animation: "sc-pop .25s ease-out" }}
      >
        {/* STATE ICON */}
        <div
          className={`mx-auto flex h-14 w-14 items-center justify-center rounded-full transition-colors duration-300 ${
            phase === "success"
              ? "bg-emerald-100 text-emerald-600"
              : phase === "error"
                ? "bg-red-100 text-red-600"
                : isReject
                  ? "bg-red-50 text-red-500"
                  : "bg-emerald-50 text-emerald-600"
          }`}
          style={
            phase === "success"
              ? { animation: "sc-badge .45s ease-out" }
              : undefined
          }
        >
          {phase === "saving" && (
            <svg
              width="26"
              height="26"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              style={{ animation: "sc-spin .8s linear infinite" }}
            >
              <path d="M21 12a9 9 0 1 1-6.2-8.55" />
            </svg>
          )}

          {phase === "success" && (
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path
                d="M5 12.5l4.5 4.5L19 7.5"
                strokeDasharray="24"
                strokeDashoffset="24"
                style={{ animation: "sc-draw .45s ease-out .1s forwards" }}
              />
            </svg>
          )}

          {phase === "error" && (
            <svg
              width="26"
              height="26"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
            >
              <line x1="12" y1="7" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          )}

          {phase === "confirm" && (
            <svg
              width="26"
              height="26"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 12h14" />
              <path d="M13 6l6 6-6 6" />
            </svg>
          )}
        </div>

        <h2 className="mt-4 text-center text-lg font-bold text-gray-900">
          {titles[phase]}
        </h2>

        <p className="mt-1 text-center text-sm text-gray-500">
          {phase === "error" ? (
            errorMessage
          ) : (
            <>
              <span className="font-semibold text-gray-700">
                {labelFor(from)}
              </span>
              {"  →  "}
              <span
                className={`font-semibold ${isReject ? "text-red-600" : "text-emerald-600"}`}
              >
                {labelFor(to)}
              </span>
            </>
          )}
        </p>

        {/* STEPS */}
        <div className="relative mt-7 mb-1">
          <div className="absolute left-[10%] right-[10%] top-4 h-1 rounded-full bg-gray-200" />
          <div
            className={`absolute left-[10%] top-4 h-1 rounded-full transition-[width,background-color] ease-out ${tone.fill}`}
            style={{ width: `${lineWidth}%`, transitionDuration: "700ms" }}
          />

          <ol className="relative grid grid-cols-5">
            {STEPS.map((step, i) => {
              const reached = i <= shownIndex;
              const isCurrent = i === shownIndex;
              const delay =
                i > fromIndex && i <= shownIndex
                  ? (i - fromIndex) * stepMs
                  : 0;

              return (
                <li key={step.key} className="flex flex-col items-center">
                  <div className="relative">
                    {isCurrent && phase !== "success" && !rejected && (
                      <span className="absolute inset-0 animate-ping rounded-full bg-emerald-400/50" />
                    )}

                    <div
                      className={`relative flex h-9 w-9 items-center justify-center rounded-full border-2 text-xs font-bold transition-all duration-500 ${
                        reached
                          ? `${tone.node} text-white scale-100`
                          : "border-gray-300 bg-white text-gray-400 scale-95"
                      }`}
                      style={{ transitionDelay: `${delay}ms` }}
                    >
                      {reached && !isCurrent ? (
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M5 12.5l4.5 4.5L19 7.5" />
                        </svg>
                      ) : (
                        i + 1
                      )}
                    </div>
                  </div>

                  <span
                    className={`mt-2 text-[11px] transition-colors duration-500 ${
                      isCurrent
                        ? "font-bold text-gray-900"
                        : reached
                          ? "font-medium text-gray-600"
                          : "text-gray-400"
                    }`}
                    style={{ transitionDelay: `${delay}ms` }}
                  >
                    {step.label}
                  </span>
                </li>
              );
            })}
          </ol>
        </div>

        {/* REJECTED BADGE (rejection isn't a step on the track) */}
        {isReject && (
          <div
            className={`mt-4 flex justify-center transition-all duration-500 ${
              showReject ? "scale-100 opacity-100" : "scale-75 opacity-0"
            }`}
          >
            <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-600">
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
              >
                <line x1="6" y1="6" x2="18" y2="18" />
                <line x1="18" y1="6" x2="6" y2="18" />
              </svg>
              Application will be rejected
            </span>
          </div>
        )}

        {/* ACTIONS */}
        <div className="mt-7 flex items-center justify-end gap-2">
          {phase === "success" ? (
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-700"
            >
              Done
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={onClose}
                disabled={phase === "saving"}
                className="rounded-lg bg-gray-100 px-4 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleConfirm}
                disabled={phase === "saving"}
                className={`inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold text-white transition-colors disabled:cursor-not-allowed disabled:opacity-70 ${
                  isReject
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-emerald-600 hover:bg-emerald-700"
                }`}
              >
                {phase === "saving"
                  ? "Updating..."
                  : phase === "error"
                    ? "Try again"
                    : "Confirm"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}