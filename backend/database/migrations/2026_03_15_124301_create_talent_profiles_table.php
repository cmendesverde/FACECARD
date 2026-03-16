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
        Schema::create('talent_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained()->cascadeOnDelete();
            $table->string('stage_name');
            $table->string('category');
            $table->string('city');
            $table->text('bio');
            $table->decimal('day_rate', 10, 2);
            $table->decimal('session_rate', 10, 2);
            $table->string('availability_text');
            $table->string('profile_image', 2048);
            $table->string('cover_image', 2048)->nullable();
            $table->boolean('is_featured')->default(false);
            $table->timestamps();

            $table->index(['category', 'city']);
            $table->index('is_featured');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('talent_profiles');
    }
};
