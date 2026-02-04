<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        // Add unit_id to akun_aas
        Schema::table('akun_aas', function (Blueprint $table) {
            $table->foreignId('unit_id')->nullable()->after('id')->constrained('unit')->cascadeOnDelete();

            // Drop unique on kode_akun alone, make it unique per unit
            $table->dropUnique(['kode_akun']);
            $table->unique(['unit_id', 'kode_akun']);
        });

        // Change cabang_id to unit_id on akun_matanggaran
        Schema::table('akun_matanggaran', function (Blueprint $table) {
            // Add unit_id column
            $table->foreignId('unit_id')->nullable()->after('id')->constrained('unit')->cascadeOnDelete();

            // Drop old unique constraint and create new one with unit_id
            $table->dropUnique(['cabang_id', 'kode_matanggaran', 'tahun_anggaran']);
            $table->dropIndex(['cabang_id']);
            $table->unique(['unit_id', 'kode_matanggaran', 'tahun_anggaran']);

            // Drop cabang_id foreign key and column
            $table->dropForeign(['cabang_id']);
            $table->dropColumn('cabang_id');
        });
    }

    public function down(): void
    {
        // Revert akun_matanggaran
        Schema::table('akun_matanggaran', function (Blueprint $table) {
            $table->foreignId('cabang_id')->nullable()->after('id')->constrained('cabang')->cascadeOnDelete();
            $table->dropUnique(['unit_id', 'kode_matanggaran', 'tahun_anggaran']);
            $table->dropForeign(['unit_id']);
            $table->dropColumn('unit_id');
            $table->unique(['cabang_id', 'kode_matanggaran', 'tahun_anggaran']);
            $table->index('cabang_id');
        });

        // Revert akun_aas
        Schema::table('akun_aas', function (Blueprint $table) {
            $table->dropUnique(['unit_id', 'kode_akun']);
            $table->dropForeign(['unit_id']);
            $table->dropColumn('unit_id');
            $table->unique(['kode_akun']);
        });
    }
};
