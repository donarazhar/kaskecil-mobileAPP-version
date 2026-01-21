<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TransaksiResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'cabang_id' => $this->cabang_id,
            'unit_id' => $this->unit_id,
            'cabang' => $this->whenLoaded('cabang', fn() => new CabangResource($this->cabang)),
            'unit' => $this->whenLoaded('unit', fn() => new UnitResource($this->unit)),
            'tanggal' => $this->tanggal->format('Y-m-d'),
            'no_bukti' => $this->no_bukti,
            'keterangan' => $this->keterangan,
            'kategori' => $this->kategori->value,
            'kategori_label' => $this->kategori->label(),
            'kategori_color' => $this->kategori->color(),
            'jumlah' => (float) $this->jumlah,
            'kode_matanggaran' => $this->kode_matanggaran,
            'mata_anggaran' => $this->whenLoaded('mataAnggaran', function () {
                return [
                    'kode_matanggaran' => $this->mataAnggaran->kode_matanggaran,
                    'akun_aas' => [
                        'nama_akun' => $this->mataAnggaran->akunAas->nama_akun ?? null,
                        'kode_akun' => $this->mataAnggaran->akunAas->kode_akun ?? null,
                    ]
                ];
            }),
            'lampiran' => $this->lampiran ? asset('storage/' . $this->lampiran) : null,
            'lampiran2' => $this->lampiran2 ? asset('storage/' . $this->lampiran2) : null,
            'lampiran3' => $this->lampiran3 ? asset('storage/' . $this->lampiran3) : null,
            'id_pengisian' => $this->id_pengisian,
            'user' => $this->whenLoaded('user', fn() => new UserResource($this->user)),
            'created_at' => $this->created_at->toISOString(),
            'updated_at' => $this->updated_at->toISOString(),
        ];
    }
}
