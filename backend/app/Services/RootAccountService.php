<?php

namespace App\Services;

use App\Models\RootAccount;
use Exception;

class RootAccountService {
   
     public function createRoot(array $data): RootAccount {
        
         $create = RootAccount::create($data);

         if (!$create) {
            throw new Exception('Failed to create account! Please try again.');
         }

         return $create;
     }

     public function deleteRoot(int $data) {

        $delete = RootAccount::findOrFail($data);
                            
        $delete->delete();

         if (!$delete) {
            throw new Exception('Failed to delete account! Please try again.');
         }

         return $delete;
     }
}

