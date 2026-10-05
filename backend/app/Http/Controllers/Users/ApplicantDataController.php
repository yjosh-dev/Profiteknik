<?php

namespace App\Http\Controllers\Users;

use App\Http\Controllers\Controller;
use App\Services\Users\ApplicantDataService;
use Illuminate\Http\Request;

class ApplicantDataController extends Controller
{
    public function __construct(private ApplicantDataService $applicantDataService) {}

    public function storeApplicantInformation(Request $request)
    {
        return response()->json([
            'user' => $this->applicantDataService->storeInformation($request),
        ]);
    }

    public function storeApplicantContact(Request $request)
    {
        return response()->json([
            'contact' => $this->applicantDataService->storeContact($request),
        ]);
    }

    public function storeApplicantExperience(Request $request)
    {
        return response()->json([
            'experiences' => $this->applicantDataService->storeExperience($request),
        ]);
    }

    public function storeApplicantSkills(Request $request)
    {
        return response()->json([
            'skills' => $this->applicantDataService->storeSkills($request),
        ]);
    }

    public function fetchApplicantProfile(Request $request)
    {
        return response()->json(
            $this->applicantDataService->fetchProfile($request)
        );
    }
}
