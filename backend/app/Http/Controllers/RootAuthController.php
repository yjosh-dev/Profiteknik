<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Http\Requests\RootAuthRequest;
use App\Services\RootAuthService;

class RootAuthController extends Controller
{
    public function __construct(
        protected RootAuthService $rootAuthService
    ) {}

    public function authLogin(RootAuthRequest $rootAuthRequest)
    {
       try{

          $login = $this->rootAuthService->attemptLogin($rootAuthRequest->validated());

          return response()->json([
             'success' => true,
             'message' => "Login successfully!",
             'data' => $login
          ], 200);

       }catch(Exception $e){

          return response()->json([
             'success' => false,
             'message' => $e.getMessage(),
          ], 401);

       }
    }

    public function authLogout(Request $request)
    {
         $logout = $this->rootAuthService->logout($request);

         return $logout;
    }
}
