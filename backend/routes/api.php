<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\RootAuthController;
use App\Http\Controllers\RootAccountController;
use App\Http\Controllers\Root\EmployeeAccountController;

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
Route::apiResource('root', RootAccountController::class);


