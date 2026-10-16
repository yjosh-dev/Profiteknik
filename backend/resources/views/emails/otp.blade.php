<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Profiktenik Corporation E-recruitment app OTP </title>
</head>
<body style="margin:0; padding:0; background-color:#f3f4f6; font-family: Arial, Helvetica, sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f3f4f6; padding:40px 16px;">
        <tr>
            <td align="center">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
                    style="max-width:480px; background-color:#ffffff; border-radius:8px; overflow:hidden; box-shadow:0 1px 4px rgba(0,0,0,0.12);">

                    <!-- Header -->
                    <tr>
                        <td align="center" style="background-color:#dc2626; padding:20px 24px;">
                            <h1 style="margin:0; color:#ffffff; font-size:20px; font-weight:bold; line-height:1.3;">
                                Profiktenik Corporation E-recruitment app OTP 
                            </h1>
                        </td>
                    </tr>

                    <!-- Body -->
                    <tr>
                        <td style="padding:24px;">
                            <p style="margin:0 0 20px; color:#374151; font-size:13px; line-height:1.5;">
                                Hello,
                            </p>
                            <p style="margin:0 0 16px; color:#374151; font-size:13px; line-height:1.5;">
                                Your One-Time Password (OTP) for account verification is:
                            </p>

                            <!-- OTP box -->
                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
                                <tr>
                                    <td align="center" style="background-color:#f3f4f6; border-radius:8px; padding:14px 0;">
                                        <span style="font-size:28px; font-weight:bold; color:#dc2626; letter-spacing:4px; font-family:'Courier New', Courier, monospace;">
                                            {{ $otp }}
                                        </span>
                                    </td>
                                </tr>
                            </table>

                            <p style="margin:0 0 16px; color:#374151; font-size:13px; line-height:1.5;">
                                This OTP is valid for <strong>{{ $expiresInMinutes }} minutes</strong>. Please do not share this code with anyone.
                            </p>
                            <p style="margin:0 0 6px; color:#374151; font-size:13px; line-height:1.5;">
                                If you didn't request this code, please ignore this email.
                            </p>
                            <p style="margin:0; color:#374151; font-size:13px; line-height:1.5;">
                                Thank you for using our service!
                            </p>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td align="center" style="background-color:#f3f4f6; padding:12px 24px;">
                            <p style="margin:0; color:#6b7280; font-size:11px;">
                                &copy; Profiktenik Corporation. All rights reserved.
                            </p>
                        </td>
                    </tr>

                </table>
            </td>
        </tr>
    </table>
</body>
</html>