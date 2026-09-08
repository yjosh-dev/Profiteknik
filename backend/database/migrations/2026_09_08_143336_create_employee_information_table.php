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
        Schema::create('employee_information', function (Blueprint $table) {
            $table->foreignId('employee_id')->constrained('employee_account', 'employee_id')->onDelete('cascade');
            $table->string('first_name');
            $table->string('middle_name')->nullable();
            $table->string('last_name');
            $table->string('email')->unique();
            $table->enum('suffix', ["Jr", "Sr", "3rd", "None"]);
            $table->enum('salutations', ['Mr.', 'Ms.', 'Mrs.']);
            $table->enum('sex', ["Male", "Female"]);
            $table->string('profile_image')->default('profile.png')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('employee_information');
    }
};
