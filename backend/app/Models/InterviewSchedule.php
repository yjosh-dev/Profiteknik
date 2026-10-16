<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class InterviewSchedule extends Model
{
    // scheduled_by holds the employee_account.employee_id
    protected $fillable = [
        'application_id',
        'scheduled_by',
        'title',
        'applicant_email',
        'starts_at',
        'ends_at',
        'google_event_id',
        'meet_link',
    ];

    protected $casts = [
        'scheduled_by' => 'integer',
        'starts_at' => 'datetime',
        'ends_at' => 'datetime',
    ];

    public function application(): BelongsTo
    {
        return $this->belongsTo(ApplicantJobApplication::class, 'application_id');
    }
}
