<?php

namespace App\Policies;

use App\Models\Unit;
use App\Models\User;

class UnitPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Unit $unit): bool
    {
        if ($user->isSuperAdmin()) {
            return true;
        }

        if ($user->isAdminCabang()) {
            return $user->cabang_id === $unit->cabang_id;
        }

        return $user->unit_id === $unit->id;
    }

    public function create(User $user): bool
    {
        return $user->isSuperAdmin() || $user->isAdminCabang();
    }

    public function update(User $user, Unit $unit): bool
    {
        if ($user->isSuperAdmin()) {
            return true;
        }

        if ($user->isAdminCabang()) {
            return $user->cabang_id === $unit->cabang_id;
        }

        return false;
    }

    public function delete(User $user, Unit $unit): bool
    {
        if ($user->isSuperAdmin()) {
            return true;
        }

        if ($user->isAdminCabang()) {
            return $user->cabang_id === $unit->cabang_id;
        }

        return false;
    }
}
