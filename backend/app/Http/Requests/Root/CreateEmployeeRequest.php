<?php

namespace App\Http\Requests\Root;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class CreateEmployeeRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            // Employee Information
            'first_name' => ['required', 'string', 'max:255'],
            'middle_name' => ['nullable', 'string', 'max:255'],
            'last_name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255'],
            'suffix' => ['nullable', 'string', 'max:50'],
            'salutations' => ['nullable', 'string', 'max:50'],
            'sex' => ['required', 'string', 'in:Male,Female,other'],
            'profile_image' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5048'],

            // Employee Account
            'username' => ['required', 'string', 'max:255', 'unique:employee_account,username'],
            'password' => ['required', 'string', 'min:8'],
            'status' => ['nullable', 'string', 'in:active,inactive,pending'],
        ];
    }
}
