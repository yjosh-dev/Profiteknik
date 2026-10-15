import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Document, Page, pdfjs } from "react-pdf";
import {
  FaFilePdf,
  FaXmark,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa6";

import { applicantScreeningService } from "../../../service/api/employee/applicantScreeningService";

// Required for react-pdf
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

/* =========================================================
   TYPES
========================================================= */

export interface Experience {
  record_id: number;
  position: string;
  company_name: string;
  start_date: string;
  end_date?: string | null;
}

export interface Skill {
  skill_id?: number;
  skill_name: string;
}

export interface Resume {
  record_id: number;
  name: string;
  mime_type: string;
  date_uploaded: string;
  data: string; // base64
}

export interface Applicant {
  applicant_id: number;
  first_name: string;
  middle_name?: string | null;
  last_name: string;
  profile_image_url?: string | null;
  email: string;
  phone_no?: string | null;
  tel_no?: string | null;
  experiences: Experience[];
  skills: Skill[];
  resume?: Resume | null;
}

export interface ScreeningQA {
  question_id: number;
  question_text: string;
  answer_text: string;
}

export interface ScreeningData {
  application_id: number;
  job_id: number;
  status: string;
  date_applied: string;
  applicant: Applicant;
  screening_qa: ScreeningQA[];
}

/* =========================================================
   SCORE GAUGE
========================================================= */

interface ScoreGaugeProps {
  score: number;
  label: string;
}

function ScoreGauge({ score, label }: ScoreGaugeProps) {
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const progress = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-24 h-24">
        <svg
          className="w-full h-full -rotate-90"
          viewBox="0 0 100 100"
        >
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke="#E8E6E0"
            strokeWidth="8"
          />

          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke="#991B1B"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={progress}
          />
        </svg>

        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xl font-bold text-[#1C2321]">
            {score}%
          </span>
        </div>
      </div>

      <span className="text-sm font-semibold text-[#6B6F76]">
        {label}
      </span>
    </div>
  );
}

/* =========================================================
   QUESTIONNAIRE
========================================================= */

interface QuestionnaireViewProps {
  screeningQa: ScreeningQA[];
}

function QuestionnaireView({
  screeningQa,
}: QuestionnaireViewProps) {
  if (!screeningQa.length) {
    return (
      <div className="py-10 text-center text-[#6B6F76]">
        No screening questions found.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {screeningQa.map((item, index) => (
        <div
          key={item.question_id}
          className="border border-[#E3E0D8] rounded-lg p-4"
        >
          <p className="text-sm font-bold text-[#1C2321] mb-2">
            Question {index + 1}
          </p>

          <p className="text-sm text-[#4B504D] mb-4">
            {item.question_text}
          </p>

          <div className="bg-[#FAF9F6] border border-[#E3E0D8] rounded-lg p-3">
            <p className="text-xs font-semibold text-[#6B6F76] mb-1">
              Applicant Answer
            </p>

            <p className="text-sm text-[#1C2321]">
              {item.answer_text || "No answer provided."}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

/* =========================================================
   RESUME VIEW
========================================================= */

interface ResumeViewProps {
  resume?: Resume | null;
}

function ResumeView({ resume }: ResumeViewProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [resumeUrl, setResumeUrl] = useState<string | null>(null);

  // Hooks must run before any early return
  useEffect(() => {
    if (!resume?.data) {
      setResumeUrl(null);
      return;
    }

    const bytes = Uint8Array.from(atob(resume.data), (c) =>
      c.charCodeAt(0),
    );
    const url = URL.createObjectURL(
      new Blob([bytes], { type: resume.mime_type }),
    );
    setResumeUrl(url);

    return () => URL.revokeObjectURL(url);
  }, [resume?.data, resume?.mime_type]);

  if (!resume) {
    return (
      <div className="py-10 text-center text-[#6B6F76]">
        No resume uploaded.
      </div>
    );
  }

  if (!resumeUrl) {
    return (
      <div className="py-10 text-center text-[#6B6F76]">
        Loading resume...
      </div>
    );
  }

  // react-pdf only renders PDFs, so offer a download for Word files
  if (resume.mime_type !== "application/pdf") {
    return (
      <div className="border border-[#E3E0D8] rounded-xl p-6 flex items-center justify-between">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-[#1C2321] truncate">
            {resume.name}
          </p>
          <p className="text-xs text-[#6B6F76]">
            Preview isn't available for this file type.
          </p>
        </div>

        <a
          href={resumeUrl}
          download={resume.name}
          className="px-4 py-2 rounded-lg bg-[#991B1B] text-white text-sm font-semibold hover:bg-[#7F1616] transition-colors shrink-0"
        >
          Download
        </a>
      </div>
    );
  }

  const onDocumentLoadSuccess = ({
    numPages,
  }: {
    numPages: number;
  }) => {
    setNumPages(numPages);
    setPageNumber(1);
  };

  const previousPage = () => {
    setPageNumber((current) => Math.max(current - 1, 1));
  };

  const nextPage = () => {
    setPageNumber((current) =>
      Math.min(current + 1, numPages),
    );
  };

  return (
    <>
      {/* =====================================================
          SMALL PDF PREVIEW
      ===================================================== */}
      <div className="space-y-4">
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="w-full text-left group"
        >
          <div className="border border-[#E3E0D8] rounded-xl overflow-hidden bg-[#FAFAFA] hover:border-[#991B1B] transition-colors">
            {/* Preview Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#E3E0D8] bg-white">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-lg bg-red-50 text-[#991B1B] flex items-center justify-center shrink-0">
                  <FaFilePdf size={17} />
                </div>

                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[#1C2321] truncate">
                    Resume
                  </p>

                  <p className="text-xs text-[#6B6F76]">
                    Click to view full resume
                  </p>
                </div>
              </div>

              <span className="text-xs font-semibold text-[#991B1B] shrink-0">
                Open
              </span>
            </div>

            {/* Partial PDF */}
            <div className="relative h-[360px] overflow-hidden flex justify-center bg-[#EDEBE6]">
              <Document
                file={resumeUrl}
                onLoadSuccess={onDocumentLoadSuccess}
                loading={
                  <div className="flex items-center justify-center h-full text-sm text-[#6B6F76]">
                    Loading resume...
                  </div>
                }
                error={
                  <div className="flex items-center justify-center h-full px-6 text-center text-sm text-red-500">
                    Failed to load resume.
                  </div>
                }
              >
                <Page
                  pageNumber={1}
                  width={500}
                  renderTextLayer={false}
                  renderAnnotationLayer={false}
                />
              </Document>

              {/* Fade at bottom so it looks intentionally partial */}
              <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#EDEBE6] to-transparent pointer-events-none" />

              {/* Click overlay */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-white/95 rounded-lg shadow-md text-xs font-semibold text-[#1C2321]">
                Click to view full resume
              </div>
            </div>
          </div>
        </button>
      </div>

      {/* =====================================================
          PDF MODAL
      ===================================================== */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="relative w-full max-w-5xl h-[90vh] bg-[#FAF9F6] rounded-xl shadow-2xl overflow-hidden flex flex-col"
            onClick={(event) => event.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-4 bg-white border-b border-[#E3E0D8] shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-lg bg-red-50 text-[#991B1B] flex items-center justify-center">
                  <FaFilePdf size={17} />
                </div>

                <div className="min-w-0">
                  <h2 className="font-bold text-[#1C2321]">
                    Applicant Resume
                  </h2>

                  <p className="text-xs text-[#6B6F76]">
                    Page {pageNumber} of {numPages || 1}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-9 h-9 rounded-lg flex items-center justify-center text-[#6B6F76] hover:bg-[#F0EEEA] hover:text-[#991B1B] transition-colors"
                aria-label="Close resume"
              >
                <FaXmark size={20} />
              </button>
            </div>

            {/* PDF Content */}
            <div className="flex-1 overflow-auto bg-[#E5E3DE] p-6">
              <div className="flex justify-center">
                <Document
                  file={resumeUrl}
                  onLoadSuccess={onDocumentLoadSuccess}
                  loading={
                    <div className="flex items-center justify-center min-h-[500px] text-sm text-[#6B6F76]">
                      Loading resume...
                    </div>
                  }
                  error={
                    <div className="flex items-center justify-center min-h-[500px] text-sm text-red-500">
                      Failed to load resume.
                    </div>
                  }
                >
                  <Page
                    pageNumber={pageNumber}
                    width={Math.min(
                      window.innerWidth * 0.7,
                      850,
                    )}
                    renderTextLayer={false}
                    renderAnnotationLayer={false}
                  />
                </Document>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-center gap-4 px-5 py-4 bg-white border-t border-[#E3E0D8] shrink-0">
              <button
                type="button"
                onClick={previousPage}
                disabled={pageNumber <= 1}
                className="w-10 h-10 rounded-lg border border-[#E3E0D8] flex items-center justify-center text-[#1C2321] hover:bg-[#FAF9F6] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                aria-label="Previous page"
              >
                <FaChevronLeft size={14} />
              </button>

              <span className="text-sm font-semibold text-[#1C2321] min-w-[80px] text-center">
                {pageNumber} / {numPages || 1}
              </span>

              <button
                type="button"
                onClick={nextPage}
                disabled={
                  pageNumber >= numPages ||
                  numPages === 0
                }
                className="w-10 h-10 rounded-lg border border-[#E3E0D8] flex items-center justify-center text-[#1C2321] hover:bg-[#FAF9F6] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                aria-label="Next page"
              >
                <FaChevronRight size={14} />
              </button>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="ml-3 px-5 py-2.5 rounded-lg bg-[#991B1B] text-white text-sm font-semibold hover:bg-[#7F1616] transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* =========================================================
   EXPERIENCE VIEW
========================================================= */

interface ExperienceViewProps {
  experiences: Experience[];
}

function ExperienceView({
  experiences,
}: ExperienceViewProps) {
  if (!experiences.length) {
    return (
      <div className="py-10 text-center text-[#6B6F76]">
        No work experience found.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {experiences.map((experience) => (
        <div
          key={experience.record_id}
          className="border border-[#E3E0D8] rounded-lg p-4"
        >
          <h3 className="font-bold text-[#1C2321]">
            {experience.position}
          </h3>

          <p className="text-sm text-[#6B6F76] mt-1">
            {experience.company_name}
          </p>

          <p className="text-xs text-[#6B6F76] mt-3">
            {new Date(
              experience.start_date,
            ).toLocaleDateString()}{" "}
            -{" "}
            {experience.end_date
              ? new Date(
                  experience.end_date,
                ).toLocaleDateString()
              : "Present"}
          </p>
        </div>
      ))}
    </div>
  );
}

/* =========================================================
   SKILLS VIEW
========================================================= */

interface SkillsViewProps {
  skills: Skill[];
}

function SkillsView({ skills }: SkillsViewProps) {
  if (!skills.length) {
    return (
      <div className="py-10 text-center text-[#6B6F76]">
        No skills found.
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {skills.map((skill, index) => (
        <span
          key={skill.skill_id ?? index}
          className="px-3 py-2 rounded-lg bg-[#FAF9F6] border border-[#E3E0D8] text-sm font-medium text-[#1C2321]"
        >
          {skill.skill_name}
        </span>
      ))}
    </div>
  );
}

/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function ApplicantEvaluation() {
  const [searchParams] = useSearchParams();

  const jobId = searchParams.get("job_id");
  const applicantId = searchParams.get("applicant_id");

  const [applicantData, setApplicantData] =
    useState<ScreeningData | null>(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(
    null,
  );

  const [activeTab, setActiveTab] =
    useState("questionnaire");

  /* =======================================================
     FETCH SCREENING DATA
  ======================================================= */

  useEffect(() => {
    const fetchScreeningDetails = async () => {
      if (!jobId || !applicantId) {
        setError(
          "Missing job ID or applicant ID in URL.",
        );

        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const response =
          await applicantScreeningService.getScreeningDetails(
            jobId,
            applicantId,
          );

        setApplicantData(response.data.data);
      } catch (err: any) {
        console.error(
          "Failed to fetch screening details:",
          err,
        );

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

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-sm text-[#6B6F76]">
          Loading applicant evaluation...
        </p>
      </div>
    );
  }

  /* =======================================================
     ERROR
  ======================================================= */

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-sm text-red-500">
          {error}
        </p>
      </div>
    );
  }

  /* =======================================================
     EMPTY
  ======================================================= */

  if (!applicantData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-sm text-[#6B6F76]">
          No applicant evaluation data found.
        </p>
      </div>
    );
  }

  const applicant = applicantData.applicant;

  /* =======================================================
     TABS
  ======================================================= */

  const tabs = [
    {
      id: "questionnaire",
      label: "Questionnaire",
    },
    {
      id: "resume",
      label: "Resume",
    },
    {
      id: "experience",
      label: "Experience",
    },
    {
      id: "skills",
      label: "Skills",
    },
  ];

  return (
    <div className="w-full">
      {/* =====================================================
          TITLE
      ===================================================== */}

      <div className="mb-6">
        <h2 className="text-xl font-bold text-[#1C2321]">
          Applicant Evaluation
        </h2>

        <p className="text-sm text-[#6B6F76] mt-1">
          Review the applicant's qualifications and
          submitted information.
        </p>
      </div>

      {/* =====================================================
          SCORE SECTION
      ===================================================== */}

      <div className="border border-[#E3E0D8] rounded-xl p-5 mb-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <ScoreGauge
            score={85}
            label="Skills"
          />

          <ScoreGauge
            score={60}
            label="Experience"
          />

          <ScoreGauge
            score={90}
            label="Education"
          />

          <ScoreGauge
            score={75}
            label="Questions"
          />
        </div>
      </div>

      {/* =====================================================
          CONTENT TABS
      ===================================================== */}

      <div className="border-b border-[#E3E0D8] mb-6">
        <div className="flex items-center gap-1 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab.id
                  ? "text-[#991B1B] border-[#991B1B]"
                  : "text-[#6B6F76] border-transparent hover:text-[#991B1B]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* =====================================================
          TAB CONTENT
      ===================================================== */}

      <div>
        {activeTab === "questionnaire" && (
          <QuestionnaireView
            screeningQa={
              applicantData.screening_qa
            }
          />
        )}

        {activeTab === "resume" && (
          <ResumeView
            resume={applicant.resume}
          />
        )}

        {activeTab === "experience" && (
          <ExperienceView
            experiences={
              applicant.experiences
            }
          />
        )}

        {activeTab === "skills" && (
          <SkillsView
            skills={applicant.skills}
          />
        )}
      </div>
    </div>
  );
}