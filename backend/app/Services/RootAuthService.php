<?php

namespace App\Services;

use App\Models\RootAccount;
use Exception;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;

class RootAuthService
{
    public function attemptLogin(array $data)
    {

        $key = 'login:' . $data['username'];

        if (RateLimiter::tooManyAttempts($key, $maxAttempts = 5)) {
            $seconds = RateLimiter::availableIn($key);

            throw new Exception(
                "Too many attempts! Please try again in {$seconds} seconds."
            );
        }

        $account = $this->usernameCheck($data['username']);


        $hashToCheck = $account->password ?? '$2y$12$N9qo8uLOickgx2ZMRZoMyeIjZAgcKf7gp728F9E585V.46SjZJuWu';

     
        if (
            !$this->passwordCheck($data['password'], $hashToCheck) ||
            !$account
        ) {
            RateLimiter::increment($key, 60);

            throw new Exception(
                "Invalid username or password! Please try again later."
            );
        }

        $token = $this->issueToken($account);

        RateLimiter::clear($key);

        if (!$token) {
            throw new Exception(
                "An error occurred while issuing tokens. Please try again."
            );
        }

        return $token;
    }

    public function logout($data)
    {
        $username = $data->user();
        $logout = $username->tokens()->delete();

        if(!$logout){
            throw new Exception('Error occured while logging out. Please try again later.');
        }

        return $username->username;
    }

    private function usernameCheck($username)
    {
        return RootAccount::where('username', $username)->first();
    }

    public function passwordCheck($password, $hashedPassword)
    {
        return Hash::check($password, $hashedPassword);
    }

    public function issueToken($user)
    {
        return $user->createToken('auth_token', ['*'])->plainTextToken;
    }
}