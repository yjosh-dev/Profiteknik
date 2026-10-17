import { useEffect, useMemo, useState, type ChangeEvent } from "react";

import ContentContainer from "../../components/ui/ContentContainer";
import StatusModal from "../../components/ui/StatusModal";

import { jobListingApi } from "../../service/api/employee/jobListingService";
import { SKILLS_DATABASE, type Skill } from "../../utils/Skills";

import {
  FaCheck,
  FaClipboardList,
  FaTrash,
  FaPlus,
  FaCheckCircle,
  FaSearch,
  FaTimes,
} from "react-icons/fa";

const TOTAL_STEPS = 5;

interface FormDataState {
  job_title: string;
  job_description: string;
  minimum_salary: string | number;
  maximum_salary: string | number;
  vacant_position: number;
  employment_type: string;
  posted_at: string;
  posted_until: string;
  listed_by: string | number;
  requirements: {
    highest_education: string;
    experience: number;
  };
  screening_questions: Array<{ screening_question: string }>;
}

export default function JobListing() {
  // note use context later for listed by
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setErrorModal] = useState<boolean | null>(null);

  const [formData, setFormData] = useState<FormDataState>({
    job_title: "",
    job_description: "",
    minimum_salary: "",
    maximum_salary: "",
    vacant_position: 1,
    employment_type: "",
    posted_at: "",
    posted_until: "",
    listed_by: 10,
    requirements: {
      highest_education: "",
      experience: 0,
    },
    screening_questions: [{ screening_question: "" }],
  });

  // Stores the IDs used by the UI for selecting skills.
  // These are converted to skill names when submitting.
  const [selectedSkillIds, setSelectedSkillIds] = useState<number[]>([]);

  const [steps, setSteps] = useState(1);

  // Input handlers
  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleRequirementChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      requirements: {
        ...prev.requirements,
        [name]: value,
      },
    }));
  };

  const handleQuestionChange = (index: number, value: string) => {
    const updatedQuestions = [...formData.screening_questions];

    updatedQuestions[index].screening_question = value;

    setFormData((prev) => ({
      ...prev,
      screening_questions: updatedQuestions,
    }));
  };

  const handleAddQuestion = () => {
    setFormData((prev) => ({
      ...prev,
      screening_questions: [
        ...prev.screening_questions,
        { screening_question: "" },
      ],
    }));
  };

  const handleRemoveQuestion = (index: number) => {
    if (formData.screening_questions.length === 1) return;

    setFormData((prev) => ({
      ...prev,
      screening_questions: prev.screening_questions.filter(
        (_, i) => i !== index,
      ),
    }));
  };

  const handleToggleSkill = (id: number) => {
    setSelectedSkillIds((prev) =>
      prev.includes(id)
        ? prev.filter((s) => s !== id)
        : [...prev, id],
    );
  };

  const token = localStorage.getItem("token");

  const handleSubmit = async () => {
    setLoading(true);

    if (!token) {
      setLoading(false);
      return;
    }

    try {
      // Convert the selected skill IDs into their corresponding skill names.
      const selectedSkillNames = SKILLS_DATABASE
        .filter((skill) => selectedSkillIds.includes(skill.id))
        .map((skill) => skill.name);

      const payload = {
        ...formData,
        skills: selectedSkillNames,
      };

      console.log("Job Listing Payload:", payload);

      const response = await jobListingApi.storeJobListing(
        payload,
        token,
      );

      if (response.status === 201) {
        setSuccess(true);
      }
    } catch (error: any) {
      if (error.response && error.response.status === 422) {
        console.log(
          "Validation Errors:",
          error.response.data.errors,
        );
      } else {
        console.error(
          "Failed to post job listing:",
          error,
        );
      }

      setErrorModal(true);
    } finally {
      setLoading(false);
    }
  };

  const RenderSteps = () => {
    switch (steps) {
      case 1:
        return (
          <JobDetails
            formData={formData}
            handleChange={handleInputChange}
            handleBack={() =>
              setSteps((prev) => Math.max(1, prev - 1))
            }
            handleNext={() =>
              setSteps((prev) => prev + 1)
            }
          />
        );

      case 2:
        return (
          <JobRequirements
            formData={formData}
            handleChange={handleRequirementChange}
            handleBack={() =>
              setSteps((prev) => prev - 1)
            }
            handleNext={() =>
              setSteps((prev) => prev + 1)
            }
          />
        );

      case 3:
        return (
          <JobScreeningQuestions
            formData={formData}
            handleQuestionChange={handleQuestionChange}
            handleAddQuestion={handleAddQuestion}
            handleRemoveQuestion={handleRemoveQuestion}
            handleBack={() =>
              setSteps((prev) => prev - 1)
            }
            handleNext={() =>
              setSteps((prev) => prev + 1)
            }
          />
        );

      case 4:
        return (
          <JobSkills
            selectedSkillIds={selectedSkillIds}
            handleToggleSkill={handleToggleSkill}
            handleBack={() =>
              setSteps((prev) => prev - 1)
            }
            handleNext={() =>
              setSteps((prev) => prev + 1)
            }
          />
        );

      case 5:
        return (
          <JobReview
            formData={formData}
            handleBack={() =>
              setSteps((prev) => prev - 1)
            }
            handleSubmit={handleSubmit}
          />
        );

      default:
        return null;
    }
  };

  return (
    <ContentContainer className="flex bg-white">
      {RenderSteps()}

      {success && (
        <div className="absolute w-[82%] h-[83%] flex items-center justify-center bg-black/50 rounded-md backdrop-blur-sm">
          <StatusModal
            heading="Job Created Successfully!"
            description="Your new job listing has been published and is now visible to applicants."
            icon={
              <FaCheckCircle className="text-emerald-500 text-6xl" />
            }
            button_name="Continue"
            button_color="bg-emerald-600 hover:bg-emerald-700 text-white"
            onClick={() => {
              setSuccess(false);
            }}
          />
        </div>
      )}

      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="flex flex-col items-center gap-3 rounded-xl bg-white px-8 py-6 shadow-lg">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-red-600" />
            <p className="text-sm font-medium text-gray-700">
              Loading...
            </p>
          </div>
        </div>
      )}
    </ContentContainer>
  );
}

