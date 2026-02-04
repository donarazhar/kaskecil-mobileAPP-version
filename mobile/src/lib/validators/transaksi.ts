import { z } from 'zod';

export const transaksiSchema = z.object({
    cabang_id: z.number().int().positive('Cabang diperlukan'),
    unit_id: z.number().int().positive().optional().nullable(),
    tanggal: z.string().min(1, 'Tanggal diperlukan'),
    no_bukti: z.string().optional().nullable(),
    keterangan: z.string().min(1, 'Keterangan diperlukan'),
    kategori: z.enum(['pembentukan', 'pengeluaran', 'pengisian'], {
        errorMap: () => ({ message: 'Kategori tidak valid' }),
    }),
    jumlah: z.number().positive('Jumlah harus lebih dari 0'),
    kode_matanggaran: z.string().optional().nullable(),
    lampiran: z.any().optional().nullable(),
    lampiran2: z.any().optional().nullable(),
    lampiran3: z.any().optional().nullable(),
});

export const transaksiFilterSchema = z.object({
    cabang_id: z.number().optional(),
    unit_id: z.number().optional(),
    kategori: z.enum(['pembentukan', 'pengeluaran', 'pengisian']).optional(),
    from: z.string().optional(),
    to: z.string().optional(),
    search: z.string().optional(),
    page: z.number().optional(),
    per_page: z.number().optional(),
});

export type TransaksiInput = z.infer<typeof transaksiSchema>;
export type TransaksiFilterInput = z.infer<typeof transaksiFilterSchema>;
