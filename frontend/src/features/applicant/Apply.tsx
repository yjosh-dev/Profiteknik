import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { MdCheckCircle, MdError } from "react-icons/md";

import { jobListingService } from "../../service/api/applicants/jobListingService";
import { applicantApplicationService } from "../../service/api/applicants/applicantApplicationService";
import JobDetailPanel from "../../components/common/JobDetail";
import StatusModal from "../../components/ui/StatusModal";
import type { JobDetail } from "../../types/JobDetailType";

import logo from "../../assets/logo/profiteknik_logo_only.svg";

type ModalState = {
  heading: string;
  description: string;
  icon: React.ReactNode;
  button_name: string;
  button_color: string;
  onClick: () => void;
};

const RED_BUTTON = "bg-red-700 text-white hover:bg-red-800";
const GREEN_BUTTON = "bg-green-600 text-white hover:bg-green-700";

// Pull the real message from the backend response, fall back to a generic one
const getErrorMessage = (error: unknown, fallback: string): string => {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data;

    // Laravel validation errors: { message, errors: { field: ["msg"] } }
    if (data?.errors) {
      const firstError = Object.values(data.errors).flat()[0];
      if (typeof firstError === "string") return firstError;
    }

    if (typeof data?.message === "string" && data.message) {
      return data.message;
    }

    // No response at all means a real network problem
    if (!error.response) {
      return "Unable to reach the server. Please check your internet connection.";
    }
  }
  return fallback;
};

