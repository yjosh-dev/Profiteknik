<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EmployeeInformation extends Model
{
    protected $table ='employee_information';
    protected $primaryKey= 'employee_id';

    public $fillable = [
        "first_name",
        "middle_name",
        "last_name",
        "email",
        "suffix",
        "salutations",
        "sex",
        "profile_image"
    ];
}
