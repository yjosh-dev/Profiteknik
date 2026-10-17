<?php

namespace App\Services\Users;

use App\Models\ApplicantJobApplication;
use App\Models\ApplicantNotification;
use App\Models\JobListing;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ApplicantJobApplicationService
{
    public function storeJobApplication(Request $request, int $job_id): ApplicantJobApplication
    {
        $applicantId = $this->extractUser($request);

        $job = JobListing::findOrFail($job_id);

        $alreadyApplied = ApplicantJobApplication::where('applicant_id', $applicantId)
            ->where('job_id', $job->job_id)
            ->exists();

        abort_if($alreadyApplied, 409, 'You have already applied to this job.');

        return DB::transaction(function () use ($request, $applicantId, $job) {
            $application = ApplicantJobApplication::create([
                'applicant_id' => $applicantId,
                'job_id' => $job->job_id,
                'status' => 'pending',
                'date_applied' => now()->toDateString(),
            ]);

            foreach ($request->input('screening_answers', []) as $answer) {
                $application->screeningAnswers()->create([
                    'screening_question' => $answer,
                ]);
            }

            ApplicantNotification::create([
                'applicant_id' => $applicantId,
                'job_id' => $job->job_id,
                'application_id' => $application->application_id,
                'notification_title' => 'Application Submitted',
                'notification_body' => "Your application for {$job->job_title} has been successfully submitted.",
                'date_created' => now(),
                'active' => true,
            ]);

            return $application->load('screeningAnswers');
        });
    }

    public function cancelJobApplication(
        Request $request,
        int $applicationId
    ): ApplicantJobApplication {
        $applicantId = $this->extractUser($request);

        $application = ApplicantJobApplication::with('job')
            ->where('application_id', $applicationId)
            ->where('applicant_id', $applicantId)
            ->firstOrFail();

        // Only allow cancellation if the application is still active.
        abort_if(
            $application->status === 'cancelled',
            409,
            'This application has already been cancelled.'
        );

        abort_if(
            $application->status === 'rejected',
            409,
            'A rejected application cannot be cancelled.'
        );

        abort_if(
            $application->status === 'completed',
            409,
            'A completed application cannot be cancelled.'
        );

        return DB::transaction(function () use ($application, $applicantId) {
            $application->update([
                'status' => 'cancelled',
            ]);

            ApplicantNotification::create([
                'applicant_id' => $applicantId,
                'job_id' => $application->job_id,
                'application_id' => $application->application_id,
                'notification_title' => 'Application Cancelled',
                'notification_body' => "Your application for {$application->job->job_title} has been cancelled.",
                'date_created' => now(),
                'active' => true,
            ]);

            return $application->fresh()->load('job');
        });
    }

    protected function extractUser(Request $request): int
    {
        $applicantId = $request->user()?->applicant_id;

        abort_if($applicantId === null, 403, 'Applicant profile required.');

        return $applicantId;
    }
}
