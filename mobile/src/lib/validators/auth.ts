import { z } from 'zod';

export const loginSchema = z.object({
    email: z.string().email('Email tidak valid'),
    password: z.string().min(8, 'Password minimal 8 karakter'),
    remember: z.boolean().optional(),
});

export const forgotPasswordSchema = z.object({
    email: z.string().email('Email tidak valid'),
});

export const resetPasswordSchema = z.object({
    email: z.string().email('Email tidak valid'),
    token: z.string().min(1, 'Token diperlukan'),
    password: z.string().min(8, 'Password minimal 8 karakter'),
    password_confirmation: z.string().min(8, 'Konfirmasi password minimal 8 karakter'),
}).refine((data) => data.password === data.password_confirmation, {
    message: 'Password tidak cocok',
    path: ['password_confirmation'],
});

export const changePasswordSchema = z.object({
    current_password: z.string().min(1, 'Password saat ini diperlukan'),
    password: z.string().min(8, 'Password baru minimal 8 karakter'),
    password_confirmation: z.string().min(8, 'Konfirmasi password minimal 8 karakter'),
}).refine((data) => data.password === data.password_confirmation, {
    message: 'Password tidak cocok',
    path: ['password_confirmation'],
});

export type LoginInput = z.infer<typeof loginSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
