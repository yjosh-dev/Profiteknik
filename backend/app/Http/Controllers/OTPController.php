<?php

namespace App\Http\Controllers;

use App\Mail\OtpMail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Mail;

class OTPController extends Controller
{
    public function send(Request $request)
    {
        $otp = rand(1000, 9999);
        $expiresInMinutes = 10;

        cache()->put("otp_{$request->email}", $otp, now()->addMinutes($expiresInMinutes));
        Mail::to($request->email)->send(new OtpMail($otp, $expiresInMinutes, $request->email));

        return response()->json(['message' => 'OTP sent']);
    }

    public function verify(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'otp' => 'required|digits:4',
        ]);

        $key = "otp_{$request->email}";
        $storedOtp = Cache::get($key);

        if (! $storedOtp) {
            return response()->json(['message' => 'OTP expired or not found'], 422);
        }

        if ((string) $storedOtp !== (string) $request->otp) {
            return response()->json(['message' => 'Invalid OTP'], 422);
        }

        Cache::forget($key); // one-time use

        return response()->json(['message' => 'OTP verified']);
    }
}
