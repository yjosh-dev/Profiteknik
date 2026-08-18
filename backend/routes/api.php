<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\RootAuthController;
use App\Http\Controllers\RootAccountController;

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
});

Route::apiResource('root', RootAccountController::class);

