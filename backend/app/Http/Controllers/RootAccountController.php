<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Http\Requests\CreateRootRequest;
namespace App\Services\RootAccountService;

class RootAccountController extends Controller
{
    public function __construct(protected RootAccountService $rootService) {}

    public function createRoot(CreateRootRequest $data){
       try {

       }catch(Exception $e){
          return response()->json([
             'error'=>$e.getMessage(),
          ], 500);
       }
    }
}
