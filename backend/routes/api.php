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
        Route::post('/logout', 'authLogout')->middleware('auth:sanctum');
    }); 
});

Route::apiResource('root', RootAccountController::class);

