<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ApplicantEmploymentHistory extends Model
{
    protected $table = 'applicant_employment_history';

    protected $primaryKey = 'record_id';

    public $timestamps = false;

    protected $fillable = [
        'applicant_id',
        'company_name',
        'position',
        'start_date',
        'end_date',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
    ];

    public function account(): BelongsTo
    {
        return $this->belongsTo(ApplicantAccount::class, 'applicant_id', 'applicant_id');
    }
}
