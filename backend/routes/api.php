<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\RootAccountController;
use App\Http\Controllers\RootAuthController;
use App\Http\Controllers\EmployeeAuthController;
use App\Http\Controllers\OTPController;
use App\Http\Controllers\ApplicantAuthController;
use App\Http\Controllers\Employee\JobListingController;

use App\Http\Controllers\Root\EmployeeAccountController;

use App\Http\Controllers\Users\ApplicantJobListingController;
use App\Http\Controllers\Users\ApplicantController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

//  ------------- R O O T  -----------------
Route::prefix('/root')->group(function () {
    // auth related
    Route::prefix('/auth')->controller(RootAuthController::class)->group(function () {
        Route::post('/login', 'authLogin');
        Route::middleware('auth:sanctum')->group(function () {
            Route::post('/logout', 'authLogout');
            Route::get('/me', 'verifyMe');
        });
    });

    // employee account related
    Route::apiResource('employees', EmployeeAccountController::class);
});


//  --------- E M P L O Y E E S  -----------
Route::prefix('/employee')->group(function () {
     // auth related
    Route::prefix('/auth')->controller(EmployeeAuthController::class)->group(function () {
        Route::post('/logout', 'authLogout')->middleware('auth:sanctum');
        Route::post('/login', 'authLogin');
        Route::middleware('auth:sanctum')->group(function () {
            Route::get('/me', 'verifyMe');
        });
    });

    Route::apiResource('job_listings', JobListingController::class);
});

//  -------- A P P L I C A N T S  ----------
Route::prefix('/applicant')->group(function () {
    Route::controller(ApplicantController::class)->group(function () {
        Route::post('/create_account', 'store');
        Route::get('/test', 'test');
    });


    Route::prefix('/auth')->controller(ApplicantAuthController::class)->group(function () {
       Route::post('/login', [ApplicantAuthController::class, 'login']);
       Route::get('/verify', [ApplicantAuthController::class, 'verify'])->middleware('auth:sanctum');
       Route::post('/logout', [ApplicantAuthController::class, 'logout']);
    });
  
});

Route::prefix('otp')->controller(OTPController::class)->group(function () {
    Route::post('/send', 'send');
    Route::post('/verify', 'verify');
});

Route::prefix('job_listing')->group(function () {
    Route::get('/', [ApplicantJobListingController::class, 'fetchJobListings']);
    Route::get('/{job_id}', [ApplicantJobListingController::class, 'fetchJobListing'])
        ->whereNumber('job_id');
});

Route::apiResource('root', RootAccountController::class);
