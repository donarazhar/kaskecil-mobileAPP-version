import { z } from 'zod';

export const userSchema = z.object({
    nama: z.string().min(2, 'Nama minimal 2 karakter'),
    email: z.string().email('Email tidak valid'),
    password: z.string().min(8, 'Password minimal 8 karakter'),
    password_confirmation: z.string().min(8, 'Konfirmasi password minimal 8 karakter'),
    role_id: z.number().int().positive('Role diperlukan'),
    cabang_id: z.number().int().positive().optional().nullable(),
    unit_id: z.number().int().positive().optional().nullable(),
    telepon: z.string().optional().nullable(),
}).refine((data) => data.password === data.password_confirmation, {
    message: 'Password tidak cocok',
    path: ['password_confirmation'],
});

export const updateUserSchema = z.object({
    nama: z.string().min(2, 'Nama minimal 2 karakter'),
    email: z.string().email('Email tidak valid'),
    password: z.string().min(8, 'Password minimal 8 karakter').optional().or(z.literal('')),
    password_confirmation: z.string().optional().or(z.literal('')),
    role_id: z.number().int().positive('Role diperlukan'),
    cabang_id: z.number().int().positive().optional().nullable(),
    unit_id: z.number().int().positive().optional().nullable(),
    telepon: z.string().optional().nullable(),
    is_active: z.boolean().optional(),
}).refine((data) => {
    if (data.password && data.password !== data.password_confirmation) {
        return false;
    }
    return true;
}, {
    message: 'Password tidak cocok',
    path: ['password_confirmation'],
});

export type UserInput = z.infer<typeof userSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
