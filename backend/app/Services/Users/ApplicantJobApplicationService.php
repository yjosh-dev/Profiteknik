<?php

namespace App\Services\Users;

use App\Models\ApplicantJobApplication;
use App\Models\JobListing;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ApplicantJobApplicationService
{
    public function storeJobApplication(Request $request, int $job_id): ApplicantJobApplication
    {
        $applicantId = $this->extractUser($request);

        // 404 if the job doesn't exist
        $job = JobListing::findOrFail($job_id);

        // 409 if the applicant already applied to this job
        $alreadyApplied = ApplicantJobApplication::where('applicant_id', $applicantId)
            ->where('job_id', $job->job_id)
            ->exists();

        abort_if($alreadyApplied, 409, 'You have already applied to this job.');

        return DB::transaction(function () use ($request, $applicantId, $job) {
            $application = ApplicantJobApplication::create([
                'applicant_id' => $applicantId,
                'job_id'       => $job->job_id,
                'status'       => 'pending',
                'date_applied' => now()->toDateString(),
            ]);

            foreach ($request->input('screening_answers', []) as $answer) {
                $application->screeningAnswers()->create([
                    'screening_question' => $answer,
                ]);
            }

            return $application->load('screeningAnswers');
        });
    }

    protected function extractUser(Request $request): int
    {
        $applicantId = $request->user()?->applicant_id;

        abort_if($applicantId === null, 403, 'Applicant profile required.');

        return $applicantId;
    }
}