<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class ApplicantJobApplication extends Model
{
    protected $table = 'applicant_job_applications';
    public $timestamps = false;
    protected $primaryKey = 'application_id';

    protected $fillable = [
        'applicant_id',
        'job_id',
        'status',
        'date_applied',
    ];

    protected $casts = [
        'date_applied' => 'date',
    ];

    public function applicant(): BelongsTo
    {
        return $this->belongsTo(ApplicantAccount::class, 'applicant_id', 'applicant_id');
    }

    public function jobListing(): BelongsTo
    {
        return $this->belongsTo(JobListing::class, 'job_id', 'job_id');
    }

    public function screeningAnswers(): HasMany
    {
        return $this->hasMany(JobScreeningAnswers::class, 'application_id', 'application_id');
    }

    public function information(): HasOne
    {
        return $this->hasOne(ApplicantInformation::class, 'applicant_id', 'applicant_id');
    }

    public function contact(): HasOne
    {
        return $this->hasOne(ApplicantContact::class, 'applicant_id', 'applicant_id');
    }
}