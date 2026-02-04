<?php

namespace App\Models;

use App\Enums\TransaksiKategori;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Transaksi extends Model
{
    use HasFactory;

    protected $table = 'transaksi';

    protected $fillable = [
        'cabang_id',
        'unit_id',
        'tanggal',
        'no_bukti',
        'keterangan',
        'kategori',
        'jumlah',
        'kode_matanggaran',
        'lampiran',
        'lampiran2',
        'lampiran3',
        'id_pengisian',
        'user_id',
    ];

    protected $casts = [
        'tanggal' => 'date',
        'jumlah' => 'decimal:2',
        'kategori' => TransaksiKategori::class,
    ];

    public function cabang(): BelongsTo
    {
        return $this->belongsTo(Cabang::class);
    }

    public function unit(): BelongsTo
    {
        return $this->belongsTo(Unit::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function mataAnggaran(): BelongsTo
    {
        return $this->belongsTo(AkunMataAnggaran::class, 'kode_matanggaran', 'kode_matanggaran');
    }

    public function pengisian(): BelongsTo
    {
        return $this->belongsTo(Transaksi::class, 'id_pengisian');
    }

    public function transaksiDiisi(): HasMany
    {
        return $this->hasMany(Transaksi::class, 'id_pengisian');
    }

    public function scopePembentukan($query)
    {
        return $query->where('kategori', TransaksiKategori::PEMBENTUKAN);
    }

    public function scopePengeluaran($query)
    {
        return $query->where('kategori', TransaksiKategori::PENGELUARAN);
    }

    public function scopePengisian($query)
    {
        return $query->where('kategori', TransaksiKategori::PENGISIAN);
    }

    public function scopeBelumDiisi($query)
    {
        return $query->where('kategori', TransaksiKategori::PENGELUARAN)
            ->whereNull('id_pengisian');
    }

    public function scopeForCabang($query, int $cabangId)
    {
        return $query->where('cabang_id', $cabangId);
    }

    public function scopeForUnit($query, int $unitId)
    {
        return $query->where('unit_id', $unitId);
    }

    public function scopeDateRange($query, ?string $from = null, ?string $to = null)
    {
        if ($from) {
            $query->whereDate('tanggal', '>=', $from);
        }
        if ($to) {
            $query->whereDate('tanggal', '<=', $to);
        }
        return $query;
    }

    public function getLampiranUrlsAttribute(): array
    {
        $urls = [];
        if ($this->lampiran) {
            $urls[] = asset('storage/' . $this->lampiran);
        }
        if ($this->lampiran2) {
            $urls[] = asset('storage/' . $this->lampiran2);
        }
        if ($this->lampiran3) {
            $urls[] = asset('storage/' . $this->lampiran3);
        }
        return $urls;
    }
}
