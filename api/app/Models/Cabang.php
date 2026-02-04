<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Cabang extends Model
{
    use HasFactory;

    protected $table = 'cabang';

    protected $fillable = [
        'instansi_id',
        'kode_cabang',
        'nama_cabang',
        'alamat',
        'latitude',
        'longitude',
        'telepon',
        'email',
        'kepala_cabang',
        'nip_kepala',
        'plafon_kas',
        'is_active',
    ];

    protected $casts = [
        'plafon_kas' => 'decimal:2',
        'latitude' => 'float',
        'longitude' => 'float',
        'is_active' => 'boolean',
    ];

    public function instansi(): BelongsTo
    {
        return $this->belongsTo(Instansi::class);
    }

    public function unit(): HasMany
    {
        return $this->hasMany(Unit::class);
    }

    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }

    public function transaksi(): HasMany
    {
        return $this->hasMany(Transaksi::class);
    }

    public function mataAnggaran(): HasMany
    {
        return $this->hasMany(AkunMataAnggaran::class);
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
