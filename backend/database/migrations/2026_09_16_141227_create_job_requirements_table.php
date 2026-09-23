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
        Schema::create('job_requirements', function (Blueprint $table) {
            $table->foreignId('job_id')->constrained('job_listing', 'job_id')->onDelete('cascade')->primary();
            $table->enum('highest_education', ['High School', 'Vocational', 'Associate', 'Bachelor', 'Master', 'Doctorate'])->nullable();
            $table->unsignedInteger('experience')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('job_requirements');
    }
};
