<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('transaksi_shadow', function (Blueprint $table) {
            $table->id();
            $table->foreignId('cabang_id')->constrained('cabang')->cascadeOnDelete();
            $table->foreignId('unit_id')->nullable()->constrained('unit')->nullOnDelete();
            $table->date('tanggal');
            $table->string('no_bukti', 50)->nullable();
            $table->text('keterangan');
            $table->string('kategori', 20)->default('pengeluaran');
            $table->decimal('jumlah', 15, 2);
            $table->string('kode_matanggaran', 20)->nullable();
            $table->string('lampiran')->nullable();
            $table->string('lampiran2')->nullable();
            $table->string('lampiran3')->nullable();
            $table->enum('status', ['draft', 'pending', 'approved', 'rejected'])->default('draft');
            $table->text('catatan_approval')->nullable();
            $table->foreignId('user_id')->nullable()->constrained('users');
            $table->foreignId('approved_by')->nullable()->constrained('users');
            $table->timestamp('approved_at')->nullable();
            $table->timestamps();

            $table->index('cabang_id');
            $table->index('status');
            $table->index('user_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('transaksi_shadow');
    }
};
