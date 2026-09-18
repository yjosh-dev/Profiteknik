export interface JobRequirements {
  job_id: number;
  highest_education: string;
  experience: number;
}

export interface ScreeningQuestion {
  question_id: number;
  job_id: number;
  screening_question: string;
}

export interface JobListingDetailData {
  job_id: number;
  job_title: string;
  job_description: string;
  minimum_salary: number;
  maximum_salary: number;
  vacant_position: number;
  employment_type: string;
  posted_at: string;
  posted_until: string;
  listed_by: number;
  updated_at: string;
  requirements: JobRequirements;
  screening_questions: ScreeningQuestion[];
}