<?php

namespace App\Services;

use Exception;
use Illuminate\Http\Request;
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

    public function verify(Request $request)
    {
        $user = $request->user();
        $info = $user->info;
        $data = [
          "id" => $info->employee_id,
          "first_name" => $info->first_name,
          "middle_name" => $info->middle_name,
          "last_name" => $info->last_name,
          "profile_image" => $info->profile_image,
          "role" => "employee"
       ];
        return $data;
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
}