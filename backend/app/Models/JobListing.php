<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class JobListing extends Model
{
    /**
     * The primary key associated with the table.
     */
    protected $primaryKey = 'job_id';

    /**
     * Disable the default created_at timestamp,
     * since this table uses posted_at instead.
     */
    const CREATED_AT = null;
    const UPDATED_AT = 'updated_at';

    /**
     * The attributes that are mass assignable.
     */
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

    /**
     * The attributes that should be cast.
     */
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
}
