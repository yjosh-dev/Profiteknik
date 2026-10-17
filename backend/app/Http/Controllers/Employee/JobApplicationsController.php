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
            ->when(
                $request->filled('status'),
                fn ($q) => $q->where('status', $request->query('status'))
            )
            ->orderByDesc('date_applied')
            ->get()
            ->map(fn ($application) => [
                'applicant_id' => $application->applicant_id,
                'application_id' => $application->application_id,
                'job_title' => $job->job_title,
                'job_id' => $job->job_id,
                'first_name' => $application->information?->first_name,
                'last_name' => $application->information?->last_name,
                'email' => $application->contact?->email,
                'status' => $application->status,
                'date_applied' => $application->date_applied?->toDateString(),
            ]);

        return response()->json($applications);
    }

    public function analytics(JobListing $job): JsonResponse
    {
        $applications = $job->applications();

        $totalApplicants = (clone $applications)->count();

        $shortlisted = (clone $applications)
            ->where('status', 'shortlisted')
            ->count();

        $underReview = (clone $applications)
            ->where('status', 'pending')
            ->count();

        $rejected = (clone $applications)
            ->where('status', 'rejected')
            ->count();

        $interview = (clone $applications)
            ->where('status', 'interview')
            ->count();

        $completed = (clone $applications)
            ->where('status', 'completed')
            ->count();

        $conversionRate = $totalApplicants > 0
            ? round(($shortlisted / $totalApplicants) * 100, 2)
            : 0;

        $applicantsPerDay = (clone $applications)
            ->select(
                'date_applied',
                DB::raw('COUNT(*) as count')
            )
            ->whereNotNull('date_applied')
            ->groupBy('date_applied')
            ->orderBy('date_applied')
            ->get()
            ->map(fn ($application) => [
                'date' => $application->date_applied->toDateString(),
                'day' => $application->date_applied->format('D'),
                'count' => (int) $application->count,
            ])
            ->values();

        return response()->json([
            'job_id' => $job->job_id,
            'total_applicants' => $totalApplicants,
            'shortlisted' => $shortlisted,
            'under_review' => $underReview,
            'rejected' => $rejected,
            'interview' => $interview,
            'completed' => $completed,
            'conversion_rate' => $conversionRate,
            'applicants_per_day' => $applicantsPerDay,
        ]);
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
