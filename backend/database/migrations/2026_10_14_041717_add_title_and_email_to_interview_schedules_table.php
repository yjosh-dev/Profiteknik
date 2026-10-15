<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Safe to re-run: only adds what is missing
        Schema::table('interview_schedules', function (Blueprint $table) {
            if (!Schema::hasColumn('interview_schedules', 'title')) {
                $table->string('title')->nullable()->after('scheduled_by');
            }
            if (!Schema::hasColumn('interview_schedules', 'applicant_email')) {
                $table->string('applicant_email')->nullable()->after('title');
            }
        });

        $hasUnique = DB::selectOne(
            "SELECT COUNT(*) AS c FROM information_schema.statistics
             WHERE table_schema = DATABASE()
               AND table_name = 'interview_schedules'
               AND index_name = 'interview_schedules_application_id_unique'"
        )->c > 0;

        if (!$hasUnique) {
            Schema::table('interview_schedules', function (Blueprint $table) {
                $table->unique('application_id');
            });
        }
    }

    public function down(): void
    {
        Schema::table('interview_schedules', function (Blueprint $table) {
            $table->dropUnique(['application_id']);
            $table->dropColumn(['title', 'applicant_email']);
        });
    }
};