<?php

namespace App\Http\Controllers;

use Exception;
use Illuminate\Http\Request;
use App\Services\RootAccountService;
use App\Http\Requests\CreateRootRequest;
use Illuminate\Database\Eloquent\ModelNotFoundException;

class RootAccountController extends Controller
{
    public function  __construct(
        protected RootAccountService $rootAccountService
    ) {}

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(CreateRootRequest $request)
    {
        try {

           $create = $this->rootAccountService->createRoot($request->validated());

           return response()->json([
               'success' => true,
               'message' => "Account has been created",
               'data' => $create
           ], 200);

        }catch(Exception $e){

           return response()->json([
               'success' => false,
               'message' => $e->getMessage(),
           ], 500);
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
           $delete = $this->rootAccountService->deleteRoot($id);
           return response()->json([
               'success' => true,
               'message' => "Account has been deleted",
               'data' => $delete
           ], 200);
        }catch(ModelNotFoundException $e){
           return response()->json([
               'success' => false,
               'message' => "Root account ID does not exist.",
           ], 404);
        }catch(\Throwable $e){
           return response()->json([
               'success' => false,
               'message' => $e->getMessage(),
           ], 500);
        }
    }
}
