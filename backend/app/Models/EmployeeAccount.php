<?php

namespace App\Models;

use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use App\Models\EmployeeInformation;

class EmployeeAccount extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $table = 'employee_account';
    protected $primaryKey = 'employee_id';

    public $fillable = [
        "username",
        "password",
        "status",
        "last_login"
    ];

    protected $hidden="password";

    protected function casts(): array {
        return [
            'password' => 'hashed',
            'last_login' => 'datetime'
        ];
    }

    public function info() 
    {
      return $this->hasOne(EmployeeInformation::class, 'employee_id', 'employee_id');
    }
}
