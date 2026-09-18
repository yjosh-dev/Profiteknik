import axiosClient from "../axiosClient";

export interface JobRequirementsData {
  highest_education: string;
  experience: number;
}

export interface ScreeningQuestionData {
  screening_question: string;
}

export interface FormDataState {
  job_title: string;
  job_description: string;
  minimum_salary: string | number;
  maximum_salary: string | number;
  vacant_position: number;
  employment_type: string;
  posted_at: string;
  posted_until: string;
  listed_by: string | number;
  requirements: JobRequirementsData;
  screening_questions: ScreeningQuestionData[];
}

export const jobListingApi = {
  storeJobListing: async (formData: FormDataState, token: string) => {
    return await axiosClient.post("/employee/job_listings", formData, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
  },

  getJobListing: async (job_id: number | string) => {
    return await axiosClient.get(`/employee/job_listings/${job_id}`, {
      headers: {
        "Content-Type": "application/json",
      },
    });
  },
};
