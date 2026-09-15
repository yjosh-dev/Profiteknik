<?php
namespace App\Services\Root;

use Carbon\Carbon;
use App\Models\EmployeeAccount;
use App\Models\EmployeeInformation;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Intervention\Image\Laravel\Facades\Image;
use Illuminate\Support\Str;

class EmployeeService
{

   public function storeEmployeeAccount(array $data)
   {
      return DB::transaction(function () use($data) {
        $now = Carbon::now();

        $employeeId = DB::table('employee_account')->insertGetId([
                'username'   => $data['username'],
                'password'   => Hash::make($data['password']), // Hash raw password manually
                'status'     => $data['status'] ?? 'active',
                'created_at' => $now,
                'updated_at' => $now,
            ]);

        $infoData = [
                'employee_id'   => $employeeId,
                'first_name'    => $data['first_name'],
                'middle_name'   => $data['middle_name'] ?? null,
                'last_name'     => $data['last_name'],
                "email"         => $data['email'],
                'suffix'        => "Jr",
                'salutations'   => $data['salutations'] ?? null,
                'sex'           => $data['sex'],
                'profile_image' => $data['profile_image'] ?? null,
                'created_at'    => $now,
                'updated_at'    => $now,
            ];

        $imagePath = null;
        if (isset($data['profile_image']) && $data['profile_image'] instanceof \Illuminate\Http\UploadedFile) {

            // Returns string e.g. "profile_images/a1b2c3d4.jpg"
            $imagePath = $data['profile_image']->store('profile_images', 'public'); 
        } 
        $infoData['profile_image'] = $imagePath; 
        DB::table('employee_information')->insert($infoData);

        return [
                'account'     => DB::table('employee_account')->where('employee_id', $employeeId)->first(),
                'information' => DB::table('employee_information')->where('employee_id', $employeeId)->first(),
            ];
      });
   }
   
   public function deleteEmployee(string $data)
   {
      return DB::transaction(function () use($data) {
           $user = EmployeeAccount::where('employee_id', $data)
                                  ->first();
           if ($user) {
             return $user->delete(); 
            }
      });
   }
}

?>