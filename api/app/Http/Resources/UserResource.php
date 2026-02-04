<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'nama' => $this->nama,
            'email' => $this->email,
            'role' => $this->whenLoaded('role', fn() => [
                'id' => $this->role->id,
                'name' => $this->role->name,
                'display_name' => $this->role->display_name,
            ]),
            'cabang_id' => $this->cabang_id,
            'unit_id' => $this->unit_id,
            'cabang' => $this->whenLoaded('cabang', fn() => new CabangResource($this->cabang)),
            'unit' => $this->whenLoaded('unit', fn() => new UnitResource($this->unit)),
            'foto' => $this->foto ? asset('storage/' . $this->foto) : null,
            'telepon' => $this->telepon,
            'is_active' => $this->is_active,
            'last_login_at' => $this->last_login_at?->toISOString(),
            'created_at' => $this->created_at->toISOString(),
            'updated_at' => $this->updated_at->toISOString(),
        ];
    }
}
