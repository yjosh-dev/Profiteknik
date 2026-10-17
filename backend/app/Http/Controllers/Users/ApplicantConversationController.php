<?php

namespace App\Http\Controllers\Users;

use App\Http\Controllers\Controller;
use App\Models\ApplicantJobApplication;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ApplicantConversationController extends Controller
{
    public function show(
        Request $request,
        int $jobId
    ): JsonResponse {
        $applicantId = $request->user()->applicant_id;

        $application = ApplicantJobApplication::with([
            'applicant.information',
            'jobListing',
        ])
            ->where('job_id', $jobId)
            ->where('applicant_id', $applicantId)
            ->firstOrFail();

        return response()->json([
            'data' => [
                'application_id' => $application->application_id,
                'applicant_id' => $application->applicant_id,
                'job_id' => $application->job_id,
                'job_title' => $application->jobListing?->job_title,
            ],
        ], 200);
    }
}