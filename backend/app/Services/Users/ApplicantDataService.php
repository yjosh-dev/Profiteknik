<?php

namespace App\Services\Users;

use App\Models\ApplicantAccount;
use App\Models\ApplicantContact;
use App\Models\ApplicantInformation;
use App\Models\ApplicantResume;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;

class ApplicantDataService
{
    // Column on the ApplicantSkill table that holds the skill text.
    // Change this one line if yours is named differently.
    private const SKILL_COLUMN = 'skill_name';

    public function storeInformation(Request $request): ApplicantInformation
    {
        // 1. Get the authenticated applicant
        $id = $request->user()->applicant_id;

        // 2. Validate the incoming payload
        $validated = $request->validate([
            'first_name' => ['required', 'string', 'max:255'],
            'last_name' => ['required', 'string', 'max:255'],
            'street' => ['required', 'string', 'max:255'],
            'city' => ['required', 'string', 'max:255'],
            'region' => ['required', 'string', 'max:255'],
            'country' => ['required', 'string', 'max:255'],
            'middle_name' => ['nullable', 'string', 'max:255'],
            'suffix' => ['nullable', 'string', 'max:50'],
            'building_no' => ['nullable', 'string', 'max:50'],
            'house_no' => ['nullable', 'string', 'max:50'],
            'profile_image' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
        ]);

        $information = ApplicantInformation::findOrFail($id);
        $account = ApplicantAccount::findOrFail($id);
        // The uploaded file can't go into update(), so strip it from the data
        $data = Arr::except($validated, ['profile_image']);

        $oldImage = $information->applicant_profile_picture;
        $newImage = null;

        // 3. Store the new profile image (if one was sent)
        if ($request->hasFile('profile_image')) {
            $newImage = $request->file('profile_image')->store('profile_images', 'public');
            $data['applicant_profile_picture'] = $newImage;
        }

        try {
            $information->update($data);
            $account->update(['isNew' => false]);
        } catch (\Throwable $e) {
            if ($newImage) {
                Storage::disk('public')->delete($newImage);
            }
            throw $e;
        }

        if ($newImage && $oldImage) {
            Storage::disk('public')->delete($oldImage);
        }

        return $information->fresh();
    }

    public function storeContact(Request $request): ApplicantContact
    {
        $id = $request->user()->applicant_id;

        $validated = $request->validate([
            'email' => ['required', 'email', 'max:255'],
            'phone_no' => ['required', 'string', 'regex:/^\+\d{10,15}$/'],
            'tel_no' => ['nullable', 'string', 'max:30'],
        ]);

        return ApplicantContact::updateOrCreate(
            ['applicant_id' => $id],
            $validated
        );
    }

    public function storeExperience(Request $request): array
    {
        $account = $request->user();

        $validated = $request->validate([
            'has_experience' => ['required', 'boolean'],
            'experiences' => ['present', 'array', 'max:50'],
            'experiences.*.job_title' => ['required', 'string', 'max:255'],
            'experiences.*.company' => ['required', 'string', 'max:255'],
            'experiences.*.start_date' => ['required', 'date_format:Y-m'],
            'experiences.*.end_date' => ['nullable', 'date_format:Y-m'],
        ]);

        $hasExperience = (bool) $validated['has_experience'];
        $experiences = $hasExperience ? $validated['experiences'] : [];

        if ($hasExperience && empty($experiences)) {
            throw ValidationException::withMessages([
                'experiences' => 'Add at least one job, or choose "no experience".',
            ]);
        }

        foreach ($experiences as $index => $experience) {
            $end = $experience['end_date'] ?? null;
            if ($end && $end < $experience['start_date']) {
                throw ValidationException::withMessages([
                    "experiences.$index.end_date" => 'End date cannot be earlier than the start date.',
                ]);
            }
        }

        $rows = collect($experiences)->map(fn ($e) => [
            'position' => trim($e['job_title']),
            'company_name' => trim($e['company']),
            'start_date' => $e['start_date'].'-01',
            'end_date' => ! empty($e['end_date'])
                ? Carbon::createFromFormat('Y-m-d', $e['end_date'].'-01')->endOfMonth()->toDateString()
                : null,
        ])->all();

        DB::transaction(function () use ($account, $rows) {
            $account->experiences()->delete();

            if (! empty($rows)) {
                $account->experiences()->createMany($rows);
            }

            $account->update(['isNew' => false]);
        });

        return $this->mapExperiences(
            $account->experiences()->orderByDesc('start_date')->get()
        );
    }

