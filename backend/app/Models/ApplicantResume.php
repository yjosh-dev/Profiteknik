<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ApplicantResume extends Model
{
    // Explicitly declare table name since it differs from default pluralization (applicant_resumes)
    protected $table = 'applicant_resume';

    // Primary key override
    protected $primaryKey = 'record_id';

    // Disable default timestamps if you are relying strictly on date_uploaded
    // public $timestamps = false;

    protected $fillable = [
        'applicant_id',
        'resume',
        'date_uploaded',
    ];

    /**
     * Cast date attributes to Carbon instances automatically
     */
    protected $casts = [
        'date_uploaded' => 'datetime',
    ];

    /**
     * Relationship: Resume belongs to an Applicant Account
     */
    public function applicantAccount(): BelongsTo
    {
        return $this->belongsTo(ApplicantAccount::class, 'applicant_id', 'applicant_id');
    }
}
