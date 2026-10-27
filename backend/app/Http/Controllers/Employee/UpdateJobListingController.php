<?php

namespace App\Http\Controllers\Employee;

use App\Http\Controllers\Controller;
use App\Models\JobListing;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;

class UpdateJobListingController extends Controller
{
    public function __invoke(Request $request, string $job_id)
    {
        $data = $request->validate([
            'job_title'       => ['required', 'string', 'max:255'],
            'job_description' => ['required', 'string'],
            'employment_type' => ['required', 'string'],
            'vacant_position' => ['required', 'integer', 'min:1'],
            'minimum_salary'  => ['required', 'integer', 'min:0'],
            'maximum_salary'  => ['required', 'integer', 'gte:minimum_salary'],
            'posted_at'       => ['required', 'date'],
            'posted_until'    => ['required', 'date', 'after_or_equal:posted_at'],

            'requirements'                   => ['sometimes', 'array'],
            'requirements.highest_education' => ['nullable', 'string', 'max:255'],
            'requirements.experience'        => ['nullable', 'integer', 'min:0'],
        ]);

        $listing = DB::transaction(function () use ($job_id, $data) {
            $listing = JobListing::findOrFail($job_id);

            $listing->update(Arr::except($data, ['requirements']));

            if (isset($data['requirements'])) {
                $listing->requirements()->updateOrCreate(
                    ['job_id' => $listing->job_id],
                    $data['requirements']
                );
            }

            return $listing->load('requirements');
        });

        return response()->json($listing);
    }
}