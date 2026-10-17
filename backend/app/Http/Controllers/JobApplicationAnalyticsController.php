<?php

namespace App\Http\Controllers\Users;

use App\Http\Controllers\Controller;
use App\Services\Users\ApplicationTracking;
use Illuminate\Http\Request;

class ApplicationTrackingController extends Controller
{
    public function __construct(
        private ApplicationTracking $applicationTracking
    ) {}

    public function show(Request $request, int $applicationId)
    {
        $applicant = $request->user();

        $application = $this->applicationTracking
            ->fetchApplicationTracking($applicant, $applicationId);

        if (! $application) {
            return response()->json([
                'message' => 'Application not found.',
            ], 404);
        }

        $status = strtolower($application->status);

        $steps = [
            [
                'key' => 'applied',
                'label' => 'Applied',
                'description' => 'Your application was received by the employer.',
                'date' => $application->date_applied,
                'status' => 'completed',
            ],
            [
                'key' => 'review',
                'label' => 'Under Review',
                'description' => 'The hiring team is reviewing your application.',
                'date' => null,
                'status' => 'upcoming',
            ],
            [
                'key' => 'shortlisted',
                'label' => 'Shortlisted',
                'description' => 'You were shortlisted from the initial applicant pool.',
                'date' => null,
                'status' => 'upcoming',
            ],
            [
                'key' => 'interview',
                'label' => 'Interview',
                'description' => 'Your application has reached the interview stage.',
                'date' => null,
                'status' => 'upcoming',
            ],
            [
                'key' => 'completed',
                'label' => 'Completed',
                'description' => 'The application process has been completed.',
                'date' => null,
                'status' => 'upcoming',
            ],
        ];

        $statusOrder = [
            'pending' => 1,
            'shortlisted' => 2,
            'interview' => 3,
            'completed' => 4,
        ];

        if ($status === 'rejected') {
            $steps = [
                $steps[0],
                $steps[1],
                [
                    'key' => 'rejected',
                    'label' => 'Rejected',
                    'description' => 'Your application was not selected to proceed further.',
                    'date' => null,
                    'status' => 'rejected',
                ],
            ];
        } else {
            $currentPosition = $statusOrder[$status] ?? 1;

            foreach ($steps as $index => &$step) {
                $stepPosition = $index + 1;

                if ($stepPosition < $currentPosition) {
                    $step['status'] = 'completed';
                } elseif ($stepPosition === $currentPosition) {
                    $step['status'] = 'current';
                } else {
                    $step['status'] = 'upcoming';
                }
            }

            unset($step);
        }

        return response()->json([
            'application_id' => $application->application_id,
            'applied_at' => $application->date_applied,
            'current_status' => $application->status,

            'job' => [
                'id' => $application->jobListing->job_id,
                'title' => $application->jobListing->job_title,
                'company' => 'Profiteknik Corporation',
                'location' => 'Pasig City / Taguig City',
                'employment_type' => $application->jobListing->employment_type,
                'salary_range' => $this->formatSalary(
                    $application->jobListing->minimum_salary,
                    $application->jobListing->maximum_salary
                ),
            ],

            'steps' => $steps,
        ]);
    }

    private function formatSalary($minimum, $maximum): string
    {
        if (! $minimum && ! $maximum) {
            return 'Salary not specified';
        }

        if ($minimum && $maximum) {
            return '₱'.number_format($minimum).
                ' – ₱'.number_format($maximum).' / month';
        }

        if ($minimum) {
            return 'From ₱'.number_format($minimum).' / month';
        }

        return 'Up to ₱'.number_format($maximum).' / month';
    }
}
