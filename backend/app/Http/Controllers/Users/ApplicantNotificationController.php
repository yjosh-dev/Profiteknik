<?php

namespace App\Http\Controllers\Users;

use App\Http\Controllers\Controller;
use App\Models\ApplicantNotification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ApplicantNotificationController extends Controller
{
    /**
     * Fetch active notifications for the authenticated applicant.
     */
    public function index(Request $request): JsonResponse
    {
        $applicantId = $request->user()->applicant_id;

        $notifications = ApplicantNotification::where(
            'applicant_id',
            $applicantId
        )
            ->where('active', true)
            ->orderByDesc('date_created')
            ->get();

        return response()->json([
            'data' => $notifications,
        ], 200);
    }

    /**
     * Set a notification to inactive.
     */
    public function deactivate(
        Request $request,
        int $recordId
    ): JsonResponse {
        $applicantId = $request->user()->applicant_id;

        $notification = ApplicantNotification::where(
            'record_id',
            $recordId
        )
            ->where('applicant_id', $applicantId)
            ->firstOrFail();

        $notification->update([
            'active' => false,
        ]);

        return response()->json([
            'message' => 'Notification deactivated successfully.',
        ], 200);
    }

    /**
     * Permanently delete a notification.
     */
    public function destroy(
        Request $request,
        int $recordId
    ): JsonResponse {
        $applicantId = $request->user()->applicant_id;

        $notification = ApplicantNotification::where(
            'record_id',
            $recordId
        )
            ->where('applicant_id', $applicantId)
            ->firstOrFail();

        $notification->delete();

        return response()->json([
            'message' => 'Notification deleted successfully.',
        ], 200);
    }
}
