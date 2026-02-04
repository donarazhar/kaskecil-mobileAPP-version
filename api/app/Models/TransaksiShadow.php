<?php

namespace App\Models;

use App\Enums\DraftStatus;
use App\Enums\TransaksiKategori;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TransaksiShadow extends Model
{
    use HasFactory;

    protected $table = 'transaksi_shadow';

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
        'status',
        'catatan_approval',
        'user_id',
        'approved_by',
        'approved_at',
    ];

    protected $casts = [
        'tanggal' => 'date',
        'jumlah' => 'decimal:2',
        'status' => DraftStatus::class,
        'kategori' => TransaksiKategori::class,
        'approved_at' => 'datetime',
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

    public function approver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function mataAnggaran(): BelongsTo
    {
        return $this->belongsTo(AkunMataAnggaran::class, 'kode_matanggaran', 'kode_matanggaran');
    }

    public function scopeDraft($query)
    {
        return $query->where('status', DraftStatus::DRAFT);
    }

    public function scopePending($query)
    {
        return $query->where('status', DraftStatus::PENDING);
    }

    public function scopeApproved($query)
    {
        return $query->where('status', DraftStatus::APPROVED);
    }

    public function scopeRejected($query)
    {
        return $query->where('status', DraftStatus::REJECTED);
    }

    public function scopeForCabang($query, int $cabangId)
    {
        return $query->where('cabang_id', $cabangId);
    }

    public function scopeForUnit($query, int $unitId)
    {
        return $query->where('unit_id', $unitId);
    }

    public function canEdit(): bool
    {
        return $this->status->canEdit();
    }

    public function canSubmit(): bool
    {
        return $this->status->canSubmit();
    }

    public function canApprove(): bool
    {
        return $this->status->canApprove();
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
