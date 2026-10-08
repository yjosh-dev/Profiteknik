<?php

namespace App\Http\Controllers\Employee;

use App\Http\Controllers\Controller;
use App\Models\ApplicantJobApplication;
use App\Models\JobListing;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class JobApplicationsController extends Controller
{
    /**
     * List all applications for a job listing.
     */
    public function index(Request $request, JobListing $job): JsonResponse
    {
        $applications = $job->applications()
            ->with([
                'information:applicant_id,first_name,last_name',
                'contact:applicant_id,email',
            ])
            ->when($request->filled('status'), fn ($q) => $q->where('status', $request->query('status')))
            ->orderByDesc('date_applied')
            ->get()
            ->map(fn ($application) => [
                'application_id' => $application->application_id,
                'job_title'      => $job->job_title,
                'job_id'         => $job->job_id,
                'first_name'     => $application->information?->first_name,
                'last_name'      => $application->information?->last_name,
                'email'          => $application->contact?->email,
                'status'         => $application->status,
                'date_applied'   => $application->date_applied?->toDateString(),
            ]);

        return response()->json($applications);
    }

    /**
     * Update the status of a single application.
     */
    public function updateStatus(Request $request, ApplicantJobApplication $application): JsonResponse
    {
        $validated = $request->validate([
            'status' => ['required', 'string', 'max:50'],
        ]);

        $application->update($validated);

        return response()->json($application->fresh());
    }
}