import { useEffect, useState, type ChangeEvent } from "react";

import ContentContainer from "../../components/ui/ContentContainer";
import StatusModal from "../../components/ui/StatusModal";

import { jobListingApi } from "../../service/api/employee/jobListingService";

import {
  FaCheck,
  FaClipboardList,
  FaTrash,
  FaPlus,
  FaCheckCircle,
} from "react-icons/fa";

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
    listed_by: 9,
    requirements: {
      highest_education: "",
      experience: 0,
    },
    screening_questions: [{ screening_question: "" }],
  });

  const [steps, setSteps] = useState(1);

  // Input handlers
  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRequirementChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      requirements: { ...prev.requirements, [name]: value },
    }));
  };

  // Dynamic Screening Questions Handlers
  const handleQuestionChange = (index: number, value: string) => {
    const updatedQuestions = [...formData.screening_questions];
    updatedQuestions[index].screening_question = value;
    setFormData((prev) => ({ ...prev, screening_questions: updatedQuestions }));
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
    if (formData.screening_questions.length === 1) return; // Keep at least one question
    setFormData((prev) => ({
      ...prev,
      screening_questions: prev.screening_questions.filter(
        (_, i) => i !== index,
      ),
    }));
  };

  const token = localStorage.getItem('token');
  
  const handleSubmit = async () => {
    setLoading(true);
   
    if(!token){
        return;
    }

    try {
      const response = await jobListingApi.storeJobListing(formData, token);
      if (response.status === 201) {
        setSuccess(true);
      }
    } catch (error: any) {
      if (error.response && error.response.status === 422) {
        // Log the exact field validation errors from Laravel
        console.log("Validation Errors:", error.response.data.errors);
      } else {
        console.error("Failed to post job listing:", error);
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
            handleBack={() => setSteps((prev) => Math.max(1, prev - 1))}
            handleNext={() => setSteps((prev) => prev + 1)}
          />
        );
      case 2:
        return (
          <JobRequirements
            formData={formData}
            handleChange={handleRequirementChange}
            handleBack={() => setSteps((prev) => prev - 1)}
            handleNext={() => setSteps((prev) => prev + 1)}
          />
        );
      case 3:
        return (
          <JobScreeningQuestions
            formData={formData}
            handleQuestionChange={handleQuestionChange}
            handleAddQuestion={handleAddQuestion}
            handleRemoveQuestion={handleRemoveQuestion}
            handleBack={() => setSteps((prev) => prev - 1)}
            handleNext={() => setSteps((prev) => prev + 1)}
          />
        );
      case 4:
        return (
          <JobReview
            formData={formData}
            handleBack={() => setSteps((prev) => prev - 1)}
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
            icon={<FaCheckCircle className="text-emerald-500 text-6xl" />}
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
            <p className="text-sm font-medium text-gray-700">Loading...</p>
          </div>
        </div>
      )}
    </ContentContainer>
  );
}

