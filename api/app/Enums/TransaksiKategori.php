<?php

namespace App\Enums;

enum TransaksiKategori: string
{
    case PEMBENTUKAN = 'pembentukan';
    case PENGELUARAN = 'pengeluaran';
    case PENGISIAN = 'pengisian';

    public function label(): string
    {
        return match ($this) {
            self::PEMBENTUKAN => 'Pembentukan',
            self::PENGELUARAN => 'Pengeluaran',
            self::PENGISIAN => 'Pengisian Kembali',
        };
    }

    public function color(): string
    {
        return match ($this) {
            self::PEMBENTUKAN => '#10B981',
            self::PENGELUARAN => '#EF4444',
            self::PENGISIAN => '#3B82F6',
        };
    }

    public function isDebit(): bool
    {
        return $this === self::PEMBENTUKAN || $this === self::PENGISIAN;
    }

    public function isCredit(): bool
    {
        return $this === self::PENGELUARAN;
    }
}
