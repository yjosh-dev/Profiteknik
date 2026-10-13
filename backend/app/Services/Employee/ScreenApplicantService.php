<?php

namespace App\Services\Employee;

use App\Models\ApplicantJobApplication;
use App\Models\ApplicantResume;
use Illuminate\Support\Facades\Storage;

class ScreenApplicantService
{
    /**
     * Get detailed applicant evaluation data with combined screening questions & answers.
     */
    public function getApplicantDetails(int $jobId, int $applicantId): ?ApplicantJobApplication
    {
        return ApplicantJobApplication::with([
            'applicant.information',
            'applicant.contact',
            'applicant.experiences',
            'applicant.skills',
            'applicant.resume',
            'jobListing.screeningQuestions',
            'screeningAnswers',
        ])
            ->where('job_id', $jobId)
            ->where('applicant_id', $applicantId)
            ->first();
    }

    /**
     * Transform job screening questions and mix them with applicant answers.
     */
    public function getFormattedScreeningQA(ApplicantJobApplication $application): array
    {
        $questions = $application->jobListing->screeningQuestions ?? collect();
        $answers = $application->screeningAnswers ?? collect();

        return $questions->values()->map(function ($question, $index) use ($answers) {
            $answer = $answers->get($index);

            return [
                'question_id' => $question->question_id,
                'question_text' => $question->screening_question ?? null,
                'answer_text' => $answer ? $answer->screening_question : null,
            ];
        })->toArray();
    }

    /**
     * Update application status.
     */
    public function updateApplicationStatus(int $applicationId, string $status): ApplicantJobApplication
    {
        $application = ApplicantJobApplication::findOrFail($applicationId);
        $application->update([
            'status' => $status,
        ]);

        return $application;
    }

    public function getResumePayload(?ApplicantResume $resume): ?array
    {
        if (! $resume || ! $resume->resume) {
            return null;
        }

        $disk = Storage::disk('local');

        if (! $disk->exists($resume->resume)) {
            return null;
        }

        return [
            'record_id' => $resume->record_id,
            'name' => basename($resume->resume),
            'mime_type' => $disk->mimeType($resume->resume),
            'date_uploaded' => $resume->date_uploaded,
            'data' => base64_encode($disk->get($resume->resume)),
        ];
    }
}
