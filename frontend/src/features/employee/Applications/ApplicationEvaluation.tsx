import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Document, Page, pdfjs } from "react-pdf";
import {
  FaFilePdf,
  FaXmark,
  FaChevronLeft,
  FaChevronRight,
  FaBriefcase,
  FaInbox,
} from "react-icons/fa6";

import { applicantScreeningService } from "../../../service/api/employee/applicantScreeningService";
import MatchScoreCard, {
  MOCK_MATCH_SCENARIOS,
  type MatchInput,
} from "../../../components/common/MatchScoreCard";

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
  education?: string | null; // e.g. "High School Graduate"
  resume?: Resume | null;
}

export interface ScreeningQA {
  question_id: number;
  question_text: string;
  answer_text: string;
}

// What the job asks for (matches the `job` object in the screening response)
export interface JobSkillRequirement {
  record_id: number;
  job_id: number;
  skills: string; // the skill name
}

export interface JobRequirements {
  job_id: number;
  highest_education: string; // e.g. "High School"
  experience: number; // required years
}

export interface ScreeningJob {
  job_id: number;
  job_title: string;
  requirements?: JobRequirements | null;
  skill_requirements: JobSkillRequirement[];
}

export interface ScreeningData {
  application_id: number;
  job_id: number;
  status: string;
  date_applied: string;
  applicant: Applicant;
  screening_qa: ScreeningQA[];
  job?: ScreeningJob | null;
}

/* =========================================================
   HELPERS
========================================================= */

const formatDate = (value?: string | null) =>
  value
    ? new Date(value).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "";

// Rough ranking so "College Graduate" meets "High School Graduate".
// Order matters: more specific phrases come first. If you'd rather not guess
// from text, have the backend return a boolean instead.
const EDUCATION_RANKS: [string, number][] = [
  ["doctor", 7],
  ["phd", 7],
  ["master", 6],
  ["bachelor", 5],
  ["college", 5],
  ["associate", 4],
  ["vocational", 4],
  ["tesda", 4],
  ["senior high", 3],
  ["high school", 2],
  ["secondary", 2],
  ["elementary", 1],
  ["primary", 1],
];

const educationRank = (value?: string | null) => {
  const text = (value ?? "").toLowerCase();
  return EDUCATION_RANKS.find(([key]) => text.includes(key))?.[1] ?? 0;
};

const MS_PER_YEAR = 1000 * 60 * 60 * 24 * 365.25;

// Total years worked. Overlapping jobs are merged so they aren't counted
// twice, an empty end_date means "still working", and future dates are
// capped at today.
function calculateYearsOfExperience(experiences: Experience[]): number {
  const now = Date.now();

  const ranges = experiences
    .map((e) => ({
      start: new Date(e.start_date).getTime(),
      end: Math.min(e.end_date ? new Date(e.end_date).getTime() : now, now),
    }))
    .filter((r) => !Number.isNaN(r.start) && !Number.isNaN(r.end) && r.end > r.start)
    .sort((a, b) => a.start - b.start);

  let totalMs = 0;
  let current: { start: number; end: number } | null = null;

  for (const r of ranges) {
    if (!current) current = { ...r };
    else if (r.start <= current.end) current.end = Math.max(current.end, r.end);
    else {
      totalMs += current.end - current.start;
      current = { ...r };
    }
  }
  if (current) totalMs += current.end - current.start;

  return Math.round((totalMs / MS_PER_YEAR) * 10) / 10;
}

/* =========================================================
   SHARED UI
========================================================= */

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-14 text-[#6B6F76] bg-[#FAF9F6] rounded-xl">
      <div className="w-12 h-12 rounded-full bg-[#F0EEEA] flex items-center justify-center">
        <FaInbox size={18} />
      </div>
      <p className="archivo text-sm">{message}</p>
    </div>
  );
}

/* =========================================================
   SCORE SELECTOR (1-5)
========================================================= */

interface ScoreSelectorProps {
  value?: number;
  onChange: (score: number | undefined) => void;
}