// ============================================================
// JOB DETAILS COMPONENT (STEP 1)
// ============================================================

function JobDetails({
  formData,
  handleChange,
  handleNext,
  handleBack,
}: {
  formData: FormDataState;
  handleChange: (
    e: ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => void;
  handleNext: () => void;
  handleBack: () => void;
}) {
  const currentDate = new Date().toISOString();

  useEffect(() => {
    console.log(currentDate);
  }, []);

  const inputClass =
    "w-full border border-[#D8D5CD] bg-white rounded p-2.5 text-sm text-[#1C2321] focus:outline-none focus:ring-1 focus:ring-[#991B1B] focus:border-[#991B1B]";

  const labelClass =
    "archivo block text-sm text-[#1C2321] mb-1.5";

  return (
    <div className="w-full h-full py-5 px-5 bg-white">
      <Header current_step={1} steps={TOTAL_STEPS} />

      <div className="w-full h-[90%] flex gap-2">
        <div className="w-[25%] h-full mt-5">
          <JobFormStepper currentStep={1} />
        </div>

        <div className="w-[75%] h-[90%] mt-5 bg-[#FAF9F6] border border-[#E3E0D8] rounded-md relative flex flex-col justify-between overflow-hidden">
          <div className="p-8 md:p-10 overflow-y-auto max-h-[calc(100%-4.5rem)]">
            <span className="archivo text-xs text-[#6B6F76]">
              Step 1 of {TOTAL_STEPS} — Details
            </span>

            <h2 className="font-serif text-3xl text-[#1C2321] mt-2 mb-8 leading-tight">
              Job details
            </h2>

            <div className="grid grid-cols-2 gap-6">
              <div className="col-span-2">
                <label className={labelClass}>
                  Job title
                </label>

                <input
                  type="text"
                  name="job_title"
                  value={formData.job_title}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="e.g. Welder"
                />
              </div>

              <div>
                <label className={labelClass}>
                  Employment type
                </label>

                <select
                  name="employment_type"
                  value={formData.employment_type}
                  onChange={handleChange}
                  className={inputClass}
                >
                  <option value="">Select type</option>
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Contract">Contract</option>
                  <option value="Internship">Internship</option>
                </select>
              </div>

              <div>
                <label className={labelClass}>
                  Vacant positions
                </label>

                <input
                  type="number"
                  name="vacant_position"
                  value={formData.vacant_position}
                  onChange={handleChange}
                  min="1"
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>
                  Minimum salary
                </label>

                <input
                  type="number"
                  name="minimum_salary"
                  value={formData.minimum_salary}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="e.g. ₱30000"
                />
              </div>

              <div>
                <label className={labelClass}>
                  Maximum salary
                </label>

                <input
                  type="number"
                  name="maximum_salary"
                  value={formData.maximum_salary}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="e.g. ₱50000"
                />
              </div>

              <div className="col-span-2">
                <label className={labelClass}>
                  Posted until
                </label>

                <input
                  type="date"
                  min={currentDate.toString()}
                  name="posted_until"
                  value={formData.posted_until}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>

              <div className="col-span-2">
                <label className={labelClass}>
                  Job description
                </label>

                <textarea
                  name="job_description"
                  value={formData.job_description}
                  onChange={handleChange}
                  rows={4}
                  className={inputClass}
                  placeholder="Provide role requirements and responsibilities..."
                />
              </div>
            </div>
          </div>

          <div className="border-t border-[#E3E0D8] px-8 md:px-10 py-4 flex items-center justify-end gap-3 bg-[#FAF9F6]">
            <button
              className="archivo h-10 px-5 text-sm font-medium text-[#1C2321] border border-[#D8D5CD] rounded-md hover:bg-[#F1EFE9] transition-colors"
              onClick={handleBack}
            >
              Back
            </button>

            <button
              className="archivo h-10 px-5 text-sm font-medium text-white bg-[#991B1B] rounded-md hover:bg-[#7F1D1D] transition-colors"
              onClick={handleNext}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// JOB REQUIREMENTS COMPONENT (STEP 2)
// ============================================================

function JobRequirements({
  formData,
  handleChange,
  handleNext,
  handleBack,
}: {
  formData: FormDataState;
  handleChange: (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => void;
  handleNext: () => void;
  handleBack: () => void;
}) {
  return (
    <div className="w-full h-full py-5 px-5 bg-white">
      <Header current_step={2} steps={TOTAL_STEPS} />

      <div className="w-full h-[90%] flex gap-2">
        <div className="w-[25%] h-full mt-5">
          <JobFormStepper currentStep={2} />
        </div>

        <div className="w-[75%] h-[90%] mt-5 bg-white border border-[#E3E0D8] rounded-md relative flex flex-col justify-between overflow-hidden">
          <div className="p-8 md:p-10">
            <span className="archivo text-xs text-[#6B6F76]">
              Step 2 of {TOTAL_STEPS} — Requirements
            </span>

            <h2 className="font-serif text-3xl text-[#1C2321] mt-2 mb-8 leading-tight">
              Job requirements
            </h2>

            <div className="grid grid-cols-1 gap-6 max-w-md">
              <div>
                <label className="archivo block text-sm text-[#1C2321] mb-1.5">
                  Highest education attained
                </label>

                <select
                  name="highest_education"
                  value={formData.requirements.highest_education}
                  onChange={handleChange}
                  className="w-full border border-[#D8D5CD] bg-white rounded p-2.5 text-sm text-[#1C2321] focus:outline-none focus:ring-1 focus:ring-red-800 focus:border-red-800"
                >
                  <option value="">
                    Select education level
                  </option>
                  <option value="High School">
                    High School
                  </option>
                  <option value="Vocational">
                    Vocational
                  </option>
                  <option value="Associate">
                    Associate
                  </option>
                  <option value="Bachelor">
                    Bachelor
                  </option>
                  <option value="Master">
                    Master
                  </option>
                  <option value="Doctorate">
                    Doctorate
                  </option>
                </select>
              </div>

              <div>
                <label className="archivo block text-sm text-[#1C2321] mb-1.5">
                  Years of experience required
                </label>

                <input
                  type="number"
                  name="experience"
                  value={formData.requirements.experience}
                  onChange={handleChange}
                  min="0"
                  className="w-full border border-[#D8D5CD] bg-white rounded p-2.5 text-sm text-[#1C2321] focus:outline-none focus:ring-1 focus:ring-red-800 focus:border-red-800"
                  placeholder="e.g. 2"
                />
              </div>
            </div>
          </div>

          <div className="border-t border-[#E3E0D8] px-8 md:px-10 py-4 flex items-center justify-end gap-3 bg-[#FAF9F6]">
            <button
              className="archivo h-10 px-5 text-sm font-medium text-[#1C2321] border border-[#D8D5CD] rounded-md hover:bg-[#F1EFE9] transition-colors"
              onClick={handleBack}
            >
              Back
            </button>

            <button
              className="archivo h-10 px-5 text-sm font-medium text-white bg-red-800 rounded-md hover:bg-red-800/80 transition-colors"
              onClick={handleNext}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// SCREENING QUESTIONS COMPONENT (STEP 3)
// ============================================================

function JobScreeningQuestions({
  formData,
  handleQuestionChange,
  handleAddQuestion,
  handleRemoveQuestion,
  handleNext,
  handleBack,
}: {
  formData: FormDataState;
  handleQuestionChange: (
    index: number,
    value: string,
  ) => void;
  handleAddQuestion: () => void;
  handleRemoveQuestion: (index: number) => void;
  handleNext: () => void;
  handleBack: () => void;
}) {
  return (
    <div className="w-full h-full py-5 px-5">
      <Header current_step={3} steps={TOTAL_STEPS} />

      <div className="w-full h-[90%] flex gap-2">
        <div className="w-[25%] h-full mt-5">
          <JobFormStepper currentStep={3} />
        </div>

        <div className="w-[75%] h-[90%] mt-5 bg-[#FAF9F6] border border-[#E3E0D8] rounded-md relative flex flex-col justify-between overflow-hidden">
          <div className="p-8 md:p-10 overflow-y-auto max-h-[calc(100%-4.5rem)]">
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <span className="archivo text-xs text-[#6B6F76]">
                  Step 3 of {TOTAL_STEPS} — Screening
                </span>

                <h2 className="font-serif text-3xl text-[#1C2321] mt-2 leading-tight">
                  Screening questions
                </h2>
              </div>

              <button
                type="button"
                onClick={handleAddQuestion}
                className="archivo flex items-center gap-2 h-9 px-4 text-sm font-medium text-red-800 border border-red-700/30 bg-red-600/20 rounded-md hover:bg-red-600/10 transition-colors shrink-0 mt-1"
              >
                <FaPlus className="w-3 h-3" />
                Add question
              </button>
            </div>

            <div className="space-y-3">
              {formData.screening_questions.map(
                (q, index) => (
                  <div
                    key={index}
                    className="flex gap-3 items-start border border-[#E3E0D8] rounded-md p-3 bg-white"
                  >
                    <div className="flex items-center justify-center w-7 h-7 mt-6 rounded-full bg-[#F1EFE9] text-[#1C2321] text-xs archivo shrink-0">
                      {index + 1}
                    </div>

                    <div className="flex-1">
                      <label className="archivo block text-xs text-[#6B6F76] mb-1">
                        Question {index + 1}
                      </label>

                      <input
                        type="text"
                        value={q.screening_question}
                        onChange={(e) =>
                          handleQuestionChange(
                            index,
                            e.target.value,
                          )
                        }
                        placeholder="e.g. How many years of experience do you have with Welding?"
                        className="w-full border border-[#D8D5CD] rounded p-2 text-sm text-[#1C2321] focus:outline-none focus:ring-1 focus:ring-[#0E6B58] focus:border-[#0E6B58]"
                      />
                    </div>

                    {formData.screening_questions.length >
                      1 && (
                      <button
                        type="button"
                        onClick={() =>
                          handleRemoveQuestion(index)
                        }
                        className="mt-6 p-1.5 text-[#9A5B52] hover:text-[#7A4640] transition-colors"
                        title="Remove question"
                      >
                        <FaTrash className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ),
              )}
            </div>
          </div>

          <div className="border-t border-[#E3E0D8] px-8 md:px-10 py-4 flex items-center justify-end gap-3 bg-[#FAF9F6]">
            <button
              className="archivo h-10 px-5 text-sm font-medium text-[#1C2321] border border-[#D8D5CD] rounded-md hover:bg-[#F1EFE9] transition-colors"
              onClick={handleBack}
            >
              Back
            </button>

            <button
              className="archivo h-10 px-5 text-sm font-medium text-white bg-red-800 rounded-md hover:bg-red-500/80 transition-colors"
              onClick={handleNext}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// SKILLS COMPONENT (STEP 4)
// ============================================================

const SKILL_PAGE_SIZE = 20;

const SKILL_CATEGORIES: Array<{
  key: Skill["category"];
  title: string;
  description: string;
}> = [
  {
    key: "Blue-Collar",
    title: "Blue-collar",
    description: "Trades, manual and machine-based work",
  },
  {
    key: "Gray-Collar",
    title: "Gray-collar",
    description: "Technical, service and support roles",
  },
  {
    key: "White-Collar",
    title: "White-collar",
    description: "Professional, office and degree-based work",
  },
];

function JobSkills({
  selectedSkillIds,
  handleToggleSkill,
  handleNext,
  handleBack,
}: {
  selectedSkillIds: number[];
  handleToggleSkill: (id: number) => void;
  handleNext: () => void;
  handleBack: () => void;
}) {
  const [activeCategory, setActiveCategory] =
    useState<Skill["category"] | null>(null);

  const [query, setQuery] = useState("");

  const counts = useMemo(() => {
    const result: Record<string, number> = {};

    SKILLS_DATABASE.forEach((s) => {
      result[s.category] =
        (result[s.category] ?? 0) + 1;
    });

    return result;
  }, []);

  const { items, total } = useMemo(() => {
    if (!activeCategory) {
      return {
        items: [] as Skill[],
        total: 0,
      };
    }

    const q = query.trim().toLowerCase();

    const matches = SKILLS_DATABASE.filter(
      (s) =>
        s.category === activeCategory &&
        (!q ||
          s.name.toLowerCase().includes(q) ||
          s.industry.toLowerCase().includes(q)),
    );

    return {
      items: matches.slice(0, SKILL_PAGE_SIZE),
      total: matches.length,
    };
  }, [activeCategory, query]);

  const selectedSkills = useMemo(
    () =>
      SKILLS_DATABASE.filter((s) =>
        selectedSkillIds.includes(s.id),
      ),
    [selectedSkillIds],
  );

  const handleSelectCategory = (
    key: Skill["category"],
  ) => {
    setActiveCategory(key);
    setQuery("");
  };

  const activeMeta = SKILL_CATEGORIES.find(
    (c) => c.key === activeCategory,
  );

  return (
    <div className="w-full h-full py-5 px-5">
      <Header current_step={4} steps={TOTAL_STEPS} />

      <div className="w-full h-[90%] flex gap-2">
        <div className="w-[25%] h-full mt-5">
          <JobFormStepper currentStep={4} />
        </div>

        <div className="w-[75%] h-[90%] mt-5 bg-[#FAF9F6] border border-[#E3E0D8] rounded-md relative flex flex-col justify-between overflow-hidden">
          <div className="p-8 md:p-10 overflow-y-auto max-h-[calc(100%-4.5rem)]">
            <span className="archivo text-xs text-[#6B6F76]">
              Step 4 of {TOTAL_STEPS} — Skills
            </span>

            <h2 className="font-serif text-3xl text-[#1C2321] mt-2 mb-2 leading-tight">
              Required skills
            </h2>

            <p className="archivo text-sm text-[#6B6F76] mb-6">
              Pick a worker type, then choose the skills
              applicants should have. This step is optional.
            </p>

            {/* Category picker */}
            <div className="grid grid-cols-3 gap-3">
              {SKILL_CATEGORIES.map((cat) => {
                const isActive =
                  cat.key === activeCategory;

                return (
                  <button
                    key={cat.key}
                    type="button"
                    onClick={() =>
                      handleSelectCategory(cat.key)
                    }
                    className={`text-left rounded-md border p-4 transition-colors ${
                      isActive
                        ? "border-red-800 bg-white ring-1 ring-red-800"
                        : "border-[#D8D5CD] bg-white hover:border-red-800/50"
                    }`}
                  >
                    <span className="archivo block text-sm font-semibold text-[#1C2321]">
                      {cat.title}
                    </span>

                    <span className="archivo block text-xs text-[#6B6F76] mt-1">
                      {cat.description}
                    </span>

                    <span className="archivo block text-xs text-red-800 mt-3">
                      {counts[cat.key] ?? 0} skills
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Skill list */}
            {activeCategory ? (
              <div className="mt-6">
                <div className="relative">
                  <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#6B6F76]" />

                  <input
                    type="text"
                    value={query}
                    onChange={(e) =>
                      setQuery(e.target.value)
                    }
                    placeholder={`Search ${activeMeta?.title.toLowerCase()} skills`}
                    className="w-full border border-[#D8D5CD] bg-white rounded p-2.5 pl-9 text-sm text-[#1C2321] focus:outline-none focus:ring-1 focus:ring-[#991B1B] focus:border-[#991B1B]"
                  />
                </div>

                <p className="archivo text-xs text-[#6B6F76] mt-3 mb-2">
                  {total === 0
                    ? "No skills match your search."
                    : total > SKILL_PAGE_SIZE
                      ? `Showing ${SKILL_PAGE_SIZE} of ${total} — search to find more.`
                      : `${total} ${
                          total === 1
                            ? "skill"
                            : "skills"
                        }`}
                </p>

                <div className="grid grid-cols-2 gap-2">
                  {items.map((skill) => {
                    const isSelected =
                      selectedSkillIds.includes(skill.id);

                    return (
                      <button
                        key={skill.id}
                        type="button"
                        onClick={() =>
                          handleToggleSkill(skill.id)
                        }
                        className={`flex items-start gap-3 text-left rounded-md border p-3 transition-colors ${
                          isSelected
                            ? "border-red-800 bg-red-800/5"
                            : "border-[#E3E0D8] bg-white hover:border-red-800/50"
                        }`}
                      >
                        <span
                          className={`mt-0.5 w-4 h-4 rounded-sm border shrink-0 flex items-center justify-center ${
                            isSelected
                              ? "bg-red-800 border-red-800 text-white"
                              : "border-[#D8D5CD] bg-white"
                          }`}
                        >
                          {isSelected && (
                            <FaCheck size={9} />
                          )}
                        </span>

                        <span className="min-w-0">
                          <span className="archivo block text-sm text-[#1C2321] leading-snug">
                            {skill.name}
                          </span>

                          <span className="archivo block text-xs text-[#6B6F76] mt-0.5">
                            {skill.industry}
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <p className="archivo text-sm text-[#6B6F76] mt-6">
                Select a worker type above to see its skills.
              </p>
            )}

            {/* Selected skills */}
            {selectedSkills.length > 0 && (
              <div className="mt-8 border-t border-[#E3E0D8] pt-5">
                <span className="archivo block text-sm text-[#1C2321] mb-3">
                  Selected ({selectedSkills.length})
                </span>

                <div className="flex flex-wrap gap-2">
                  {selectedSkills.map((skill) => (
                    <span
                      key={skill.id}
                      className="archivo inline-flex items-center gap-2 text-xs text-red-800 bg-white border border-red-800/30 rounded-full pl-3 pr-2 py-1"
                    >
                      {skill.name}

                      <button
                        type="button"
                        onClick={() =>
                          handleToggleSkill(skill.id)
                        }
                        className="p-0.5 hover:text-red-950"
                        title="Remove skill"
                      >
                        <FaTimes className="w-2.5 h-2.5" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-[#E3E0D8] px-8 md:px-10 py-4 flex items-center justify-end gap-3 bg-[#FAF9F6]">
            <button
              className="archivo h-10 px-5 text-sm font-medium text-[#1C2321] border border-[#D8D5CD] rounded-md hover:bg-[#F1EFE9] transition-colors"
              onClick={handleBack}
            >
              Back
            </button>

            <button
              className="archivo h-10 px-5 text-sm font-medium text-white bg-red-800 rounded-md hover:bg-red-800/80 transition-colors"
              onClick={handleNext}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// REVIEW COMPONENT (STEP 5)
// ============================================================

function JobReview({
  formData,
  handleBack,
  handleSubmit,
}: {
  formData: FormDataState;
  handleBack: () => void;
  handleSubmit: () => void;
}) {
  const fields = [
    {
      label: "Compensation",
      value: `${formData.minimum_salary} - ${formData.maximum_salary}`,
    },
    {
      label: "Education required",
      value:
        formData.requirements.highest_education ||
        "N/A",
    },
    {
      label: "Experience",
      value: `${formData.requirements.experience} years`,
    },
    {
      label: "Screening questions",
      value: formData.screening_questions.length,
    },
  ];

  return (
    <div className="w-full h-full py-5 px-5">
      <Header current_step={5} steps={TOTAL_STEPS} />

      <div className="w-full h-[90%] flex gap-2">
        <div className="w-[25%] h-full mt-5">
          <JobFormStepper currentStep={5} />
        </div>

        <div className="w-[75%] h-[90%] mt-5 bg-white border border-[#E3E0D8] rounded-md relative flex flex-col justify-between overflow-hidden">
          <div className="p-8 md:p-10 overflow-y-auto max-h-[calc(100%-4.5rem)]">
            <span className="archivo text-xs tracking-normal text-[#6B6F76]">
              Step 5 of {TOTAL_STEPS} — Review
            </span>

            <h2 className="font-serif text-3xl text-[#1C2321] mt-2 leading-tight">
              {formData.job_title || "N/A"}
            </h2>

            <span className="inline-block mt-3 archivo text-xs text-red-800 bg-[#E7F2EE] border border-red-800/20 rounded px-2.5 py-1">
              {formData.employment_type || "N/A"}
            </span>

            <dl className="mt-8 border-t border-[#E3E0D8] divide-y divide-[#E3E0D8]">
              {fields.map((f) => (
                <div
                  key={f.label}
                  className="flex items-baseline justify-between gap-6 py-4"
                >
                  <dt className="archivo text-sm text-[#6B6F76] shrink-0">
                    {f.label}
                  </dt>

                  <dd className="text-sm text-[#1C2321] text-right">
                    {f.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="border-t border-[#E3E0D8] px-8 md:px-10 py-4 flex items-center justify-end gap-3 bg-[#FAF9F6]">
            <button
              className="archivo h-10 px-5 text-sm font-medium text-[#1C2321] border border-[#D8D5CD] rounded-md hover:bg-[#F1EFE9] transition-colors"
              onClick={handleBack}
            >
              Back
            </button>

            <button
              className="archivo h-10 px-5 text-sm font-medium text-white bg-red-800 rounded-md hover:bg-red-500 transition-colors"
              onClick={handleSubmit}
            >
              Submit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// HEADER COMPONENT
// ============================================================

type HeaderProps = {
  current_step: number;
  steps: number;
};

function Header({
  current_step,
  steps,
}: HeaderProps) {
  const progress = (current_step / steps) * 100;

  return (
    <div className="w-full bg-[#FAF9F6] border border-[#E3E0D8] rounded-xl px-6 py-5 select-none">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-medium text-[#1C2321] tracking-tight leading-none">
            Create a Job Listing
          </h1>

          <p className="archivo text-xs text-[#6B6F76] mt-1.5">
            Fill in the details below to publish a new position
          </p>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F1EFE9] border border-[#E3E0D8]">
          <span className="archivo text-xs text-[#6B6F76]">
            Step
          </span>

          <span className="archivo text-xs font-semibold text-red-800">
            {current_step}
          </span>

          <span className="archivo text-xs text-[#6B6F76]">
            of {steps}
          </span>
        </div>
      </div>

      <div className="mt-4 h-1.5 w-full rounded-full bg-[#F1EFE9] border border-[#E3E0D8]/60 overflow-hidden">
        <div
          className="h-full rounded-full bg-red-800 transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

// ============================================================
// FORM STEPPER
// ============================================================

const STEPS = [
  "Job Details",
  "Requirements",
  "Screening",
  "Skills",
  "Review & Post",
];

type JobFormStepperProps = {
  currentStep: number;
};

function JobFormStepper({
  currentStep,
}: JobFormStepperProps) {
  return (
    <div className="w-73 h-[70%] bg-[#FAF9F6] border border-[#E3E0D8] rounded-xl p-6 select-none flex flex-col">
      <div className="mb-6">
        <h3 className="font-serif text-lg text-[#1C2321] font-medium leading-tight">
          Progress
        </h3>

        <p className="archivo text-xs text-[#6B6F76] mt-1">
          Step {currentStep} of {STEPS.length}
        </p>
      </div>

      <div className="h-[1px] bg-[#E3E0D8] mb-6" />

      <ol className="relative flex flex-col gap-6">
        {STEPS.map((label, i) => {
          const stepNumber = i + 1;
          const isDone =
            stepNumber < currentStep;
          const isCurrent =
            stepNumber === currentStep;

          return (
            <li
              key={label}
              className="relative flex items-start gap-3.5 group"
            >
              {i < STEPS.length - 1 && (
                <span
                  className={`absolute left-3 top-6 bottom-[-20px] w-[1.5px] transition-colors duration-300 ${
                    isDone
                      ? "bg-red-800"
                      : "bg-[#E3E0D8]"
                  }`}
                  aria-hidden="true"
                />
              )}

              <div
                className={`relative z-10 w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-all duration-200 ${
                  isDone
                    ? "bg-red-800 text-[#FAF9F6]"
                    : isCurrent
                      ? "bg-[#FAF9F6] border-2 border-red-800 text-red-800"
                      : "bg-[#F1EFE9] border border-[#E3E0D8] text-[#6B6F76]"
                }`}
              >
                {isDone ? (
                  <FaCheck size={10} />
                ) : (
                  <span
                    className={`archivo text-[11px] font-semibold leading-none ${
                      isCurrent
                        ? "text-red-800"
                        : "text-red-300"
                    }`}
                  >
                    {stepNumber}
                  </span>
                )}
              </div>

              <div className="flex flex-col pt-0.5">
                <span
                  className={`archivo text-sm transition-colors duration-200 ${
                    isCurrent
                      ? "font-semibold text-[#1C2321]"
                      : isDone
                        ? "font-medium text-[#1C2321]/80"
                        : "font-normal text-[#6B6F76]"
                  }`}
                >
                  {label}
                </span>

                <span className="archivo text-[10px] tracking-wider uppercase text-[#6B6F76] mt-0.5">
                  {isDone
                    ? "Completed"
                    : isCurrent
                      ? "In Progress"
                      : "Upcoming"}
                </span>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}