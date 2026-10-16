<?php

namespace App\Mail;

use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ApplicationStatusMail extends Mailable
{
    use SerializesModels;

    /**
     * Statuses that notify the applicant. "pending" is left out on purpose,
     * since it is usually a reset rather than news. Add it here (and in copyFor) if you want it.
     */
    public const NOTIFY_STATUSES = ['shortlisted', 'interview', 'onboarding', 'rejected', 'completed'];

    public array $copy;

    public function __construct(
        public string $applicantName,
        public ?string $jobTitle,
        public string $status,
    ) {
        $this->copy = self::copyFor(strtolower($status), $jobTitle);
    }

    public static function supports(string $status): bool
    {
        return in_array(strtolower($status), self::NOTIFY_STATUSES, true);
    }

    public static function copyFor(string $status, ?string $jobTitle): array
    {
        $role = $jobTitle ? " for the {$jobTitle} position" : '';

        return match ($status) {
            'shortlisted' => [
                'label' => 'Shortlisted',
                'subject' => "You've been shortlisted",
                'headline' => "You've been shortlisted",
                'color' => '#dc2626',
                'intro' => "Good news! After reviewing your application{$role}, our hiring team has shortlisted you.",
                'body' => "We'll be in touch about the next steps, so please keep an eye on your email and your applications page.",
            ],
            'interview' => [
                'label' => 'Interview',
                'subject' => "You're moving to the interview stage",
                'headline' => "You're moving to the interview stage",
                'color' => '#dc2626',
                'intro' => "Congratulations! You've moved on to the interview stage{$role}.",
                'body' => 'Our hiring team will send you the interview schedule and meeting details separately. Please keep an eye on your email.',
            ],
            'onboarding' => [
                'label' => 'Onboarding',
                'subject' => "You've reached the onboarding stage",
                'headline' => "You've reached onboarding",
                'color' => '#dc2626',
                'intro' => "Congratulations! You've reached the onboarding stage{$role}.",
                'body' => 'Our team will contact you with the requirements and next steps to get started. Please watch your email and phone for updates.',
            ],
            'rejected' => [
                'label' => 'Not selected',
                'subject' => 'An update on your application',
                'headline' => 'An update on your application',
                'color' => '#374151',
                'intro' => "Thank you for applying{$role} and for the time you put into your application.",
                'body' => "After careful review, we've decided not to move forward with your application at this time. We encourage you to keep an eye on our other openings, and we wish you the best in your job search.",
            ],
            'completed' => [
                'label' => 'Completed',
                'subject' => 'Your application process is complete',
                'headline' => 'Your application process is complete',
                'color' => '#374151',
                'intro' => "Your application process{$role} is now complete.",
                'body' => 'Thank you for being part of our recruitment process. You can view your application details anytime on your applications page.',
            ],
            default => [
                'label' => ucfirst($status),
                'subject' => 'An update on your application',
                'headline' => 'An update on your application',
                'color' => '#dc2626',
                'intro' => "There's an update on your application{$role}.",
                'body' => 'You can view the latest status on your applications page.',
            ],
        };
    }

    public function envelope(): Envelope
    {
        $subject = $this->copy['subject'].($this->jobTitle ? " ({$this->jobTitle})" : '');

        return new Envelope(subject: $subject);
    }

    public function content(): Content
    {
        return new Content(view: 'emails.application-status');
    }
}
