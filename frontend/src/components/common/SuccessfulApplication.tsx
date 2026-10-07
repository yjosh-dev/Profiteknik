import { useLocation, useNavigate } from "react-router-dom";
import { FaBuilding } from "react-icons/fa6";

// Passed through navigate("/applicant/application-success", { state })
type SuccessState = {
  jobId?: number | string;
  jobTitle?: string;
  company?: string;
  companyLogo?: string; // optional, falls back to the blank placeholder
} | null;

const JOB_WALL_PATH = "/applicant/job_wall";

function SuccessIcon() {
  return (
    <svg
      viewBox="0 0 120 100"
      className="w-36 h-30"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {/* Document */}
      <path
        d="M44 10 H82 L102 30 V88 a2 2 0 0 1 -2 2 H46 a2 2 0 0 1 -2 -2 Z"
        className="fill-red-50/60 stroke-red-600"
        strokeWidth="3"
      />
      <path d="M82 10 V30 H102" className="stroke-red-600" strokeWidth="3" />
      {/* Text lines */}
      <path d="M70 44 H92" className="stroke-red-600" strokeWidth="3" />
      <path d="M62 56 H92" className="stroke-red-600" strokeWidth="3" />
      <path d="M62 68 H92" className="stroke-red-600" strokeWidth="3" />
      {/* Hollow check mark: thick red stroke with a white stroke on top */}
      <path
        d="M20 54 L36 70 L66 30"
        className="stroke-red-600"
        strokeWidth="13"
      />
      <path d="M20 54 L36 70 L66 30" stroke="white" strokeWidth="6" />
    </svg>
  );
}

export default function SuccessfulApplication() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as SuccessState;

  const jobTitle = state?.jobTitle ?? "Your application";
  const company = state?.company;
  const companyLogo = state?.companyLogo;

  const handleBack = () => {
    navigate(
      state?.jobId ? `${JOB_WALL_PATH}?job=${state.jobId}` : JOB_WALL_PATH,
    );
  };

  return (
    <div className="w-full min-h-full flex items-center justify-center bg-zinc-50 px-4 py-10">
      <div className="w-full max-w-xl rounded-lg bg-white border border-gray-100 shadow-sm px-6 py-14 flex flex-col items-center text-center">
        <SuccessIcon />

        <h1 className="archivo mt-10 text-3xl font-light text-zinc-900">
          You have applied successfully!
        </h1>

        <button
          type="button"
          onClick={handleBack}
          className="archivo mt-6 text-sm font-bold bg-red-600 py-2 px-2 rounded-sm text-white hover:border-2 hover:border-red-600 hover:bg-white hover:text-red-600  transition-colors cursor-pointer"
        >
          back to job description
        </button>

      
      </div>
    </div>
  );
}