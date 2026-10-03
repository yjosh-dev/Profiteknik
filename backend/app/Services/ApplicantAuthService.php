<?php

namespace App\Services;

use App\Models\ApplicantAccount;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class ApplicantAuthService
{
    public function attemptLogin(array $array)
    {
        $applicant = $this->checkUsername($array['username']);

        if (! $applicant) {
            throw new Exception('Invalid username or password. Please try again');
        }

        $validPW = $this->compareHash($array['password'], $applicant->password);
        if (! $validPW) {
            throw new Exception('Invalid username or password. Please try again');
        }

        $applicant->update(['last_login' => now()]);

        $token = $this->issueToken($applicant);

        return $token;
    }

    private function checkUsername($username)
    {
        return ApplicantAccount::where('username', $username)->first();
    }

    private function compareHash($to_hash, $hashed)
    {
        return Hash::check($to_hash, $hashed);
    }

    public function issueToken($user)
    {
        return $user->createToken('auth_token', ['*'])->plainTextToken;
    }

    public function verify(Request $request)
    {
        $user = $request->user();
        $info = $user->information;

        $data = [
            'id' => $user->applicant_id,
            'first_name' => $info->first_name,
            'middle_name' => $info->middle_name,
            'last_name' => $info->last_name,
            'profile_image' => $info->profile_image,
            'role' => 'applicant',
        ];

        return $data;
    }

    public function logout($data)
    {
        $user = $data->user();
        $logout = $user->tokens()->delete();

        if (! $logout) {
            throw new Exception('Error occured while logging out. Please try again later.');
        }

        return $user->username;
    }
}