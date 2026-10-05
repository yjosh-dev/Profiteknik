<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your Signup Verification Code</title>
</head>
<body style="margin:0; padding:0; background-color:#fafafa; font-family: Arial, Helvetica, sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#fafafa; padding:48px 0;">
        <tr>
            <td align="center">
                <table role="presentation" width="420" cellpadding="0" cellspacing="0"
                    style="background-color:#ffffff; border-radius:12px; padding:40px 32px; box-shadow:0 1px 4px rgba(0,0,0,0.06);">

                    <!-- Title -->
                    <tr>
                        <td align="center" style="padding-bottom:20px;">
                            <h1 style="margin:0; color:#3f3f46; font-size:22px; font-weight:bold; line-height:1.3;">
                                Your Signup verification Code
                            </h1>
                        </td>
                    </tr>

                    <!-- OTP digits -->
                    <tr>
                        <td align="center" style="padding-bottom:12px;">
                            <table role="presentation" cellpadding="0" cellspacing="0">
                                <tr>
                                    @foreach (str_split($otp) as $digit)
                                        <td style="padding:0 4px;">
                                            <div style="width:40px; height:40px; border:1px solid #e4e4e7; border-radius:8px;
                                                display:flex; align-items:center; justify-content:center;
                                                font-size:18px; font-weight:bold; color:#b91c1c; background-color:#fef2f2;
                                                line-height:40px; text-align:center; padding-left:5px;">
                                                {{ $digit }} 
                                            </div>
                                        </td>
                                    @endforeach
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <tr>
                        <td align="center" style="padding-bottom:24px;">
                            <p style="margin:0; color:#71717a; font-size:13px;">
                                Don't share this code to anyone!
                            </p>
                        </td>
                    </tr>

                    <!-- Warning box -->
                    <tr>
                        <td style="background-color:#fef2f2; border:1px solid #fecaca; border-radius:8px; padding:14px 16px; margin-bottom:20px;">
                            <p style="margin:0 0 6px; color:#b91c1c; font-size:14px; font-weight:bold;">
                                &#9432; Was this request not made by you?
                            </p>
                            <p style="margin:0; color:#71717a; font-size:13px; line-height:1.5;">
                                <strong style="color:#3f3f46;">Heads up!</strong> This code expires in
                                <strong style="color:#3f3f46;">{{ $expiresInMinutes }} minutes</strong>.
                                If you didn't request this, no worries, just ignore this email.
                            </p>
                        </td>
                    </tr>

                    <tr><td style="height:20px;"></td></tr>

                    <tr>
                        <td align="center">
                            <p style="margin:0; color:#a1a1aa; font-size:12px;">
                                This is an automated message. <strong style="color:#71717a;">Please do not reply.</strong>
                            </p>
                        </td>
                    </tr>

                    <tr><td style="border-top:1px solid #f4f4f5; padding-top:16px;"></td></tr>

                    <tr>
                        <td align="left" style="padding-top:16px;">
                            <p style="margin:0; color:#a1a1aa; font-size:12px; line-height:1.5;">
                                We're glad you're here. Let's make a difference together.<br>
                                <strong style="color:#71717a;">{{ config('app.name', 'Your Company') }} Team</strong>
                            </p>
                        </td>
                    </tr>

                </table>
            </td>
        </tr>
    </table>
</body>
</html>