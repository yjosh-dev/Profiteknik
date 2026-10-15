<?php

namespace App\Services;

use App\Models\EmployeeAccount;
use App\Models\GoogleToken;
use Carbon\Carbon;
use Google\Client;
use Google\Service\Calendar;
use Google\Service\Calendar\Event;
use Illuminate\Support\Str;

class GoogleMeetService
{
    public function baseClient(): Client
    {
        $client = new Client();
        $client->setClientId(config('services.google.client_id'));
        $client->setClientSecret(config('services.google.client_secret'));
        $client->setRedirectUri(config('services.google.redirect'));
        $client->setScopes([Calendar::CALENDAR_EVENTS]);
        $client->setAccessType('offline');
        $client->setPrompt('consent');

        return $client;
    }

    public function saveToken(EmployeeAccount $user, array $token): void
    {
        $existing = GoogleToken::where('employee_id', $user->getKey())->first();

        GoogleToken::updateOrCreate(
            ['employee_id' => $user->getKey()],
            [
                'access_token' => $token['access_token'],
                // Google only sends refresh_token the first time; keep the old one otherwise
                'refresh_token' => $token['refresh_token'] ?? $existing?->refresh_token,
                'expires_at' => now()->addSeconds($token['expires_in'] ?? 3600),
            ]
        );
    }

    protected function clientForUser(EmployeeAccount $user): Client
    {
        $stored = GoogleToken::where('employee_id', $user->getKey())->first();

        if (!$stored) {
            throw new \RuntimeException('Google account not connected.');
        }

        $client = $this->baseClient();
        $client->setAccessToken([
            'access_token' => $stored->access_token,
            'refresh_token' => $stored->refresh_token,
            'expires_in' => max(1, (int) now()->diffInSeconds($stored->expires_at, false)),
            'created' => now()->timestamp,
        ]);

        if ($client->isAccessTokenExpired()) {
            if (!$stored->refresh_token) {
                throw new \RuntimeException('Google token expired. Please reconnect your account.');
            }

            $new = $client->fetchAccessTokenWithRefreshToken($stored->refresh_token);

            if (isset($new['error'])) {
                throw new \RuntimeException('Google token expired. Please reconnect your account.');
            }

            $this->saveToken($user, $new);
        }

        return $client;
    }

    public function createMeeting(
        EmployeeAccount $user,
        string $title,
        Carbon $start,
        Carbon $end,
        array $attendeeEmails = []
    ): array {
        $service = new Calendar($this->clientForUser($user));

        $event = new Event([
            'summary' => $title,
            'start' => ['dateTime' => $start->toRfc3339String(), 'timeZone' => 'Asia/Manila'],
            'end' => ['dateTime' => $end->toRfc3339String(), 'timeZone' => 'Asia/Manila'],
            'attendees' => array_map(fn ($e) => ['email' => $e], $attendeeEmails),
            'conferenceData' => [
                'createRequest' => [
                    'requestId' => (string) Str::uuid(),
                    'conferenceSolutionKey' => ['type' => 'hangoutsMeet'],
                ],
            ],
        ]);

        $created = $service->events->insert('primary', $event, [
            'conferenceDataVersion' => 1, // required, or no Meet link is created
            'sendUpdates' => 'all',
        ]);

        return [
            'event_id' => $created->getId(),
            'meet_link' => $created->getHangoutLink(),
        ];
    }

    public function deleteMeeting(EmployeeAccount $user, string $eventId): void
    {
        $service = new Calendar($this->clientForUser($user));

        try {
            $service->events->delete('primary', $eventId, ['sendUpdates' => 'all']);
        } catch (\Google\Service\Exception $e) {
            // 404/410 = already deleted in Google Calendar, so just continue
            if (!in_array($e->getCode(), [404, 410])) {
                throw $e;
            }
        }
    }
}