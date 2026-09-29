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
        Schema::create('applicant_contact', function (Blueprint $table) {
            $table->unsignedInteger('applicant_id')->primary();

            $table->string('email')->nullable();
            $table->string('phone_no')->nullable();
            $table->string('tel_no')->nullable();

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
        Schema::dropIfExists('applicant_contact_info');
    }
};
