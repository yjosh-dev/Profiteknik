<?php

namespace App\Http\Controllers;

use App\Mail\OtpMail;
use Illuminate\Support\Facades\Mail;

use Illuminate\Http\Request;

class OTPController extends Controller
{
  public function send(Request $request)
  {
    $otp = rand(1000, 9999);
    $expiresInMinutes = 2;

    cache()->put("otp_{$request->email}", $otp, now()->addMinutes($expiresInMinutes));

    Mail::to($request->email)->send(new OtpMail($otp, $expiresInMinutes, $request->email));

    return response()->json(['message' => 'OTP sent']);
   }
}
