<?php

namespace App\Policies;

use App\Models\Transaksi;
use App\Models\User;

class TransaksiPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Transaksi $transaksi): bool
    {
        if ($user->isSuperAdmin()) {
            return true;
        }

        if ($user->isAdminCabang()) {
            return $user->cabang_id === $transaksi->cabang_id;
        }

        if ($user->isAdminUnit() || $user->isPetugas()) {
            return $user->unit_id === $transaksi->unit_id;
        }

        return false;
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function update(User $user, Transaksi $transaksi): bool
    {
        if ($user->isSuperAdmin()) {
            return true;
        }

        if ($user->isAdminCabang()) {
            return $user->cabang_id === $transaksi->cabang_id;
        }

        if ($user->isAdminUnit()) {
            return $user->unit_id === $transaksi->unit_id;
        }

        // Petugas can only edit their own
        if ($user->isPetugas()) {
            return $user->id === $transaksi->user_id;
        }

        return false;
    }

    public function delete(User $user, Transaksi $transaksi): bool
    {
        if ($user->isSuperAdmin()) {
            return true;
        }

        if ($user->isAdminCabang()) {
            return $user->cabang_id === $transaksi->cabang_id;
        }

        if ($user->isAdminUnit()) {
            return $user->unit_id === $transaksi->unit_id;
        }

        return false;
    }
}
