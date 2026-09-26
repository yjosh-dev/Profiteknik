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

export type JobCard = {
   job_id: number;
   job_title: string;
   job_description: string;
   experience: string;
   min_salary: string;
   max_salary: string;
   date_listed: string;
   employement_type: string;
}

type Job = {
  job_id: string;
  job_title: string;
  job_description: string;
  minimum_salary: number;
  maximum_salary: number;
  vacant_position: number;
  employment_type: string; // e.g. "Full-time", "Part-time", "Contract"
  posted_at: string;       // ISO date string
  posted_until: string;    // ISO date string
  listed_by: number;       // likely a foreign key to a users/accounts table
  updated_at: string;      // ISO date string
};

export type PaginatedJobs = {
  current_page: number;
  data: Job[];
  first_page_url: string;
  from: number;
  last_page: number;
  last_page_url: string;
  links: { url: string | null; label: string; active: boolean }[];
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number;
  total: number;
};
