<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('applicant_information', function (Blueprint $table) {
            $table->unsignedInteger('applicant_id')->primary();

            $table->string('first_name')->nullable();
            $table->string('middle_name')->nullable();
            $table->string('last_name')->nullable();
            $table->enum('suffix', ['Jr.', 'Sr.', 'II', 'III', 'IV'])->nullable();

            $table->string('applicant_profile_picture')->default('default.png')->nullable();

            $table->string('building_no')->nullable();
            $table->string('house_no')->nullable();
            $table->string('street')->nullable();
            $table->string('city')->nullable();
            $table->string('region')->nullable();
            $table->string('country')->nullable();

            $table->foreign('applicant_id')
                ->references('applicant_id')
                ->on('applicant_account')
                ->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('applicant_information');
    }
};
