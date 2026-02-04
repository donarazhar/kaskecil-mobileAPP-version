<?php

namespace App\Enums;

enum DraftStatus: string
{
    case DRAFT = 'draft';
    case PENDING = 'pending';
    case APPROVED = 'approved';
    case REJECTED = 'rejected';

    public function label(): string
    {
        return match ($this) {
            self::DRAFT => 'Draft',
            self::PENDING => 'Menunggu Persetujuan',
            self::APPROVED => 'Disetujui',
            self::REJECTED => 'Ditolak',
        };
    }

    public function color(): string
    {
        return match ($this) {
            self::DRAFT => '#6B7280',
            self::PENDING => '#F59E0B',
            self::APPROVED => '#10B981',
            self::REJECTED => '#EF4444',
        };
    }

    public function canEdit(): bool
    {
        return $this === self::DRAFT || $this === self::REJECTED;
    }

    public function canSubmit(): bool
    {
        return $this === self::DRAFT || $this === self::REJECTED;
    }

    public function canApprove(): bool
    {
        return $this === self::PENDING;
    }
}
