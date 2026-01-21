<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('akun_matanggaran', function (Blueprint $table) {
            $table->id();
            $table->foreignId('cabang_id')->constrained('cabang')->cascadeOnDelete();
            $table->string('kode_matanggaran', 20);
            $table->string('nama_matanggaran');
            $table->decimal('pagu', 15, 2)->default(0);
            $table->decimal('saldo', 15, 2)->default(0);
            $table->integer('tahun_anggaran');
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->unique(['cabang_id', 'kode_matanggaran', 'tahun_anggaran']);
            $table->index('cabang_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('akun_matanggaran');
    }
};
