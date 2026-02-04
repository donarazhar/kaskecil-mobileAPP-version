import { z } from 'zod';

export const draftSchema = z.object({
    cabang_id: z.number().int().positive('Cabang diperlukan'),
    unit_id: z.number().int().positive().optional().nullable(),
    tanggal: z.string().min(1, 'Tanggal diperlukan'),
    no_bukti: z.string().optional().nullable(),
    keterangan: z.string().min(1, 'Keterangan diperlukan'),
    jumlah: z.number().positive('Jumlah harus lebih dari 0'),
    kode_matanggaran: z.string().optional().nullable(),
    lampiran: z.any().optional().nullable(),
    lampiran2: z.any().optional().nullable(),
    lampiran3: z.any().optional().nullable(),
});

export const draftFilterSchema = z.object({
    cabang_id: z.number().optional(),
    unit_id: z.number().optional(),
    status: z.enum(['draft', 'pending', 'approved', 'rejected']).optional(),
    from: z.string().optional(),
    to: z.string().optional(),
    search: z.string().optional(),
    page: z.number().optional(),
    per_page: z.number().optional(),
});

export const approvalSchema = z.object({
    catatan: z.string().optional().nullable(),
});

export type DraftInput = z.infer<typeof draftSchema>;
export type DraftFilterInput = z.infer<typeof draftFilterSchema>;
export type ApprovalInput = z.infer<typeof approvalSchema>;
