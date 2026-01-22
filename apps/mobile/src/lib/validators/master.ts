import { z } from 'zod';

// Cabang
export const cabangSchema = z.object({
    instansi_id: z.number().int().positive('Instansi diperlukan'),
    kode_cabang: z.string().min(1, 'Kode cabang diperlukan'),
    nama_cabang: z.string().min(1, 'Nama cabang diperlukan'),
    alamat: z.string().optional().nullable(),
    telepon: z.string().optional().nullable(),
    email: z.string().email('Email tidak valid').optional().nullable(),
    kepala_cabang: z.string().optional().nullable(),
    nip_kepala: z.string().optional().nullable(),
    plafon_kas: z.number().min(0).optional(),
});

// Unit
export const unitSchema = z.object({
    cabang_id: z.number().int().positive('Cabang diperlukan'),
    kode_unit: z.string().min(1, 'Kode unit diperlukan'),
    nama_unit: z.string().min(1, 'Nama unit diperlukan'),
    kepala_unit: z.string().optional().nullable(),
    nip_kepala: z.string().optional().nullable(),
    plafon_kas: z.number().min(0).optional(),
});

// Akun AAS
export const akunAASSchema = z.object({
    kode_akun: z.string().min(1, 'Kode akun diperlukan'),
    nama_akun: z.string().min(1, 'Nama akun diperlukan'),
    jenis: z.enum(['debet', 'kredit'], {
        errorMap: () => ({ message: 'Jenis akun tidak valid' }),
    }),
});

// Mata Anggaran
export const mataAnggaranSchema = z.object({
    cabang_id: z.number().int().positive('Cabang diperlukan'),
    kode_matanggaran: z.string().min(1, 'Kode mata anggaran diperlukan'),
    nama_matanggaran: z.string().min(1, 'Nama mata anggaran diperlukan'),
    pagu: z.number().min(0, 'Pagu minimal 0'),
    tahun_anggaran: z.number().int().min(2020).max(2100),
});

// Instansi
export const instansiSchema = z.object({
    nama_instansi: z.string().min(1, 'Nama instansi diperlukan').optional(),
    alamat: z.string().optional().nullable(),
    telepon: z.string().optional().nullable(),
    email: z.string().email().optional().nullable(),
    kepala_instansi: z.string().optional().nullable(),
    nip_kepala: z.string().optional().nullable(),
});

export type CabangInput = z.infer<typeof cabangSchema>;
export type UnitInput = z.infer<typeof unitSchema>;
export type AkunAASInput = z.infer<typeof akunAASSchema>;
export type MataAnggaranInput = z.infer<typeof mataAnggaranSchema>;
export type InstansiInput = z.infer<typeof instansiSchema>;
