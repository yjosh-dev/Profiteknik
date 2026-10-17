<?php

namespace App\Services\Users;

class ApplicationTrackingService
{
    public function fetchApplicationTracking($applicant, int $applicationId)
    {
        return $applicant
            ->applications()
            ->with([
                'jobListing',
                'interview',
            ])
            ->where('application_id', $applicationId)
            ->first();
    }
}
