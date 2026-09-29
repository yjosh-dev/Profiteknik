<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ApplicantContact extends Model
{
    protected $table = 'applicant_contact';

    protected $primaryKey = 'applicant_id';

    public $incrementing = false;

    public $timestamps = false;

    protected $fillable = [
        'applicant_id',
        'email',
        'phone_no',
        'tel_no',
    ];

    public function account(): BelongsTo
    {
        return $this->belongsTo(ApplicantAccount::class, 'applicant_id', 'applicant_id');
    }
}
