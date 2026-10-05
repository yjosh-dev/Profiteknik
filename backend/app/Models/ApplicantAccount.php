<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;

class ApplicantAccount extends Authenticatable
{
    use HasApiTokens;

    protected $table = 'applicant_account';

    protected $primaryKey = 'applicant_id';

    protected $fillable = [
        'username',
        'password',
        'isNew',
        'last_login',
        'status',
    ];

    protected $hidden = ['password'];

    protected $casts = [
        'password' => 'hashed',
        'last_login' => 'datetime',
    ];

    public function information(): HasOne
    {
        return $this->hasOne(ApplicantInformation::class, 'applicant_id', 'applicant_id');
    }

    public function contact(): HasOne
    {
        return $this->hasOne(ApplicantContact::class, 'applicant_id', 'applicant_id');
    }

    public function experiences(): HasMany
    {
        return $this->hasMany(ApplicantEmploymentHistory::class, 'applicant_id', 'applicant_id');
    }

    public function skills(): HasMany
    {
        return $this->hasMany(ApplicantSkill::class, 'applicant_id', 'applicant_id');
    }
}
