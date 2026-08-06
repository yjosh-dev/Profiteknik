<?php

namespace App\Models;


use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;

class RootAccount extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $table = 'root_account';
    protected $primaryKey = 'id';

    protected $fillable = [
        'username',
        'password',
        'email',
        'first_name',
        'middle_name',
        'last_name',
        'last_login'
    ];

    protected $hidden = [
        'password'
    ];

    protected function casts(): array {
        return [
            'password' => 'hashed',
            'last_login' => 'datetime'
        ];
    }
}
