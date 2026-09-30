<?php

namespace App\Http\Controllers\Users;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;
use App\Http\Controllers\Controller;

use App\Services\Users\ApplicantService;

class ApplicantController extends Controller
{
    public function __construct(private ApplicantService $applicantService) {}

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'username' => 'required|string|email|max:255|unique:applicant_account,username',
            'password' => 'required|string|min:8',
        ]);

        $account = $this->applicantService->createAccount($data);

        return response()->json($account, 201);
    }

    public function show(int $id): JsonResponse
    {
        $account = $this->applicantService->find($id);

        return response()->json($account);
    }

    public function test(){
        return 'test';
    }
}