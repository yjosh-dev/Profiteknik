<?php

namespace App\Services\Users;

use Illuminate\Support\Facades\DB;

use App\Models\ApplicantAccount;
use App\Models\ApplicantInformation;
use App\Models\ApplicantContact;

class ApplicantService
{
    public function createAccount(array $data): ApplicantAccount
    {
        return DB::transaction(function () use ($data) {
            $account = ApplicantAccount::create([
                'username' => $data['username'],
                'password' => $data['password'],
            ]);

            ApplicantInformation::create([
                'applicant_id' => $account->applicant_id,
            ]);

            ApplicantContact::create([
                'applicant_id' => $account->applicant_id,
            ]);

            return $account;
        });
    }
}