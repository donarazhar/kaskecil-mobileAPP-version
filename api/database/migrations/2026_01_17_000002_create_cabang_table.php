<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('cabang', function (Blueprint $table) {
            $table->id();
            $table->foreignId('instansi_id')->constrained('instansi')->cascadeOnDelete();
            $table->string('kode_cabang', 20)->unique();
            $table->string('nama_cabang');
            $table->text('alamat')->nullable();
            $table->string('telepon', 20)->nullable();
            $table->string('email')->nullable();
            $table->string('kepala_cabang')->nullable();
            $table->string('nip_kepala', 50)->nullable();
            $table->decimal('plafon_kas', 15, 2)->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cabang');
    }
};
