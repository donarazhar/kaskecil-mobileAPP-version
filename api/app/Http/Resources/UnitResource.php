<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UnitResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'cabang_id' => $this->cabang_id,
            'cabang' => $this->whenLoaded('cabang', fn() => new CabangResource($this->cabang)),
            'kode_unit' => $this->kode_unit,
            'nama_unit' => $this->nama_unit,
            'kepala_unit' => $this->kepala_unit,
            'nip_kepala' => $this->nip_kepala,
            'plafon_kas' => (float) $this->plafon_kas,
            'saldo' => $this->when($request->has('with_saldo'), fn() => (float) $this->saldo),
            'is_active' => $this->is_active,
            'created_at' => $this->created_at->toISOString(),
            'updated_at' => $this->updated_at->toISOString(),
        ];
    }
}
