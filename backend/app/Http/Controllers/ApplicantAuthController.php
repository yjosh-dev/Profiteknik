<?php

namespace App\Http\Controllers;

use App\Services\ApplicantAuthService;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ApplicantAuthController extends Controller
{
    public function __construct(private ApplicantAuthService $authService) {}

    public function login(Request $request): JsonResponse
    {
        $credentials = $request->validate([
            'username' => 'required|string',
            'password' => 'required|string',
        ]);

        try {
            $token = $this->authService->attemptLogin($credentials);

            return response()->json([
                'message' => 'Login successful.',
                'token' => $token,
            ]);
        } catch (Exception $e) {
            return response()->json(['message' => $e->getMessage()], 401);
        }
    }

    public function verify(Request $request): JsonResponse
    {
        try {
            $data = $this->authService->verify($request);

            return response()->json($data);
        } catch (Exception $e) {
            return response()->json(['message' => $e->getMessage()], 401);
        }
    }

    public function logout(Request $request): JsonResponse
    {
        try {
            $username = $this->authService->logout($request);

            return response()->json([
                'message' => 'Logged out successfully.',
                'username' => $username,
            ]);
        } catch (Exception $e) {
            return response()->json(['message' => $e->getMessage()], 500);
        }
    }
}