    public function storeSkills(Request $request): array
    {
        $account = $request->user();

        $validated = $request->validate([
            'skills' => ['present', 'array', 'max:50'],
            'skills.*' => ['required', 'string', 'max:40'],
        ]);

        $skills = collect($validated['skills'])
            ->map(fn ($skill) => trim($skill))
            ->filter()
            ->unique(fn ($skill) => mb_strtolower($skill))
            ->values();

        DB::transaction(function () use ($account, $skills) {
            $account->skills()->delete();

            if ($skills->isNotEmpty()) {
                $account->skills()->createMany(
                    $skills->map(fn ($skill) => [self::SKILL_COLUMN => $skill])->all()
                );
            }
        });

        return $skills->all();
    }

    public function fetchProfile(Request $request): array
    {
        $account = $request->user();

        return [
            'information' => $account->information,
            'contact' => $account->contact,
            'experiences' => $this->mapExperiences(
                $account->experiences()->orderByDesc('start_date')->get()
            ),
            'skills' => $account->skills()->pluck(self::SKILL_COLUMN),
            'resume' => $this->mapResume(
                ApplicantResume::where('applicant_id', $account->applicant_id)->first()
            ),

        ];
    }

    private function mapExperiences(Collection $experiences): array
    {
        return $experiences->map(fn ($e) => [
            'id' => $e->record_id,
            'job_title' => $e->position,
            'company' => $e->company_name,
            'start_date' => $e->start_date?->format('Y-m'),
            'end_date' => $e->end_date?->format('Y-m'),
        ])->values()->all();
    }

    public function storeResume(Request $request): ?array
    {
        $id = $request->user()->applicant_id;

        $request->validate([
            'resume' => ['required', 'file', 'mimes:pdf,doc,docx', 'max:5120'], // 5 MB
        ]);

        $file = $request->file('resume');
        $oldPath = ApplicantResume::where('applicant_id', $id)->value('resume');

        // Keep the original file name in the path, since the table has no name column
        $safeName = preg_replace('/[^\w.\- ]/u', '_', $file->getClientOriginalName());
        $newPath = $file->storeAs("resumes/{$id}", $safeName, 'local');

        try {
            $resume = ApplicantResume::updateOrCreate(
                ['applicant_id' => $id],
                ['resume' => $newPath, 'date_uploaded' => now()]
            );
        } catch (\Throwable $e) {
            if ($newPath !== $oldPath) {
                Storage::disk('local')->delete($newPath);
            }
            throw $e;
        }

        // Same name means the file was overwritten, so don't delete it
        if ($oldPath && $oldPath !== $newPath) {
            Storage::disk('local')->delete($oldPath);
        }

        return $this->mapResume($resume);
    }

    public function deleteResume(Request $request): void
    {
        $resume = ApplicantResume::where('applicant_id', $request->user()->applicant_id)->first();

        if (! $resume) {
            return;
        }

        $path = $resume->resume;
        $resume->delete();
        Storage::disk('local')->delete($path);
    }

    public function downloadResume(Request $request)
    {
        $resume = ApplicantResume::where('applicant_id', $request->user()->applicant_id)->first();

        if (! $resume || ! Storage::disk('local')->exists($resume->resume)) {
            abort(404, 'No resume found.');
        }

        return Storage::disk('local')->download($resume->resume, basename($resume->resume));
    }

    private function mapResume(?ApplicantResume $resume): ?array
    {
        if (! $resume) {
            return null;
        }

        $disk = Storage::disk('local');
        $exists = $disk->exists($resume->resume);

        return [
            'name' => basename($resume->resume),
            'size' => $exists ? $disk->size($resume->resume) : null,
            'uploaded_at' => $resume->date_uploaded?->toIso8601String(),
        ];
    }

    public function fetchMyJobs(Request $request)
    {
        $applications = $request->user()
            ->applications();

        return response()->json([
            'applicant_id' => $request->user()->applicant_id,

            'pending' => (clone $applications)
                ->where('status', 'Pending')
                ->count(),

            'shortlisted' => (clone $applications)
                ->where('status', 'Shortlisted')
                ->count(),

            'interviews' => (clone $applications)
                ->where('status', 'Interview')
                ->count(),

            'rejected' => (clone $applications)
                ->where('status', 'Rejected')
                ->count(),
        ]);
    }
}
