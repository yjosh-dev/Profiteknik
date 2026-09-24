<?php

namespace App\Http\Controllers\Users;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Services\Users\JobListingService;

class ApplicantJobListingController extends Controller
{
    public function __construct(
        protected JobListingService $JobListingService
    ) {}

    public function fetchJobListing(Request $request)
    {
        return $this->JobListingService->fetchJobListing();
    }
}
