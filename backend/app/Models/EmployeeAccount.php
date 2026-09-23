<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class EmployeeAccount extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $table = 'employee_account';

    protected $primaryKey = 'employee_id';

    public $fillable = [
        'username',
        'password',
        'status',
        'last_login',
    ];

    protected $hidden = ['password'];

    protected function casts(): array
    {
        return [
            'password' => 'hashed',
            'last_login' => 'datetime',
        ];
    }

    public function info()
    {
        return $this->hasOne(EmployeeInformation::class, 'employee_id', 'employee_id');
    }
}
