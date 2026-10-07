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
        Schema::create('job_screening_answers', function (Blueprint $table) {
            $table->id('record_integer');
            $table->foreignId('application_id')->constrained('applicant_job_applications', 'application_id')->cascadeOnDelete();
            $table->string('screening_question');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('applicant_screening_answers');
    }
};
