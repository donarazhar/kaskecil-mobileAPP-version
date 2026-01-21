<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Unit extends Model
{
    use HasFactory;

    protected $table = 'unit';

    protected $fillable = [
        'cabang_id',
        'kode_unit',
        'nama_unit',
        'kepala_unit',
        'nip_kepala',
        'plafon_kas',
        'is_active',
    ];

    protected $casts = [
        'plafon_kas' => 'decimal:2',
        'is_active' => 'boolean',
    ];

    public function cabang(): BelongsTo
    {
        return $this->belongsTo(Cabang::class);
    }

    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }

    public function transaksi(): HasMany
    {
        return $this->hasMany(Transaksi::class);
    }

    public function transaksiShadow(): HasMany
    {
        return $this->hasMany(TransaksiShadow::class);
    }

    public function getSaldoAttribute(): float
    {
        $pembentukan = $this->transaksi()->where('kategori', 'pembentukan')->sum('jumlah');
        $pengisian = $this->transaksi()->where('kategori', 'pengisian')->sum('jumlah');
        $pengeluaran = $this->transaksi()->where('kategori', 'pengeluaran')->sum('jumlah');

        return $pembentukan + $pengisian - $pengeluaran;
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
