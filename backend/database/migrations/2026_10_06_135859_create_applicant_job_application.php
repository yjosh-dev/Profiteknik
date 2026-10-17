<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('applicant_notification', function (Blueprint $table) {
            $table->integer('record_id')->primary();

            $table->unsignedInteger('applicant_id');

            $table->unsignedBigInteger('job_id')->nullable();

            $table->unsignedBigInteger('application_id')->nullable();

            $table->string('notification_title');
            $table->string('notification_body');

            $table->dateTime('date_created');

            $table->boolean('active')->default(true);

            $table->foreign('applicant_id')
                ->references('applicant_id')
                ->on('applicant_account')
                ->onDelete('cascade');

            $table->foreign('job_id')
                ->references('job_id')
                ->on('job_listing')
                ->nullOnDelete();

            $table->foreign('application_id')
                ->references('application_id')
                ->on('applicant_job_applications')
                ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('applicant_notification');
    }
};
