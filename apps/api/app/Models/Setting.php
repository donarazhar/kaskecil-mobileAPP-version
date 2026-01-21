<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Setting extends Model
{
    use HasFactory;

    protected $table = 'settings';

    protected $fillable = [
        'cabang_id',
        'key',
        'value',
    ];

    public function cabang(): BelongsTo
    {
        return $this->belongsTo(Cabang::class);
    }

    public static function get(string $key, ?int $cabangId = null, $default = null)
    {
        $query = static::where('key', $key);

        if ($cabangId) {
            $query->where('cabang_id', $cabangId);
        } else {
            $query->whereNull('cabang_id');
        }

        return $query->value('value') ?? $default;
    }

    public static function set(string $key, $value, ?int $cabangId = null): void
    {
        static::updateOrCreate(
            [
                'key' => $key,
                'cabang_id' => $cabangId,
            ],
            ['value' => $value]
        );
    }
}
