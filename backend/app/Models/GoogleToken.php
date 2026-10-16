<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class GoogleToken extends Model
{
    // employee_id holds the employee_account.employee_id
    protected $fillable = ['employee_id', 'access_token', 'refresh_token', 'expires_at'];

    protected $casts = [
        'access_token' => 'encrypted',
        'refresh_token' => 'encrypted',
        'expires_at' => 'datetime',
    ];
}
