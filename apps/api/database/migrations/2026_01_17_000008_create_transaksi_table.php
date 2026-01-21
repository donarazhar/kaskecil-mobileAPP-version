<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('transaksi', function (Blueprint $table) {
            $table->id();
            $table->foreignId('cabang_id')->constrained('cabang')->cascadeOnDelete();
            $table->foreignId('unit_id')->nullable()->constrained('unit')->nullOnDelete();
            $table->date('tanggal');
            $table->string('no_bukti', 50)->nullable();
            $table->text('keterangan');
            $table->enum('kategori', ['pembentukan', 'pengeluaran', 'pengisian']);
            $table->decimal('jumlah', 15, 2);
            $table->string('kode_matanggaran', 20)->nullable();
            $table->string('lampiran')->nullable();
            $table->string('lampiran2')->nullable();
            $table->string('lampiran3')->nullable();
            $table->foreignId('id_pengisian')->nullable()->constrained('transaksi');
            $table->foreignId('user_id')->nullable()->constrained('users');
            $table->timestamps();

            $table->index('cabang_id');
            $table->index('unit_id');
            $table->index('tanggal');
            $table->index('kategori');
            $table->index('id_pengisian');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('transaksi');
    }
};
