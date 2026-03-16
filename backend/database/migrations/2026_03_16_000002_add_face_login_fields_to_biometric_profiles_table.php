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
        Schema::table('biometric_profiles', function (Blueprint $table) {
            $table->text('reference_image')->nullable()->after('face_reference');
            $table->json('face_descriptor')->nullable()->after('reference_image');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('biometric_profiles', function (Blueprint $table) {
            $table->dropColumn(['reference_image', 'face_descriptor']);
        });
    }
};
