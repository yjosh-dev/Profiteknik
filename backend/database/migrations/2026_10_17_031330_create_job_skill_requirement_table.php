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
        Schema::create('job_skills_requirements', function (Blueprint $table) {
            $table->id('record_id');

            // References job_listing.job_id. If job_listing.job_id is NOT an
            // unsigned big integer (e.g. it's a plain integer), change this to
            // $table->unsignedInteger('job_id') and add the foreign key manually.
            $table->foreignId('job_id')
                ->constrained('job_listing', 'job_id')
                ->cascadeOnDelete();

            $table->string('skills');

            // Same skill can't be listed twice for one job
            $table->unique(['job_id', 'skills']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('job_skill_requirement');
    }
};
