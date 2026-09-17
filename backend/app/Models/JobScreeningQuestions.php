<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Models\JobListing;

class JobScreeningQuestions extends Model
{
     /**
     * The primary key associated with the table.
     */
    protected $primaryKey = 'question_id';

    /**
     * No timestamps columns defined in the DBML — disable.
     */
    public $timestamps = false;

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'job_id',
        'screening_question',
    ];

    /**
     * The job listing this screening question belongs to.
     */
    function joblisting(): BelongsTo
    {
         return $this->belongsTo(JobListing::class, 'job_id', 'job_id');
    }
}
