<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $copy['headline'] }}</title>
</head>
<body style="margin:0; padding:0; background-color:#f3f4f6; font-family: Arial, Helvetica, sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f3f4f6; padding:40px 16px;">
        <tr>
            <td align="center">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
                    style="max-width:480px; background-color:#ffffff; border-radius:8px; overflow:hidden; box-shadow:0 1px 4px rgba(0,0,0,0.12);">

                    <!-- Header -->
                    <tr>
                        <td align="center" style="background-color:{{ $copy['color'] }}; padding:20px 24px;">
                            <h1 style="margin:0; color:#ffffff; font-size:20px; font-weight:bold; line-height:1.3;">
                                {{ $copy['headline'] }}
                            </h1>
                        </td>
                    </tr>

                    <!-- Body -->
                    <tr>
                        <td style="padding:24px;">
                            <p style="margin:0 0 16px; color:#374151; font-size:13px; line-height:1.5;">
                                Hello {{ $applicantName }},
                            </p>
                            <p style="margin:0 0 20px; color:#374151; font-size:13px; line-height:1.5;">
                                {{ $copy['intro'] }}
                            </p>

                            <!-- Details -->
                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
                                style="margin-bottom:20px; background-color:#f3f4f6; border-radius:8px;">
                                <tr>
                                    <td style="padding:16px;">
                                        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                                            @if ($jobTitle)
                                                <tr>
                                                    <td style="padding:4px 0; color:#6b7280; font-size:12px; width:90px;">Position</td>
                                                    <td style="padding:4px 0; color:#111827; font-size:13px; font-weight:bold;">{{ $jobTitle }}</td>
                                                </tr>
                                            @endif
                                            <tr>
                                                <td style="padding:4px 0; color:#6b7280; font-size:12px; width:90px;">Status</td>
                                                <td style="padding:4px 0; font-size:13px; font-weight:bold; color:{{ $copy['color'] }};">{{ $copy['label'] }}</td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>

                            <p style="margin:0 0 6px; color:#374151; font-size:13px; line-height:1.5;">
                                {{ $copy['body'] }}
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