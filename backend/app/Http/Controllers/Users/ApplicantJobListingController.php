<?php

namespace App\Http\Controllers\Users;

use App\Http\Controllers\Controller;
use App\Services\Users\JobListingService;
use Illuminate\Http\Request;

class ApplicantJobListingController extends Controller
{
    public function __construct(
        protected JobListingService $JobListingService
    ) {}

    public function fetchJobListings(Request $request)
    {
        return $this->JobListingService->fetchJobListings();
    }

    public function fetchJobListing(string $job_id)
    {
        return $this->JobListingService->fetchJobListing($job_id);
    }
}
