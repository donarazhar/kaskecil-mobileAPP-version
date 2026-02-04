<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Instansi extends Model
{
    use HasFactory;

    protected $table = 'instansi';

    protected $fillable = [
        'nama_instansi',
        'alamat',
        'telepon',
        'email',
        'logo',
        'kepala_instansi',
        'nip_kepala',
    ];

    public function cabang(): HasMany
    {
        return $this->hasMany(Cabang::class);
    }
}
