<?php

namespace App\Http\Requests\Employee;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class JobListingUploadRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return false;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'job_title' => ['required', 'string', 'max:255'],
            'job_description' => ['required', 'string'],
            'minimum_salary' => ['required', 'integer', 'min:0'],
            'maximum_salary' => ['required', 'integer', 'gte:minimum_salary'],
            'vacant_position' => ['required', 'integer', 'min:1'],
            'employment_type' => ['required', 'string', 'in:full_time,part_time,contract,temporary'],
            'posted_until' => ['required', 'date', 'after_or_equal:today'],
            'listed_by' => ['required', 'exists:employee_accounts,employee_id'],
        ];
    }
}
