<?php

namespace App\Models;

use App\Enums\UserRole;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'nama',
        'email',
        'password',
        'role_id',
        'cabang_id',
        'unit_id',
        'foto',
        'telepon',
        'is_active',
        'fcm_token',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'last_login_at' => 'datetime',
            'password' => 'hashed',
            'is_active' => 'boolean',
        ];
    }

    public function role(): BelongsTo
    {
        return $this->belongsTo(Role::class);
    }

    public function cabang(): BelongsTo
    {
        return $this->belongsTo(Cabang::class);
    }

    public function unit(): BelongsTo
    {
        return $this->belongsTo(Unit::class);
    }

    public function transaksi(): HasMany
    {
        return $this->hasMany(Transaksi::class);
    }

    public function drafts(): HasMany
    {
        return $this->hasMany(TransaksiShadow::class);
    }

    public function notifications(): HasMany
    {
        return $this->hasMany(Notification::class);
    }

    // Role helpers
    public function getRoleEnumAttribute(): ?UserRole
    {
        return $this->role?->enum;
    }

    public function isSuperAdmin(): bool
    {
        return $this->role?->name === UserRole::SUPER_ADMIN->value;
    }

    public function isAdminCabang(): bool
    {
        return $this->role?->name === UserRole::ADMIN_CABANG->value;
    }

    public function isAdminUnit(): bool
    {
        return $this->role?->name === UserRole::ADMIN_UNIT->value;
    }

    public function isPetugas(): bool
    {
        return $this->role?->name === UserRole::PETUGAS->value;
    }

    public function hasMinRole(UserRole $minRole): bool
    {
        $userLevel = $this->roleEnum?->level() ?? 0;
        return $userLevel >= $minRole->level();
    }

    public function canAccessCabang(int $cabangId): bool
    {
        if ($this->isSuperAdmin()) {
            return true;
        }
        return $this->cabang_id === $cabangId;
    }

    public function canAccessUnit(int $unitId): bool
    {
        if ($this->isSuperAdmin()) {
            return true;
        }
        if ($this->isAdminCabang()) {
            $unit = Unit::find($unitId);
            return $unit && $this->cabang_id === $unit->cabang_id;
        }
        return $this->unit_id === $unitId;
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
