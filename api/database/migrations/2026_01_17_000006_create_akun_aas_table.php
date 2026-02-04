<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('akun_aas', function (Blueprint $table) {
            $table->id();
            $table->string('kode_akun', 20)->unique();
            $table->string('nama_akun');
            $table->enum('jenis', ['debet', 'kredit']);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('akun_aas');
    }
};
