<?php

namespace App\Services;

use Exception;
use App\Models\EmployeeAccount;
use Illuminate\Support\Facades\Hash;

class EmployeeAuthService {

    public function attemptLogin(array $array) {
       $employee = $this->checkUsername($array['username']);

       if(!$employee){
         throw new Exception('Invalid username or password. Please try again');
       }

       $validPW = $this->compareHash($array['password'], $employee->password);
       if(!$validPW){
         throw new Exception('Invalid username or password. Please try again');
       }

       $token = $this->issueToken($employee);

       return $token;
    } 

    private function checkUsername($username){
        return EmployeeAccount::where('username', $username)->first();
    }

    private function compareHash($to_hash, $hashed){
       return Hash::check($to_hash, $hashed);
    }

     public function issueToken($user)
    {
        return $user->createToken('auth_token', ['*'])->plainTextToken;
    }
}