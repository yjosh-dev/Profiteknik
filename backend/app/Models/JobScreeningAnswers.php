<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class JobScreeningAnswers extends Model
{
    protected $table = 'job_screening_answers';

    protected $primaryKey = 'record_integer';

    public $timestamps = false;

    protected $fillable = [
        'application_id',
        'screening_question',
    ];

    public function jobApplication(): BelongsTo
    {
        return $this->belongsTo(ApplicantJobApplication::class, 'application_id', 'application_id');
    }
}