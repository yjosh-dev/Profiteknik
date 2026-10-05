<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ApplicantInformation extends Model
{
    protected $table = 'applicant_information';

    protected $primaryKey = 'applicant_id';

    public $incrementing = false;

    public $timestamps = false;

    protected $fillable = [
        'applicant_id',
        'first_name',
        'middle_name',
        'last_name',
        'suffix',
        'applicant_profile_picture',
        'building_no',
        'house_no',
        'street',
        'city',
        'region',
        'country',
    ];

    public function account(): BelongsTo
    {
        return $this->belongsTo(ApplicantAccount::class, 'applicant_id', 'applicant_id');
    }
}
