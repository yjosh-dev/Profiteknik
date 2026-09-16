<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\EmployeeAuthService;

class EmployeeAuthController extends Controller
{
    public function __construct(
        protected EmployeeAuthService $EmployeeAuthService
    ){}

    public function authLogin(Request $request){

        $validated = $request->validate([
             'username' => "required | max:255 ",
             'password' => "required | min:8 | max:255"
        ]);

      try{
        $try = $this->EmployeeAuthService->attemptLogin($validated);
          return response()->json([
             'success' => true,
             'message' => "Login successfully!",
             'data' => $try
        ], 200);
      }catch(Exception $e){
         return response()->json([
             'success' => false,
             'message' => $e->getMessage(),
          ], 401);
      }

    }
}
