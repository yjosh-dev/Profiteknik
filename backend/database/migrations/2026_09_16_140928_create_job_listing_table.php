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
        Schema::create('job_listing', function (Blueprint $table) {
            $table->id('job_id');
            $table->string('job_title');
            $table->text('job_description');
            $table->unsignedInteger('minimum_salary');
            $table->unsignedInteger('maximum_salary');
            $table->unsignedInteger('vacant_position');
            $table->enum('employment_type', ['Full-time', 'Part-time', 'Contract', 'Internship', 'Temporary']);
            $table->timestamp('posted_at')->useCurrent();
            $table->date('posted_until')->nullable();
            $table->foreignId('listed_by')->constrained('employee_account', 'employee_id')->onDelete('cascade');
            $table->timestamp('updated_at')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('job_listing');
    }
};
