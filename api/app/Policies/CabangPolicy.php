<?php

namespace App\Policies;

use App\Models\Cabang;
use App\Models\User;

class CabangPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Cabang $cabang): bool
    {
        if ($user->isSuperAdmin()) {
            return true;
        }

        return $user->cabang_id === $cabang->id;
    }

    public function create(User $user): bool
    {
        return $user->isSuperAdmin();
    }

    public function update(User $user, Cabang $cabang): bool
    {
        return $user->isSuperAdmin();
    }

    public function delete(User $user, Cabang $cabang): bool
    {
        return $user->isSuperAdmin();
    }
}
