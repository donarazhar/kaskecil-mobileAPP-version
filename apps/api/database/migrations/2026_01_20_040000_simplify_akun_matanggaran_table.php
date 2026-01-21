<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        // Drop and recreate akun_matanggaran table with simplified schema
        Schema::dropIfExists('akun_matanggaran');

        Schema::create('akun_matanggaran', function (Blueprint $table) {
            $table->smallIncrements('id');
            $table->string('kode_matanggaran', 25)->nullable();
            $table->unsignedBigInteger('akun_aas_id')->nullable();
            $table->integer('saldo')->nullable()->default(0);

            // Add foreign key constraint to akun_aas using id
            $table->foreign('akun_aas_id')
                ->references('id')
                ->on('akun_aas')
                ->onDelete('cascade');

            // Add unique constraint
            $table->unique(['kode_matanggaran', 'akun_aas_id']);

            // Add index for better query performance
            $table->index('akun_aas_id');
        });
    }

    public function down(): void
    {
        // Revert to previous schema
        Schema::dropIfExists('akun_matanggaran');

        Schema::create('akun_matanggaran', function (Blueprint $table) {
            $table->id();
            $table->foreignId('unit_id')->nullable()->constrained('unit')->cascadeOnDelete();
            $table->string('kode_matanggaran', 20);
            $table->string('nama_matanggaran');
            $table->decimal('pagu', 15, 2)->default(0);
            $table->decimal('saldo', 15, 2)->default(0);
            $table->integer('tahun_anggaran');
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->unique(['unit_id', 'kode_matanggaran', 'tahun_anggaran']);
        });
    }
};
