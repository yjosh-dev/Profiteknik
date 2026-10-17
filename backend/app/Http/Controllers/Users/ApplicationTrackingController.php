<?php

namespace App\Http\Controllers\Users;

use App\Http\Controllers\Controller;
use App\Services\Users\ApplicationTrackingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ApplicationTrackingController extends Controller
{
    protected ApplicationTrackingService $applicationTracking;

    public function __construct(ApplicationTrackingService $applicationTracking)
    {
        $this->applicationTracking = $applicationTracking;
    }

    public function show(Request $request, int $applicationId): JsonResponse
    {
        $applicant = $request->user();

        $application = $this->applicationTracking->fetchApplicationTracking(
            $applicant,
            $applicationId
        );

        if (! $application) {
            return response()->json([
                'message' => 'Application not found.',
            ], 404);
        }

        $interview = $application->interview
            ->sortByDesc('starts_at')
            ->first();

        return response()->json([
            'application_id' => $application->application_id,
            'applied_at' => $application->date_applied,
            'current_status' => $application->status,

            'job' => [
                'id' => $application->jobListing?->job_id,
                'title' => $application->jobListing?->job_title,
                'company' => 'Profiteknik Corporation',
                'location' => 'Pasig City / Taguig City',
                'employment_type' => $application->jobListing?->employment_type,
                'minimum_salary' => $application->jobListing?->minimum_salary,
                'maximum_salary' => $application->jobListing?->maximum_salary,
            ],

            'interview' => $interview ? [
                'id' => $interview->id,
                'title' => $interview->title,
                'applicant_email' => $interview->applicant_email,
                'starts_at' => $interview->starts_at,
                'ends_at' => $interview->ends_at,
                'meet_link' => $interview->meet_link,
            ] : null,
        ]);
    }
}
