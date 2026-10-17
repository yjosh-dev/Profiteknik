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
        Schema::create('applicant_job_applications', function (Blueprint $table) {
            $table->id('application_id');
            $table->unsignedInteger('applicant_id');   
            $table->unsignedBigInteger('job_id');         

            $table->foreign('applicant_id')
                  ->references('applicant_id')
                  ->on('applicant_account')
                  ->onDelete('cascade');

            $table->foreign('job_id')
                  ->references('job_id')
                  ->on('job_listing')
                  ->onDelete('cascade');

            $table->string('status')->default('pending');
            $table->date('date_applied');
            $table->unique(['applicant_id', 'job_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('applicant_job_applications');
    }
};
