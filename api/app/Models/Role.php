<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Enums\UserRole;

class Role extends Model
{
    use HasFactory;

    protected $table = 'roles';

    public $timestamps = false;

    protected $fillable = [
        'name',
        'display_name',
        'description',
    ];

    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }

    public function getEnumAttribute(): ?UserRole
    {
        return UserRole::fromName($this->name);
    }
}
