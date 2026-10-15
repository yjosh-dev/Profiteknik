<?php

namespace App\Http\Controllers\Users;

use App\Http\Controllers\Controller;
use App\Services\Users\ApplicantMyJobService;
use Illuminate\Http\Request;

class ApplicantMyJobsController extends Controller
{
    public function __construct(
        private ApplicantMyJobService $applicantMyJobService
    ) {}

    public function fetchPendingApplications(Request $request)
    {
        $applicant = $request->user();

        $applications = $this->applicantMyJobService
            ->fetchPendingApplications($applicant);

        return response()->json([
            'applicant_id' => $applicant->applicant_id,
            'applications' => $applications,
        ]);
    }

    public function fetchShortlistedApplications(Request $request)
    {
        $applicant = $request->user();

        $applications = $this->applicantMyJobService
            ->fetchShortlistedApplications($applicant);

        return response()->json([
            'applicant_id' => $applicant->applicant_id,
            'applications' => $applications,
        ]);
    }

    public function fetchInterviewApplications(Request $request)
    {
        $applicant = $request->user();

        $applications = $this->applicantMyJobService
            ->fetchInterviewApplications($applicant);

        return response()->json([
            'applicant_id' => $applicant->applicant_id,
            'applications' => $applications,
        ]);
    }
}