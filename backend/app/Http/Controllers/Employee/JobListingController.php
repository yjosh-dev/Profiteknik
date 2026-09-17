<?php

namespace App\Http\Controllers\Employee;

use App\Http\Controllers\Controller;
use App\Services\Employee\JobListingService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class JobListingController extends Controller
{

    protected JobListingService $jobListingService;

    public function __construct(JobListingService $jobListingService)
    {
        $this->jobListingService = $jobListingService;
    }

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return "hi";
    }

   /**
     * Store a newly created job listing in storage.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'job_title'                           => 'required|string|max:255',
            'job_description'                     => 'required|string',
            'minimum_salary'                      => 'nullable|integer|min:0',
            'maximum_salary'                      => 'nullable|integer|gte:minimum_salary',
            'vacant_position'                     => 'required|integer|min:1',
            'employment_type'                     => 'required|string|max:100',
            'posted_at'                           => 'nullable|date',
            'posted_until'                        => 'nullable|date|after_or_equal:posted_at',
            'listed_by'                           => 'required|exists:employee_account,employee_id',
            'requirements'                        => 'required|array',
            'requirements.highest_education'      => 'nullable|string|max:255',
            'requirements.experience'             => 'required|integer|min:0',
            'screening_questions'                 => 'nullable|array',
            'screening_questions.*.screening_question' => 'nullable|string|max:1000',
        ]);

        try {
            $jobListing = $this->jobListingService->storeJobListing($validated);

            return response()->json([
                'message' => 'Job listing created successfully.',
                'data'    => $jobListing->load(['listedBy']),
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to create job listing.',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
