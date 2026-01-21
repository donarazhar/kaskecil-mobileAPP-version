<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AkunMataAnggaran extends Model
{
    use HasFactory;

    protected $table = 'akun_matanggaran';

    // Disable timestamps since new schema doesn't have them
    public $timestamps = false;

    // Use smallIncrements as per migration
    protected $primaryKey = 'id';
    public $incrementing = true;

    protected $fillable = [
        'kode_matanggaran',
        'akun_aas_id',
        'saldo',
    ];

    protected $casts = [
        'saldo' => 'integer',
    ];

    /**
     * Get the Akun AAS that owns this Mata Anggaran
     */
    public function akunAas(): BelongsTo
    {
        return $this->belongsTo(AkunAAS::class, 'akun_aas_id', 'id');
    }

    /**
     * Get computed nama_matanggaran from Akun AAS
     */
    public function getNamaMatanggaranAttribute(): string
    {
        if ($this->akunAas) {
            return "[{$this->akunAas->kode_akun}] {$this->akunAas->nama_akun}";
        }
        return '';
    }

    /**
     * Get unit through Akun AAS relationship
     */
    public function getUnitAttribute()
    {
        return $this->akunAas?->unit;
    }
}
