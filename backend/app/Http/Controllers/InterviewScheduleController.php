<?php

namespace App\Http\Controllers;

use App\Models\ApplicantJobApplication;
use App\Models\EmployeeAccount;
use App\Models\InterviewSchedule;
use App\Services\GoogleMeetService;
use Carbon\Carbon;
use Illuminate\Http\Request;

class InterviewScheduleController extends Controller
{
    // Change to the EXACT value stored in applicant_job_applications.status for the interview stage
    private const INTERVIEW_STATUS = 'interview';

    public function __construct(private GoogleMeetService $google) {}

    private function employee(Request $request): EmployeeAccount
    {
        $user = $request->user();
        abort_unless($user instanceof EmployeeAccount, 403, 'Employees only.');

        return $user;
    }

    public function store(Request $request, int $applicationId)
    {
        $user = $this->employee($request);

        $data = $request->validate([
            'starts_at' => ['required', 'date', 'after:now'],
            'duration_minutes' => ['required', 'integer', 'min:15', 'max:240'],
            'applicant_email' => ['required', 'email'],
            'title' => ['nullable', 'string', 'max:255'],
        ]);

        $application = ApplicantJobApplication::findOrFail($applicationId);

        // Guard 1: application must be in the interview stage
        $status = $application->status;
        $status = $status instanceof \BackedEnum ? $status->value : (string) $status;

        if (strtolower($status) !== strtolower(self::INTERVIEW_STATUS)) {
            return response()->json([
                'message' => 'Move this application to the Interview stage before scheduling a meeting.',
                'code' => 'wrong_status',
            ], 422);
        }

        // Guard 2: only one meeting per application
        $existing = InterviewSchedule::where('application_id', $applicationId)->first();

        if ($existing) {
            return response()->json([
                'message' => 'This application already has a meeting. Cancel it before scheduling a new one.',
                'code' => 'already_scheduled',
                'data' => $existing,
            ], 409);
        }

        $start = Carbon::parse($data['starts_at'], 'Asia/Manila');
        $end = $start->copy()->addMinutes($data['duration_minutes']);
        $title = $data['title'] ?? 'Interview';

        try {
            $meeting = $this->google->createMeeting($user, $title, $start, $end, [$data['applicant_email']]);
        } catch (\RuntimeException $e) {
            return response()->json([
                'message' => $e->getMessage(),
                'code' => 'needs_google',
                'needs_google' => true,
            ], 409);
        } catch (\Google\Service\Exception $e) {
            report($e);

            return response()->json(['message' => 'Google could not create the event.'], 502);
        }

        try {
            $schedule = InterviewSchedule::create([
                'application_id' => $applicationId,
                'scheduled_by' => $user->getKey(),
                'title' => $title,
                'applicant_email' => $data['applicant_email'],
                'starts_at' => $start,
                'ends_at' => $end,
                'google_event_id' => $meeting['event_id'],
                'meet_link' => $meeting['meet_link'],
            ]);
        } catch (\Throwable $e) {
            // don't leave an orphan event on the calendar
            $this->google->deleteMeeting($user, $meeting['event_id']);
            throw $e;
        }

        return response()->json(['data' => $schedule], 201);
    }

    public function show(Request $request, int $applicationId)
    {
        $this->employee($request);

        return response()->json([
            'data' => InterviewSchedule::where('application_id', $applicationId)->first(),
        ]);
    }

    public function destroy(Request $request, int $id)
    {
        $user = $this->employee($request);

        $schedule = InterviewSchedule::findOrFail($id);

        if ((int) $schedule->scheduled_by !== (int) $user->getKey()) {
            return response()->json([
                'message' => 'Only the person who scheduled this meeting can cancel it.',
            ], 403);
        }

        try {
            if ($schedule->google_event_id) {
                $this->google->deleteMeeting($user, $schedule->google_event_id);
            }
        } catch (\RuntimeException $e) {
            return response()->json(['message' => $e->getMessage(), 'needs_google' => true], 409);
        } catch (\Google\Service\Exception $e) {
            report($e);

            return response()->json(['message' => 'Google could not delete the event.'], 502);
        }

        $schedule->delete();

        return response()->json(['message' => 'Interview cancelled.']);
    }
}