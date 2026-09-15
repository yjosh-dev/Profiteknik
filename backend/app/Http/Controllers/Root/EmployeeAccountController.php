<?php

namespace App\Http\Controllers\Root;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Http\Requests\Root\CreateEmployeeRequest;
use App\Services\Root\EmployeeService;
use App\Models\EmployeeAccount;
use Illuminate\Support\Facades\DB;

class EmployeeAccountController extends Controller
{
    public function  __construct(
        protected EmployeeService $EmployeeService
    ) {}

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
      return DB::table('employee_account')
               ->join('employee_information', 'employee_account.employee_id', '=', 'employee_information.employee_id')
               ->select('*')
               ->latest('employee_account.created_at')
               ->paginate(6);
      }

    /**
     * Store a newly created resource in storage.
     */
    public function store(CreateEmployeeRequest $request)
    {
       try {
          $store = $this->EmployeeService->storeEmployeeAccount($request->validated());
          return response()->json([
            "success" => "true",
            "message" => "Employee account successfully created.",
            "data" => $store
          ], 201);
       }catch(Exception $e){
           return response()->json([
            "success" => "false",
            "message" => "An error has occured. " . $e->getMessage(),
          ], 400);
       }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        try {
            $delete = $this->EmployeeService->deleteEmployee($id);
            return response()->json([
            "success" => "true",
            "message" => "Employee account successfully delete.",
            "data" => $delete
          ], 201);
       }catch(Exception $e){
           return response()->json([
            "success" => "false",
            "message" => "An error has occured. " . $e->getMessage(),
          ], 400);
       }
    }
}