export default function Apply() {
  const { job_id } = useParams<{ job_id: string }>();
  const navigate = useNavigate();

  const [job, setJob] = useState<JobDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Form state
  const [answers, setAnswers] = useState<Record<number, string>>({});

  // Status modal state
  const [modal, setModal] = useState<ModalState | null>(null);

  const closeModal = () => setModal(null);

  const showError = (
    heading: string,
    description: string,
    onClose?: () => void,
    button_name = "Okay",
  ) => {
    setModal({
      heading,
      description,
      icon: <MdError className="text-red-700" />,
      button_name,
      button_color: RED_BUTTON,
      onClick: () => {
        closeModal();
        onClose?.();
      },
    });
  };

  const showSuccess = (
    heading: string,
    description: string,
    onClose?: () => void,
    button_name = "Continue",
  ) => {
    setModal({
      heading,
      description,
      icon: <MdCheckCircle className="text-green-600" />,
      button_name,
      button_color: GREEN_BUTTON,
      onClick: () => {
        closeModal();
        onClose?.();
      },
    });
  };

  // Fetch job details on load
  useEffect(() => {
    if (!job_id) return;

    const loadJob = async () => {
      try {
        setLoading(true);
        const response = await jobListingService.fetchJobListing(job_id);
        setJob(response.data.data || response.data);
      } catch (error) {
        console.error("Failed to load job details:", error);
        showError(
          "Unable to load job",
          getErrorMessage(
            error,
            "We couldn't load the job details. Please check your connection and try again.",
          ),
        );
      } finally {
        setLoading(false);
      }
    };

    loadJob();
  }, [job_id]);

  const handleAnswerChange = (questionId: number, value: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!job_id) return;

    const token =
      localStorage.getItem("token") || localStorage.getItem("ACCESS_TOKEN");

    if (!token) {
      showError(
        "Session expired",
        "Your session has expired or you are not logged in. Please log in again.",
        () => navigate("/login"),
        "Go to Login",
      );
      return;
    }

    try {
      setSubmitting(true);

      // Map answer values directly into an array of strings
      const screeningAnswersArray =
        job?.screening_questions?.map((q) => answers[q.question_id] || "") ||
        [];

      const payload = {
        screening_answers: screeningAnswersArray,
      };

      console.log("Submitting Payload:", payload);

      await applicantApplicationService.applyJob(job_id, payload, token);

      showSuccess(
        "Application submitted",
        "Your application has been sent to the hiring team. Good luck!",
        () => navigate(-2),
        "Done",
      );
    } catch (error) {
      console.error("Failed to submit application:", error);

      const status = axios.isAxiosError(error)
        ? error.response?.status
        : undefined;

      // Expired or invalid token
      if (status === 401) {
        showError(
          "Session expired",
          "Your session has expired. Please log in again.",
          () => navigate("/login"),
          "Go to Login",
        );
        return;
      }

      showError(
        status === 409 || status === 400
          ? "Unable to apply"
          : "Submission failed",
        getErrorMessage(
          error,
          "We couldn't submit your application. Please try again.",
        ),
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Modal overlay, rendered in every non-loading view
  const modalOverlay = modal && (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
      <StatusModal
        heading={modal.heading}
        description={modal.description}
        icon={modal.icon}
        button_name={modal.button_name}
        button_color={modal.button_color}
        onClick={modal.onClick}
      />
    </div>
  );

  if (loading) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-zinc-50">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-red-700 border-t-transparent rounded-full animate-spin" />
          <p className="text-zinc-600 font-medium text-sm">
            Loading application details...
          </p>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="w-screen h-screen flex flex-col items-center justify-center bg-zinc-50 gap-4">
        <p className="text-zinc-600 font-medium">Job listing not found.</p>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="px-5 py-2 bg-red-700 text-white rounded-lg text-sm hover:bg-red-800 transition-colors shadow-xs"
        >
          Go Back
        </button>
        {modalOverlay}
      </div>
    );
  }

  return (
    <div className="w-screen h-screen bg-zinc-100 flex flex-col overflow-hidden font-sans">
      {/* Top Header Bar */}
      <header className="bg-white border-b border-zinc-200 px-6 py-3.5 flex justify-between items-center shrink-0 shadow-xs">
        <div className="flex gap-2">
          <img src={logo} className="w-10 h-10" />
          <div className="">
            <p className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">
              Job Application
            </p>
            <h1 className="font-semibold text-lg text-zinc-800 leading-tight">
              {job.job_title}
            </h1>
          </div>
        </div>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="text-xs px-4 py-2 border border-zinc-300 rounded-lg text-zinc-700 bg-white hover:bg-red-50 hover:text-red-700 hover:border-red-200 font-medium transition-all cursor-pointer"
        >
          Cancel Application
        </button>
      </header>

      {/* Main Split Body */}
      <div className="flex-1 flex overflow-hidden p-6 gap-6 max-w-7xl w-full mx-auto">
        {/* LEFT COLUMN: Questions & Form */}
        <div className="flex-1 bg-white rounded-xl border border-zinc-200/80 p-6 overflow-y-auto flex flex-col justify-between shadow-xs">
          <form id="apply-form" onSubmit={handleSubmit} className="space-y-6">
            <div className="border-b border-zinc-200 pb-3">
              <h2 className="text-lg font-semibold text-zinc-900">
                Application Questions
              </h2>
              <p className="text-xs text-zinc-500 mt-0.5">
                Please complete the questions below required by the employer.
              </p>
            </div>

            {/* Dynamic Screening Questions */}
            {job.screening_questions && job.screening_questions.length > 0 ? (
              <div className="space-y-5">
                {job.screening_questions.map((q, index) => (
                  <div key={q.question_id} className="space-y-2">
                    <label className="block text-sm font-medium text-zinc-800">
                      <span className="text-red-700 font-semibold mr-1">
                        Q{index + 1}.
                      </span>
                      {q.screening_question}{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={answers[q.question_id] || ""}
                      onChange={(e) =>
                        handleAnswerChange(q.question_id, e.target.value)
                      }
                      placeholder="Type your answer here..."
                      className="w-full p-3 text-sm bg-zinc-50 border border-zinc-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-red-600 focus:border-transparent outline-none transition-all placeholder:text-zinc-400"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-zinc-500 text-sm bg-zinc-50 rounded-lg border border-dashed border-zinc-200">
                No screening questions required for this position. Click below
                to submit your application.
              </div>
            )}
          </form>

          {/* Action Footer */}
          <div className="pt-5 border-t border-zinc-200 mt-6 flex items-center justify-between">
            <p className="text-xs text-zinc-400">
              By submitting, your details will be sent to the hiring team.
            </p>
            <button
              type="submit"
              form="apply-form"
              disabled={submitting}
              className="px-7 py-2.5 rounded-lg bg-red-700 text-white text-sm font-medium hover:bg-red-800 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all cursor-pointer disabled:opacity-50 shadow-xs"
            >
              {submitting ? "Submitting..." : "Submit Application"}
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: Job Detail Panel */}
        <div className="hidden lg:block w-[440px] shrink-0 h-full overflow-y-auto border border-zinc-200/80 rounded-xl bg-white shadow-xs">
          <JobDetailPanel job={job} />
        </div>
      </div>

      {modalOverlay}
    </div>
  );
}