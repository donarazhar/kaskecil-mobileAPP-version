<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AkunAAS extends Model
{
    use HasFactory;

    protected $table = 'akun_aas';

    protected $fillable = [
        'unit_id',
        'kode_akun',
        'nama_akun',
        'jenis',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function isDebet(): bool
    {
        return $this->jenis === 'debet';
    }

    public function isKredit(): bool
    {
        return $this->jenis === 'kredit';
    }

    public function unit()
    {
        return $this->belongsTo(Unit::class);
    }
}
