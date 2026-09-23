<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class JobRequirements extends Model
{
    protected $table = 'job_requirements';

    // Primary key configuration
    protected $primaryKey = 'job_id';

    public $incrementing = false;

    public $timestamps = false;

    // Mass-assignable attributes matching your schema
    protected $fillable = [
        'job_id',
        'highest_education',
        'experience',
    ];

    /**
     * Relationship to the JobListing model.
     */
    public function joblisting(): BelongsTo
    {
        return $this->belongsTo(JobListing::class, 'job_id', 'job_id');
    }
}
