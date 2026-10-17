export interface JobListingAnalytics {
  total_applicants: number;
  shortlisted: number;
  under_review: number;
  rejected: number;
  interview: number;
  completed: number;
  conversion_rate: number;

  applicants_per_day: {
    date: string;
    day: string;
    count: number;
  }[];
}

export interface JobListingRequirement {
  job_id: number;
  highest_education: string;
  experience: number;
}

export interface JobScreeningQuestion {
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

  requirements?: JobListingRequirement;

  screeningQuestions: JobScreeningQuestion[];

  analytics: JobListingAnalytics;
}

export interface JobListingAnalytics {
  total_applicants: number;
  shortlisted: number;
  under_review: number;
  rejected: number;
  interview: number;
  completed: number;
  conversion_rate: number;

  applicants_per_day: {
    date: string;
    day: string;
    count: number;
  }[];
}