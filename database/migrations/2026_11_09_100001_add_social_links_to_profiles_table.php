<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('profiles', function (Blueprint $table) {
            $table->string('whatsapp')->nullable()->after('linkedin');
            $table->string('instagram')->nullable()->after('whatsapp');
            $table->string('tiktok')->nullable()->after('instagram');
        });
    }

    public function down(): void
    {
        Schema::table('profiles', function (Blueprint $table) {
            $table->dropColumn(['whatsapp', 'instagram', 'tiktok']);
        });
    }
};