<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class JobSkillRequirement extends Model
{
    protected $table = 'job_skills_requirements';

    protected $primaryKey = 'record_id';

    // The table has no created_at / updated_at columns
    public $timestamps = false;

    protected $fillable = [
        'job_id',
        'skills',
    ];

    public function jobListing(): BelongsTo
    {
        return $this->belongsTo(JobListing::class, 'job_id', 'job_id');
    }
}