function ScoreSelector({ value, onChange }: ScoreSelectorProps) {
  return (
    <div className="mt-4 ml-10">
      <div className="flex items-center justify-between mb-2">
        <p className="archivo text-[11px] font-bold uppercase tracking-wide text-[#6B6F76]">
          Your score
        </p>
        <p className="archivo text-[11px] text-[#6B6F76]">
          1 = Poor · 5 = Excellent
        </p>
      </div>

      <div
        className="flex items-center gap-2"
        role="radiogroup"
        aria-label="Score"
      >
        {[1, 2, 3, 4, 5].map((n) => {
          const isSelected = value === n;
          return (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={isSelected}
              // clicking the selected score again clears it
              onClick={() => onChange(isSelected ? undefined : n)}
              className={`archivo flex-1 h-10 rounded-lg text-sm font-bold transition-colors cursor-pointer ${
                isSelected
                  ? "bg-[#991B1B] text-white"
                  : "bg-white text-[#1C2321] hover:bg-[#F0EEEA]"
              }`}
            >
              {n}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* =========================================================
   QUESTIONNAIRE
========================================================= */

interface QuestionnaireViewProps {
  screeningQa: ScreeningQA[];
  scores: Record<number, number>;
  onScoreChange: (questionId: number, score: number | undefined) => void;
}

function QuestionnaireView({
  screeningQa,
  scores,
  onScoreChange,
}: QuestionnaireViewProps) {
  if (!screeningQa.length) {
    return <EmptyState message="No screening questions found." />;
  }

  return (
    <div className="space-y-4">
      {screeningQa.map((item, index) => (
        <div key={item.question_id} className="bg-[#FAF9F6] rounded-xl p-5">
          <div className="flex items-start gap-3">
            <span className="archivo w-7 h-7 rounded-full bg-[#991B1B]/10 text-[#991B1B] text-xs font-bold flex items-center justify-center shrink-0">
              {index + 1}
            </span>

            <p className="archivo text-sm font-semibold text-[#1C2321] leading-relaxed pt-1">
              {item.question_text}
            </p>
          </div>

          <div className="mt-4 ml-10 bg-white rounded-lg p-4">
            <p className="archivo text-[11px] font-bold uppercase tracking-wide text-[#6B6F76] mb-1.5">
              Applicant answer
            </p>

            <p className="archivo text-sm text-[#1C2321] leading-relaxed">
              {item.answer_text || (
                <span className="text-[#6B6F76] italic">
                  No answer provided.
                </span>
              )}
            </p>
          </div>

          <ScoreSelector
            value={scores[item.question_id]}
            onChange={(score) => onScoreChange(item.question_id, score)}
          />
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

    const bytes = Uint8Array.from(atob(resume.data), (c) => c.charCodeAt(0));
    const url = URL.createObjectURL(
      new Blob([bytes], { type: resume.mime_type }),
    );
    setResumeUrl(url);

    return () => URL.revokeObjectURL(url);
  }, [resume?.data, resume?.mime_type]);

  // Keyboard controls while the modal is open
  useEffect(() => {
    if (!isModalOpen) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsModalOpen(false);
      if (e.key === "ArrowLeft") setPageNumber((c) => Math.max(c - 1, 1));
      if (e.key === "ArrowRight")
        setPageNumber((c) => Math.min(c + 1, numPages || 1));
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isModalOpen, numPages]);

  if (!resume) {
    return <EmptyState message="No resume uploaded." />;
  }

  if (!resumeUrl) {
    return <EmptyState message="Loading resume..." />;
  }

  // react-pdf only renders PDFs, so offer a download for Word files
  if (resume.mime_type !== "application/pdf") {
    return (
      <div className="bg-[#FAF9F6] rounded-xl p-5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-lg bg-red-50 text-[#991B1B] flex items-center justify-center shrink-0">
            <FaFilePdf size={18} />
          </div>

          <div className="min-w-0">
            <p className="archivo text-sm font-semibold text-[#1C2321] truncate">
              {resume.name}
            </p>
            <p className="archivo text-xs text-[#6B6F76]">
              Preview isn't available for this file type.
            </p>
          </div>
        </div>

        <a
          href={resumeUrl}
          download={resume.name}
          className="archivo px-4 py-2 rounded-lg bg-[#991B1B] text-white text-sm font-semibold hover:bg-[#7F1616] transition-colors shrink-0"
        >
          Download
        </a>
      </div>
    );
  }

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setPageNumber(1);
  };

  const previousPage = () => {
    setPageNumber((current) => Math.max(current - 1, 1));
  };

  const nextPage = () => {
    setPageNumber((current) => Math.min(current + 1, numPages));
  };

  return (
    <>
      {/* =====================================================
          SMALL PDF PREVIEW
      ===================================================== */}
      <button
        type="button"
        onClick={() => setIsModalOpen(true)}
        className="w-full text-left group cursor-pointer"
      >
        <div className="rounded-xl overflow-hidden bg-[#FAF9F6] transition-shadow group-hover:shadow-md">
          {/* Preview Header */}
          <div className="flex items-center justify-between gap-3 px-5 py-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-lg bg-red-50 text-[#991B1B] flex items-center justify-center shrink-0">
                <FaFilePdf size={18} />
              </div>

              <div className="min-w-0">
                <p className="archivo text-sm font-semibold text-[#1C2321] truncate">
                  {resume.name || "Resume"}
                </p>

                <p className="archivo text-xs text-[#6B6F76]">
                  Uploaded {formatDate(resume.date_uploaded)}
                </p>
              </div>
            </div>

            <span className="archivo px-3 py-1.5 rounded-lg bg-white text-xs font-bold text-[#991B1B] group-hover:bg-[#991B1B] group-hover:text-white transition-colors shrink-0">
              View full
            </span>
          </div>

          {/* Partial PDF */}
          <div className="relative h-[340px] overflow-hidden flex justify-center bg-[#EDEBE6]">
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
          </div>
        </div>
      </button>

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
            <div className="flex items-center justify-between px-5 py-4 bg-white shadow-sm z-10 shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-lg bg-red-50 text-[#991B1B] flex items-center justify-center">
                  <FaFilePdf size={17} />
                </div>

                <div className="min-w-0">
                  <h2 className="archivo font-bold text-[#1C2321] truncate">
                    {resume.name || "Applicant Resume"}
                  </h2>

                  <p className="archivo text-xs text-[#6B6F76]">
                    Page {pageNumber} of {numPages || 1}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-9 h-9 rounded-lg flex items-center justify-center text-[#6B6F76] hover:bg-[#F0EEEA] hover:text-[#991B1B] transition-colors cursor-pointer"
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
                    width={Math.min(window.innerWidth * 0.7, 850)}
                    renderTextLayer={false}
                    renderAnnotationLayer={false}
                    className="shadow-lg"
                  />
                </Document>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-center gap-3 px-5 py-4 bg-white shadow-[0_-1px_3px_rgba(0,0,0,0.06)] shrink-0">
              <button
                type="button"
                onClick={previousPage}
                disabled={pageNumber <= 1}
                className="w-10 h-10 rounded-lg bg-[#F3F1EC] flex items-center justify-center text-[#1C2321] hover:bg-[#E8E6E0] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                aria-label="Previous page"
              >
                <FaChevronLeft size={14} />
              </button>

              <span className="archivo text-sm font-semibold text-[#1C2321] min-w-[80px] text-center tabular-nums">
                {pageNumber} / {numPages || 1}
              </span>

              <button
                type="button"
                onClick={nextPage}
                disabled={pageNumber >= numPages || numPages === 0}
                className="w-10 h-10 rounded-lg bg-[#F3F1EC] flex items-center justify-center text-[#1C2321] hover:bg-[#E8E6E0] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                aria-label="Next page"
              >
                <FaChevronRight size={14} />
              </button>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="archivo ml-3 px-5 py-2.5 rounded-lg bg-[#991B1B] text-white text-sm font-semibold hover:bg-[#7F1616] transition-colors cursor-pointer"
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

function ExperienceView({ experiences }: ExperienceViewProps) {
  if (!experiences.length) {
    return <EmptyState message="No work experience found." />;
  }

  return (
    <div className="space-y-3">
      {experiences.map((experience) => (
        <div
          key={experience.record_id}
          className="flex items-start gap-4 bg-[#FAF9F6] rounded-xl p-5"
        >
          <div className="w-10 h-10 rounded-lg bg-white text-[#991B1B] flex items-center justify-center shrink-0">
            <FaBriefcase size={16} />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <h3 className="archivo font-bold text-[#1C2321]">
                {experience.position}
              </h3>

              {!experience.end_date && (
                <span className="archivo px-2 py-0.5 rounded-full bg-[#991B1B]/10 text-[#991B1B] text-[11px] font-bold">
                  Current
                </span>
              )}
            </div>

            <p className="archivo text-sm text-[#4B504D] mt-0.5">
              {experience.company_name}
            </p>

            <p className="archivo text-xs text-[#6B6F76] mt-2">
              {formatDate(experience.start_date)} –{" "}
              {experience.end_date ? formatDate(experience.end_date) : "Present"}
            </p>
          </div>
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
    return <EmptyState message="No skills found." />;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {skills.map((skill, index) => (
        <span
          key={skill.skill_id ?? index}
          className="archivo px-3.5 py-2 rounded-full bg-[#F3F1EC] text-sm font-medium text-[#1C2321]"
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

  const [applicantData, setApplicantData] = useState<ScreeningData | null>(
    null,
  );

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState("questionnaire");

  /* =======================================================
     QUESTION SCORES (employee ratings, 1-5 per question)
  ======================================================= */

  const [questionScores, setQuestionScores] = useState<Record<number, number>>(
    {},
  );

  const handleScoreChange = (questionId: number, score: number | undefined) => {
    setQuestionScores((prev) => {
      const next = { ...prev };
      if (score === undefined) delete next[questionId];
      else next[questionId] = score;
      return next;
    });
  };

  /* =======================================================
     MATCH INPUT (feeds MatchScoreCard)
     Hooks must stay above the early returns below.
  ======================================================= */

  const match: MatchInput = useMemo(() => {
    const total = applicantData?.screening_qa.length ?? 0;
    const sum = Object.values(questionScores).reduce((a, b) => a + b, 0);
    const questions = { total, satisfied: sum / 5 }; // ratings out of 5; unrated = 0

    const job = applicantData?.job;
    const applicant = applicantData?.applicant;

    // No job or applicant yet: show sample data for the rest
    if (!job || !applicant) {
      return { ...MOCK_MATCH_SCENARIOS.highlyQualified, questions };
    }

    const requiredEducation = job.requirements?.highest_education ?? "";
    const requiredRank = educationRank(requiredEducation);

    // The response has no applicant education yet, so fall back to sample
    // data (counts as met) until `applicant.education` is returned.
    const sampleEducation = MOCK_MATCH_SCENARIOS.highlyQualified.education;
    const education = applicant.education
      ? {
          required: requiredEducation,
          applicant: applicant.education,
          met:
            requiredRank === 0 ||
            educationRank(applicant.education) >= requiredRank,
        }
      : { ...sampleEducation, required: requiredEducation || sampleEducation.required };

    return {
      skills: {
        required: job.skill_requirements.map((r) => r.skills),
        owned: applicant.skills.map((sk) => sk.skill_name),
      },
      experience: {
        requiredYears: Number(job.requirements?.experience ?? 0),
        applicantYears: calculateYearsOfExperience(applicant.experiences),
      },
      education,
      questions,
      mandatory: [], // not in the response yet
    };
  }, [applicantData, questionScores]);

  /* =======================================================
     FETCH SCREENING DATA
  ======================================================= */

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

        setApplicantData(response.data.data);
        setQuestionScores({}); // reset ratings when a different applicant loads
      } catch (err: any) {
        console.error("Failed to fetch screening details:", err);

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
     LOADING / ERROR / EMPTY
  ======================================================= */

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 min-h-[400px]">
        <div className="h-9 w-9 animate-spin rounded-full border-4 border-[#E8E6E0] border-t-[#991B1B]" />
        <p className="archivo text-sm text-[#6B6F76]">
          Loading applicant evaluation...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="archivo text-sm text-red-600 bg-red-50 rounded-lg px-4 py-3">
          {error}
        </p>
      </div>
    );
  }

  if (!applicantData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="archivo text-sm text-[#6B6F76]">
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
      count: applicantData.screening_qa.length,
    },
    { id: "resume", label: "Resume", count: undefined },
    {
      id: "experience",
      label: "Experience",
      count: applicant.experiences.length,
    },
    { id: "skills", label: "Skills", count: applicant.skills.length },
  ];

  return (
    <div className="w-full">
      {/* =====================================================
          SCORE SECTION
      ===================================================== */}
      <div className="mb-6">
        <MatchScoreCard match={match} />
      </div>

      {/* =====================================================
          CONTENT TABS (segmented control, no borders)
      ===================================================== */}
      <div className="mb-6 overflow-x-auto">
        <div className="inline-flex items-center gap-1 bg-[#F3F1EC] rounded-lg p-1">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`archivo flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? "bg-white text-[#991B1B] shadow-sm"
                    : "text-[#6B6F76] hover:text-[#1C2321]"
                }`}
              >
                {tab.label}
                {tab.count !== undefined && (
                  <span
                    className={`px-1.5 min-w-5 h-5 rounded-full text-[11px] font-bold flex items-center justify-center ${
                      isActive
                        ? "bg-[#991B1B]/10 text-[#991B1B]"
                        : "bg-[#E8E6E0] text-[#6B6F76]"
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* =====================================================
          TAB CONTENT
      ===================================================== */}
      <div>
        {activeTab === "questionnaire" && (
          <QuestionnaireView
            screeningQa={applicantData.screening_qa}
            scores={questionScores}
            onScoreChange={handleScoreChange}
          />
        )}

        {activeTab === "resume" && <ResumeView resume={applicant.resume} />}

        {activeTab === "experience" && (
          <ExperienceView experiences={applicant.experiences} />
        )}

        {activeTab === "skills" && <SkillsView skills={applicant.skills} />}
      </div>
    </div>
  );
}