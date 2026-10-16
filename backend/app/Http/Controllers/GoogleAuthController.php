<?php

namespace App\Http\Controllers;

use App\Models\EmployeeAccount;
use App\Models\GoogleToken;
use App\Services\GoogleMeetService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Crypt;

class GoogleAuthController extends Controller
{
    public function __construct(private GoogleMeetService $google) {}

    private function employee(Request $request): EmployeeAccount
    {
        $user = $request->user();
        abort_unless($user instanceof EmployeeAccount, 403, 'Employees only.');

        return $user;
    }

    // Authenticated: frontend calls this, then redirects the browser to the URL
    public function url(Request $request)
    {
        $user = $this->employee($request);

        $returnTo = (string) $request->query('return_to', '');
        // only allow in-app paths, to avoid open redirects
        if (! str_starts_with($returnTo, '/') || str_starts_with($returnTo, '//')) {
            $returnTo = '';
        }

        $client = $this->google->baseClient();
        $client->setState(Crypt::encryptString(
            $user->getKey().'|'.now()->addMinutes(10)->timestamp.'|'.$returnTo
        ));

        return response()->json(['url' => $client->createAuthUrl()]);
    }

    public function status(Request $request)
    {
        $user = $this->employee($request);

        return response()->json([
            'connected' => GoogleToken::where('employee_id', $user->getKey())->exists(),
        ]);
    }

    // Public: Google redirects the browser here
    public function callback(Request $request)
    {
        $returnTo = '';

        try {
            [$userId, $expires, $returnTo] = array_pad(
                explode('|', Crypt::decryptString((string) $request->state), 3),
                3,
                ''
            );

            if ($request->has('error') || ! $request->has('code')) {
                return $this->back($returnTo, 'error');
            }

            abort_if(now()->timestamp > (int) $expires, 400, 'State expired');

            $user = EmployeeAccount::findOrFail($userId);
            $token = $this->google->baseClient()->fetchAccessTokenWithAuthCode($request->code);

            if (isset($token['error'])) {
                report(new \RuntimeException('Google token error: '.json_encode($token)));

                return $this->back($returnTo, 'error');
            }

            $this->google->saveToken($user, $token);
        } catch (\Throwable $e) {
            report($e);

            return $this->back($returnTo, 'error');
        }

        return $this->back($returnTo, 'connected');
    }

    private function back(string $returnTo, string $flag)
    {
        $base = rtrim(config('services.google.frontend_url'), '/');
        $sep = str_contains($returnTo, '?') ? '&' : '?';

        return redirect($base.$returnTo.$sep.'google='.$flag);
    }
}
