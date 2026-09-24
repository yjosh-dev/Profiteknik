<?php

namespace App\Services\Users;

use App\Models\JobListing;
use App\Models\JobListingRequirements;


class JobListingService
{
    public function fetchJobListing(){
       return $job = JobListing::has('requirements')->paginate(10);
    }
}
