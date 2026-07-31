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

     public function DeleteRoot(array $data): RootAccount {

     }
}

