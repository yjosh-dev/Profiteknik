<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\RootAuthController;
use App\Http\Controllers\RootAccountController;
use App\Http\Controllers\EmployeeAuthController;

use App\Http\Controllers\Root\EmployeeAccountController;

use App\Http\Controllers\Employee\JobListingController;



Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');


Route::prefix('/root')->group(function () {
    //auth related
    Route::prefix('/auth')->controller(RootAuthController::class)->group(function (){
        Route::post('/login', 'authLogin');
        Route::middleware('auth:sanctum')->group(function () {
          Route::post('/logout', 'authLogout');
          Route::get('/me', 'verifyMe');
        });
    });     

    //employee account related
    Route::apiResource('employees', EmployeeAccountController::class);
});

Route::prefix('/employee')->group(function () {
     Route::prefix("/auth")->controller(EmployeeAuthController::class)->group(function () {
        Route::post('/logout', 'authLogout')->middleware('auth:sanctum');
        Route::post('/login', 'authLogin' );
        Route::middleware('auth:sanctum')->group(function () {
           Route::get('/me', 'verifyMe');
        });
     });
     
     Route::apiResource('job_listings', JobListingController::class);
});

Route::apiResource('root', RootAccountController::class);