// JOB DETAILS COMPONENT (STEP 1)
function JobDetails({
  formData,
  handleChange,
  handleNext,
  handleBack,
}: {
  formData: FormDataState;
  handleChange: (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => void;
  handleNext: () => void;
  handleBack: () => void;
}) {
  const currentDate = new Date().toISOString();
  useEffect(() => {
    console.log(currentDate);
  }, []);
  return (
    <div className="w-full h-full py-5 px-5">
      <Header current_step={1} steps={4} />
      <div className="w-full h-[90%] flex gap-2">
        <div className="w-[25%] h-full mt-5">
          <JobFormStepper currentStep={1} />
        </div>
        <div className="w-[75%] h-[90%] mt-5 border border-gray-300 shadow rounded-md relative flex flex-col justify-between">
          <div className="p-6 overflow-y-auto max-h-[calc(100%-4rem)]">
            <h2 className="text-xl font-bold mb-4 text-gray-800">
              Job Details
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-1">
                  Job Title
                </label>
                <input
                  type="text"
                  name="job_title"
                  value={formData.job_title}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded p-2 text-sm focus:outline-none focus:ring-1 focus:ring-red-500"
                  placeholder="e.g. Welder"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Employment Type
                </label>
                <select
                  name="employment_type"
                  value={formData.employment_type}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded p-2 text-sm focus:outline-none focus:ring-1 focus:ring-red-500"
                >
                  <option value="">Select Type</option>
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Contract">Contract</option>
                  <option value="Internship">Internship</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Vacant Positions
                </label>
                <input
                  type="number"
                  name="vacant_position"
                  value={formData.vacant_position}
                  onChange={handleChange}
                  min="1"
                  className="w-full border border-gray-300 rounded p-2 text-sm focus:outline-none focus:ring-1 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Minimum Salary
                </label>
                <input
                  type="number"
                  name="minimum_salary"
                  value={formData.minimum_salary}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded p-2 text-sm focus:outline-none focus:ring-1 focus:ring-red-500"
                  placeholder="e.g. ₱30000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Maximum Salary
                </label>
                <input
                  type="number"
                  name="maximum_salary"
                  value={formData.maximum_salary}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded p-2 text-sm focus:outline-none focus:ring-1 focus:ring-red-500"
                  placeholder="e.g. ₱50000"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium mb-1">
                  Posted Until
                </label>
                <input
                  type="date"
                  min={currentDate.toString()}
                  name="posted_until"
                  value={formData.posted_until}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded p-2 text-sm focus:outline-none focus:ring-1 focus:ring-red-500"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium mb-1">
                  Job Description
                </label>
                <textarea
                  name="job_description"
                  value={formData.job_description}
                  onChange={handleChange}
                  rows={4}
                  className="w-full border border-gray-300 rounded p-2 text-sm focus:outline-none focus:ring-1 focus:ring-red-500"
                  placeholder="Provide role requirements and responsibilities..."
                />
              </div>
            </div>
          </div>

          <div className="w-[95%] h-12 absolute bottom-3 mx-5 flex items-center justify-end gap-5">
            <button
              className="w-25 h-9 bg-gray-700/80 rounded-md hover:bg-gray-600 transition-colors"
              onClick={handleBack}
            >
              <p className="font-medium text-white archivo">Back</p>
            </button>
            <button
              className="w-25 h-9 bg-green-700/80 rounded-md hover:bg-green-600 transition-colors"
              onClick={handleNext}
            >
              <p className="font-medium text-white archivo">Next</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// JOB REQUIREMENTS COMPONENT (STEP 2)
function JobRequirements({
  formData,
  handleChange,
  handleNext,
  handleBack,
}: {
  formData: FormDataState;
  handleChange: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  handleNext: () => void;
  handleBack: () => void;
}) {
  return (
    <div className="w-full h-full py-5 px-5">
      <Header current_step={2} steps={4} />
      <div className="w-full h-[90%] flex gap-2">
        <div className="w-[25%] h-full mt-5">
          <JobFormStepper currentStep={2} />
        </div>
        <div className="w-[75%] h-[90%] mt-5 border border-gray-300 shadow rounded-md relative flex flex-col justify-between">
          <div className="p-6">
            <h2 className="text-xl font-bold mb-4 text-gray-800">
              Job Requirements
            </h2>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Highest Education Attained
                </label>
                <select
                  name="highest_education"
                  value={formData.requirements.highest_education}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded p-2 text-sm focus:outline-none focus:ring-1 focus:ring-red-500"
                >
                  <option value="">Select Education Level</option>
                  <option value="High School">High School</option>
                  <option value="Vocational">Vocational</option>
                  <option value="Associate">Associate</option>
                  <option value="Bachelor">Bachelor</option>
                  <option value="Master">Master</option>
                  <option value="Doctorate">Doctorate</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Years of Experience Required
                </label>
                <input
                  type="number"
                  name="experience"
                  value={formData.requirements.experience}
                  onChange={handleChange}
                  min="0"
                  className="w-full border border-gray-300 rounded p-2 text-sm focus:outline-none focus:ring-1 focus:ring-red-500"
                  placeholder="e.g. 2"
                />
              </div>
            </div>
          </div>

          <div className="w-[95%] h-12 absolute bottom-3 mx-5 flex items-center justify-end gap-5">
            <button
              className="w-25 h-9 bg-gray-700/80 rounded-md hover:bg-gray-600 transition-colors"
              onClick={handleBack}
            >
              <p className="font-medium text-white archivo">Back</p>
            </button>
            <button
              className="w-25 h-9 bg-green-700/80 rounded-md hover:bg-green-600 transition-colors"
              onClick={handleNext}
            >
              <p className="font-medium text-white archivo">Next</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// SCREENING QUESTIONS COMPONENT (STEP 3)
function JobScreeningQuestions({
  formData,
  handleQuestionChange,
  handleAddQuestion,
  handleRemoveQuestion,
  handleNext,
  handleBack,
}: {
  formData: FormDataState;
  handleQuestionChange: (index: number, value: string) => void;
  handleAddQuestion: () => void;
  handleRemoveQuestion: (index: number) => void;
  handleNext: () => void;
  handleBack: () => void;
}) {
  return (
    <div className="w-full h-full py-5 px-5">
      <Header current_step={3} steps={4} />
      <div className="w-full h-[90%] flex gap-2">
        <div className="w-[25%] h-full mt-5">
          <JobFormStepper currentStep={3} />
        </div>
        <div className="w-[75%] h-[90%] mt-5 border border-gray-300 shadow rounded-md relative flex flex-col justify-between">
          <div className="p-6 overflow-y-auto max-h-[calc(100%-4rem)]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800">
                Screening Questions
              </h2>
              <button
                type="button"
                onClick={handleAddQuestion}
                className="flex items-center gap-2 px-3 py-1.5 bg-red-600 text-white rounded-md text-sm hover:bg-red-700 transition-colors"
              >
                <FaPlus className="w-3 h-3" />
                Add Question
              </button>
            </div>

            <div className="space-y-4">
              {formData.screening_questions.map((q, index) => (
                <div key={index} className="flex gap-2 items-center">
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Question {index + 1}
                    </label>
                    <input
                      type="text"
                      value={q.screening_question}
                      onChange={(e) =>
                        handleQuestionChange(index, e.target.value)
                      }
                      placeholder="e.g. How many years of experience do you have with Welding?"
                      className="w-full border border-gray-300 rounded p-2 text-sm focus:outline-none focus:ring-1 focus:ring-red-500"
                    />
                  </div>
                  {formData.screening_questions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveQuestion(index)}
                      className="mt-5 p-2 text-red-500 hover:text-red-700 transition-colors"
                      title="Remove question"
                    >
                      <FaTrash className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="w-[95%] h-12 absolute bottom-3 mx-5 flex items-center justify-end gap-5">
            <button
              className="w-25 h-9 bg-gray-700/80 rounded-md hover:bg-gray-600 transition-colors"
              onClick={handleBack}
            >
              <p className="font-medium text-white archivo">Back</p>
            </button>
            <button
              className="w-25 h-9 bg-green-700/80 rounded-md hover:bg-green-600 transition-colors"
              onClick={handleNext}
            >
              <p className="font-medium text-white archivo">Next</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// REVIEW COMPONENT (STEP 4)
function JobReview({
  formData,
  handleBack,
  handleSubmit,
}: {
  formData: FormDataState;
  handleBack: () => void;
  handleSubmit: () => void;
}) {
  return (
    <div className="w-full h-full py-5 px-5">
      <Header current_step={4} steps={4} />
      <div className="w-full h-[90%] flex gap-2">
        <div className="w-[25%] h-full mt-5">
          <JobFormStepper currentStep={4} />
        </div>
        <div className="w-[75%] h-[90%] mt-5 border border-gray-300 shadow rounded-md relative flex flex-col justify-between">
          <div className="p-6 overflow-y-auto max-h-[calc(100%-4rem)] space-y-4">
            <h2 className="text-xl font-bold text-gray-800">
              Review Listing Details
            </h2>
            <div className="bg-gray-50 p-4 rounded-md border space-y-2 text-sm">
              <p>
                <strong>Title:</strong> {formData.job_title || "N/A"}
              </p>
              <p>
                <strong>Type:</strong> {formData.employment_type || "N/A"}
              </p>
              <p>
                <strong>Salary Range:</strong> {formData.minimum_salary} -{" "}
                {formData.maximum_salary}
              </p>
              <p>
                <strong>Education Required:</strong>{" "}
                {formData.requirements.highest_education || "N/A"}
              </p>
              <p>
                <strong>Experience:</strong> {formData.requirements.experience}{" "}
                years
              </p>
              <p>
                <strong>Screening Questions:</strong>{" "}
                {formData.screening_questions.length}
              </p>
            </div>
          </div>

          <div className="w-[95%] h-12 absolute bottom-3 mx-5 flex items-center justify-end gap-5">
            <button
              className="w-25 h-9 bg-gray-700/80 rounded-md hover:bg-gray-600 transition-colors"
              onClick={handleBack}
            >
              <p className="font-medium text-white archivo">Back</p>
            </button>
            <button
              className="w-25 h-9 bg-teal-700 rounded-md hover:bg-teal-600 transition-colors"
              onClick={handleSubmit}
            >
              <p className="font-medium text-white archivo">Submit</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// HEADER COMPONENT
function Header({
  current_step,
  steps,
}: {
  current_step: number;
  steps: number;
}) {
  const progress = (current_step / steps) * 100;

  return (
    <div className="w-full bg-white border border-gray-200 rounded-md px-6 py-4 shadow-sm">
      <div className="flex items-center justify-between">
        <h1 className="public-sans text-xl font-semibold text-gray-900">
          Create a job listing
        </h1>
        <p className="archivo text-sm text-gray-500">
          Step{" "}
          <span className="font-semibold text-teal-600">{current_step}</span> of{" "}
          {steps}
        </p>
      </div>

      <div className="mt-3 h-1 w-full rounded-full bg-gray-100 overflow-hidden">
        <div
          className="h-full rounded-full bg-red-500 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

// STEPPER COMPONENT
const STEPS = [
  "Job Details",
  "Job Requirements",
  "Screening Questions",
  "Review & Submit",
];

function JobFormStepper({ currentStep }: { currentStep: number }) {
  return (
    <div className="border h-[90%] bg-white border-gray-300 shadow flex justify-center rounded-md">
      <ol className="w-64 mt-8">
        {STEPS.map((label, i) => {
          const stepNumber = i + 1;
          const done = stepNumber < currentStep;
          const current = stepNumber === currentStep;

          return (
            <li key={label} className="relative pb-2.5">
              <div className="flex items-center gap-3 py-1">
                <div
                  className={
                    "flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center " +
                    (done
                      ? "bg-red-500"
                      : current
                        ? "border-2 border-red-500 bg-white"
                        : "border-2 border-gray-200 bg-white")
                  }
                >
                  {done &&
                    (i === 0 ? (
                      <FaClipboardList className="w-2.5 h-2.5 text-white" />
                    ) : (
                      <FaCheck className="w-2.5 h-2.5 text-white" />
                    ))}
                </div>
                <span
                  className={
                    "text-sm " +
                    (done
                      ? "font-medium text-gray-800"
                      : current
                        ? "font-semibold text-gray-900"
                        : "text-gray-400")
                  }
                >
                  {label}
                </span>
              </div>

              {i < STEPS.length - 1 && (
                <div
                  className={
                    "absolute left-[9px] top-7 w-px h-2.5 " +
                    (done ? "bg-red-200" : "bg-gray-100")
                  }
                />
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
