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

    public function fetchShortlistedApplications($applicant)
    {
        return $applicant
            ->applications()
            ->where('status', 'Shortlisted')
            ->with('jobListing')
            ->get();
    }

    public function fetchInterviewApplications($applicant)
    {
        return $applicant
            ->applications()
            ->where('status', 'Interview')
            ->with('jobListing')
            ->get();
    }
}
