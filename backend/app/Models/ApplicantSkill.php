<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ApplicantSkill extends Model
{
    protected $table = 'applicant_skill';

    protected $primaryKey = 'record_id';

    public $timestamps = false;

    protected $fillable = [
        'applicant_id',
        'skill_name',
    ];

    public function account(): BelongsTo
    {
        return $this->belongsTo(ApplicantAccount::class, 'applicant_id', 'applicant_id');
    }
}
