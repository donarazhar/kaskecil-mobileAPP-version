<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('unit', function (Blueprint $table) {
            $table->id();
            $table->foreignId('cabang_id')->constrained('cabang')->cascadeOnDelete();
            $table->string('kode_unit', 20);
            $table->string('nama_unit');
            $table->string('kepala_unit')->nullable();
            $table->string('nip_kepala', 50)->nullable();
            $table->decimal('plafon_kas', 15, 2)->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->unique(['cabang_id', 'kode_unit']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('unit');
    }
};
