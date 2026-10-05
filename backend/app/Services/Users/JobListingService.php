<?php

namespace App\Services\Users;

use App\Models\JobListing;

class JobListingService
{
    public function fetchJobListings()
    {
        return $job = JobListing::has('requirements')->paginate(10);
    }

    public function fetchJobListing(string $job_id)
    {
        $listing = JobListing::with([
            'requirements',
            'screeningQuestions',
        ])
            ->findOrFail($job_id);

        return response()->json($listing);
    }
}
