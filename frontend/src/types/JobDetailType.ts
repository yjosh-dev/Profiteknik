export type JobRequirements = {
  job_id: number;
  highest_education: string;
  experience: number; // years
};

export type JobScreeningQuestion = {
  question_id: number;
  job_id: number;
  screening_question: string;
};

export type JobDetail = {
  job_id: number;
  job_title: string;
  job_description: string;
  minimum_salary: number;
  maximum_salary: number;
  vacant_position: number;
  employment_type: string;
  posted_at: string; // ISO datetime (UTC)
  posted_until: string; // ISO datetime (UTC), time is always 00:00
  listed_by: number; // employee_id of the poster
  updated_at: string;
  requirements: JobRequirements | null; // hasOne, so it can be null
  screening_questions: JobScreeningQuestion[];
};