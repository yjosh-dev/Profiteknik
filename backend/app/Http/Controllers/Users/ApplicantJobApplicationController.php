<?php

namespace App\Http\Controllers\Users;

use App\Http\Controllers\Controller;
use App\Services\Users\ApplicantJobApplicationService;
use Illuminate\Http\Request;

class ApplicantJobApplicationController extends Controller
{
    public function __construct(private ApplicantJobApplicationService $ApplicantJobApplicationService) {}

    public function storeJobApplication(Request $request, int $job_id)
    {
        return $this->ApplicantJobApplicationService->storeJobApplication($request, $job_id);
    }
}
