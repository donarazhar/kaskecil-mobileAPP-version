<?php

namespace App\Enums;

enum UserRole: string
{
    case SUPER_ADMIN = 'super_admin';
    case ADMIN_CABANG = 'admin_cabang';
    case ADMIN_UNIT = 'admin_unit';
    case PETUGAS = 'petugas';

    public function label(): string
    {
        return match ($this) {
            self::SUPER_ADMIN => 'Super Admin',
            self::ADMIN_CABANG => 'Admin Cabang',
            self::ADMIN_UNIT => 'Admin Unit',
            self::PETUGAS => 'Petugas',
        };
    }

    public function level(): int
    {
        return match ($this) {
            self::SUPER_ADMIN => 4,
            self::ADMIN_CABANG => 3,
            self::ADMIN_UNIT => 2,
            self::PETUGAS => 1,
        };
    }

    public static function fromName(string $name): ?self
    {
        return match ($name) {
            'super_admin' => self::SUPER_ADMIN,
            'admin_cabang' => self::ADMIN_CABANG,
            'admin_unit' => self::ADMIN_UNIT,
            'petugas' => self::PETUGAS,
            default => null,
        };
    }
}
