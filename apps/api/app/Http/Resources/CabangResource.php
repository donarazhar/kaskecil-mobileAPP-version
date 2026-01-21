<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CabangResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'instansi_id' => $this->instansi_id,
            'instansi' => $this->whenLoaded('instansi'),
            'kode_cabang' => $this->kode_cabang,
            'nama_cabang' => $this->nama_cabang,
            'alamat' => $this->alamat,
            'latitude' => (float) $this->latitude,
            'longitude' => (float) $this->longitude,
            'telepon' => $this->telepon,
            'email' => $this->email,
            'kepala_cabang' => $this->kepala_cabang,
            'nip_kepala' => $this->nip_kepala,
            'plafon_kas' => (float) $this->plafon_kas,
            'saldo' => $this->when($request->has('with_saldo'), fn() => (float) $this->saldo),
            'is_active' => $this->is_active,
            'created_at' => $this->created_at->toISOString(),
            'updated_at' => $this->updated_at->toISOString(),
        ];
    }
}
