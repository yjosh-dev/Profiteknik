<?php

namespace App\Services\Employee;

use App\Models\JobListing;
use App\Models\JobRequirements;
use App\Models\JobScreeningQuestions;
use Exception;
use Illuminate\Support\Facades\DB;

class JobListingService
{
    /**
     * Store a new Job Listing along with its requirements and screening questions.
     *
     * @param  array  $data  Validated request data matching the React form state structure
     *
     * @throws Exception
     */
    public function storeJobListing(array $data): JobListing
    {
        return DB::transaction(function () use ($data) {
            // 1. Create the main Job Listing record
            $jobListing = JobListing::create([
                'job_title' => $data['job_title'],
                'job_description' => $data['job_description'],
                'minimum_salary' => $data['minimum_salary'] ?? null,
                'maximum_salary' => $data['maximum_salary'] ?? null,
                'vacant_position' => $data['vacant_position'] ?? 1,
                'employment_type' => $data['employment_type'],
                'posted_at' => $data['posted_at'] ?? now(),
                'posted_until' => $data['posted_until'] ?? null,
                'listed_by' => $data['listed_by'], // Employee ID
            ]);

            // 2. Create Job Requirements (Uses job_id as non-incrementing PK)
            if (! empty($data['requirements'])) {
                JobRequirements::create([
                    'job_id' => $jobListing->job_id,
                    'highest_education' => $data['requirements']['highest_education'] ?? null,
                    'experience' => $data['requirements']['experience'] ?? 0,
                ]);
            }

            // 3. Create Job Screening Questions
            if (! empty($data['screening_questions'])) {
                foreach ($data['screening_questions'] as $questionData) {
                    if (! empty($questionData['screening_question'])) {
                        JobScreeningQuestions::create([
                            'job_id' => $jobListing->job_id,
                            'screening_question' => $questionData['screening_question'],
                        ]);
                    }
                }
            }

            return $jobListing;
        });
    }
}
