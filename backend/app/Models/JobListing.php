<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\HasMany;

use App\Models\EmployeeAccount;
use App\Models\JobRequirements;
use App\Models\JobScreeningQuestions;

class JobListing extends Model
{
    protected $table = 'job_listing';
    protected $primaryKey = 'job_id';

    const CREATED_AT = null;
    const UPDATED_AT = 'updated_at';

    protected $fillable = [
        'job_title',
        'job_description',
        'minimum_salary',
        'maximum_salary',
        'vacant_position',
        'employment_type',
        'posted_at',
        'posted_until',
        'listed_by',
    ];

    protected $casts = [
        'posted_at' => 'datetime',
        'posted_until' => 'date',
        'minimum_salary' => 'integer',
        'maximum_salary' => 'integer',
        'vacant_position' => 'integer',
    ];

    /**
     * The employee who posted this job listing.
     */
    public function listedBy(): BelongsTo
    {
        return $this->belongsTo(EmployeeAccount::class, 'listed_by', 'employee_id');
    }

    public function requirements(): HasOne
    {
        return $this->hasOne(JobRequirements::class, 'job_id', 'job_id');
    }

     public function screeningQuestions(): HasMany
    {
        return $this->hasMany(JobScreeningQuestions::class, 'job_id', 'job_id');
    }

}