<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ApplicantNotification extends Model
{
    protected $table = 'applicant_notification';

    protected $primaryKey = 'record_id';

    public $timestamps = false;

    protected $fillable = [
        'applicant_id',
        'job_id',
        'application_id',
        'notification_title',
        'notification_body',
        'date_created',
        'active',
    ];

    protected $casts = [
        'date_created' => 'datetime',
        'active' => 'boolean',
    ];

    public function applicant(): BelongsTo
    {
        return $this->belongsTo(
            ApplicantAccount::class,
            'applicant_id',
            'applicant_id'
        );
    }

    public function job(): BelongsTo
    {
        return $this->belongsTo(
            JobListing::class,
            'job_id',
            'job_id'
        );
    }

    public function application(): BelongsTo
    {
        return $this->belongsTo(
            ApplicantJobApplication::class,
            'application_id',
            'application_id'
        );
    }
}
