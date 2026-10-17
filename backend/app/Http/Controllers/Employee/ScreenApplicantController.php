<?php

namespace App\Http\Controllers\Employee;

use App\Http\Controllers\Controller;
use App\Services\Employee\ScreenApplicantService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ScreenApplicantController extends Controller
{
    protected ScreenApplicantService $service;

    public function __construct(ScreenApplicantService $service)
    {
        $this->service = $service;
    }

    public function show(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'job_id' => 'required|integer',
            'applicant_id' => 'required|integer',
        ]);

        $details = $this->service->getApplicantDetails(
            (int) $validated['job_id'],
            (int) $validated['applicant_id']
        );

        if (! $details) {
            return response()->json([
                'message' => 'Applicant evaluation record not found for this job listing.',
            ], 404);
        }

        // Mix screening questions and answers together
        $screeningQA = $this->service->getFormattedScreeningQA($details);

        // Resume file embedded as base64 (private disk)
        $resumeData = $this->service->getResumePayload(
            $details->applicant->resume
        );

        return response()->json([
            'data' => [
                'application_id' => $details->application_id,
                'job_id' => $details->job_id,
                'status' => $details->status ?? 'Pending',
                'date_applied' => $details->date_applied,

                'job' => [
                    'job_id' => $details->jobListing->job_id,
                    'job_title' => $details->jobListing->job_title,

                    'requirements' => $details->jobListing->requirements,

                    'skill_requirements' => $details->jobListing->skillRequirement,
                ],

                'applicant' => [
                    'applicant_id' => $details->applicant->applicant_id,
                    'first_name' => $details->applicant->information->first_name ?? null,
                    'middle_name' => $details->applicant->information->middle_name ?? null,
                    'last_name' => $details->applicant->information->last_name ?? null,
                    'profile_image_url' => $details->applicant->information->applicant_profile_picture ?? null,
                    'email' => $details->applicant->contact->email ?? null,
                    'phone_no' => $details->applicant->contact->phone_no ?? null,
                    'tel_no' => $details->applicant->contact->tel_no ?? null,
                    'experiences' => $details->applicant->experiences,
                    'skills' => $details->applicant->skills,
                    'resume' => $resumeData,
                ],

                'screening_qa' => $screeningQA,
            ],
        ], 200);
    }

    public function updateStatus(Request $request, int $applicationId)
    {
        $validated = $request->validate([
            'status' => ['required', 'string'],
        ]);

        $application = $this->service->updateApplicationStatus(
            $applicationId,
            $validated['status']
        );

        return response()->json([
            'message' => 'Status updated successfully',
            'data' => $application,
        ]);
    }
}
