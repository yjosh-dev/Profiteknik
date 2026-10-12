<?php

namespace App\Services\Users;

class ApplicantMyJobService
{
    public function fetchPendingApplications($applicant)
    {
        return $applicant
            ->applications()
            ->where('status', 'Pending')
            ->with('jobListing')
            ->get();
    }
}
