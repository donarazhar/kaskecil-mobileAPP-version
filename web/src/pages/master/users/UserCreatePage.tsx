import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useUser, useCabang, useUnit } from '@kas-kecil/api-client';
import { userSchema, updateUserSchema } from '@kas-kecil/validators';
import { zodResolver } from '@hookform/resolvers/zod';
import {
    ArrowLeft,
    Loader2,
    User,
    Mail,
    Lock,
    Phone,
    Shield,
    Building,
    Building2,
    Eye,
    EyeOff,
    AlertCircle,
    Save
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { userService } from '@kas-kecil/api-client';
import React from 'react';

// Custom Select Component with forwardRef
const SelectField = React.forwardRef<
    HTMLSelectElement,
    {
        label: string;
        icon: any;
        error?: string;
        children: React.ReactNode;
    } & React.SelectHTMLAttributes<HTMLSelectElement>
>(({ label, icon: Icon, error, children, ...props }, ref) => (
    <div className="space-y-2">
        <Label className="text-sm font-medium text-gray-700">{label}</Label>
        <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                <Icon size={18} />
            </div>
            <select
                ref={ref}
                className={cn(
                    "flex h-12 w-full rounded-xl border bg-gray-50/80 pl-11 pr-4 py-2 text-sm transition-all",
                    "focus:bg-white focus:border-[#0053C5] focus:outline-none focus:ring-4 focus:ring-[#0053C5]/10",
                    "disabled:cursor-not-allowed disabled:opacity-50",
                    error
                        ? "border-red-300 focus:border-red-500 focus:ring-red-500/10"
                        : "border-gray-200"
                )}
                {...props}
            >
                {children}
            </select>
        </div>
        {error && (
            <p className="text-sm text-red-500 flex items-center gap-1.5">
                <AlertCircle size={14} />
                {error}
            </p>
        )}
    </div>
));
SelectField.displayName = 'SelectField';

// Input Field with Icon and forwardRef
const InputField = React.forwardRef<
    HTMLInputElement,
    {
        label: string;
        icon: any;
        error?: string;
        type?: string;
        rightElement?: React.ReactNode;
    } & React.InputHTMLAttributes<HTMLInputElement>
>(({ label, icon: Icon, error, type = "text", rightElement, ...props }, ref) => (
    <div className="space-y-2">
        <Label className="text-sm font-medium text-gray-700">{label}</Label>
        <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                <Icon size={18} />
            </div>
            <input
                ref={ref}
                type={type}
                className={cn(
                    "flex w-full border px-4 py-2 text-sm ring-offset-background transition-all duration-200",
                    "file:border-0 file:bg-transparent file:text-sm file:font-medium",
                    "placeholder:text-gray-400 focus:outline-none",
                    "disabled:cursor-not-allowed disabled:opacity-50",
                    "h-12 pl-11 bg-gray-50/80 border-gray-200 rounded-xl",
                    "focus:bg-white focus:border-[#0053C5] focus:ring-4 focus:ring-[#0053C5]/10",
                    rightElement && "pr-12",
                    error && "border-red-300 focus:border-red-500 focus:ring-red-500/10"
                )}
                {...props}
            />
            {rightElement && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    {rightElement}
                </div>
            )}
        </div>
        {error && (
            <p className="text-sm text-red-500 flex items-center gap-1.5">
                <AlertCircle size={14} />
                {error}
            </p>
        )}
    </div>
));
InputField.displayName = 'InputField';

export default function UserCreatePage() {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditMode = !!id;

    const { create, update, roles } = useUser();
    const { data: cabangs } = useCabang();

    const [selectedCabangId, setSelectedCabangId] = useState<number | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoadingUser, setIsLoadingUser] = useState(isEditMode);

    const { data: units } = useUnit(selectedCabangId || undefined);

    // Use appropriate schema based on mode
    const schema = isEditMode ? updateUserSchema : userSchema;

    const form = useForm<any>({
        resolver: zodResolver(schema),
        mode: 'onChange',
        defaultValues: {
            nama: '',
            email: '',
            password: '',
            password_confirmation: '',
            role_id: undefined,
            cabang_id: undefined,
            unit_id: undefined,
            telepon: '',
        },
    });

    const { formState: { errors, isSubmitting } } = form;
    const watchedRole = form.watch('role_id');

    // Fetch user data when in edit mode
    useEffect(() => {
        if (isEditMode && id) {
            setIsLoadingUser(true);
            userService.getById(Number(id))
                .then((user) => {
                    const formData = {
                        nama: user.nama || '',
                        email: user.email || '',
                        role_id: user.role?.id || undefined,
                        cabang_id: user.cabang_id || undefined,
                        unit_id: user.unit_id || undefined,
                        telepon: user.telepon || '',
                        password: '',
                        password_confirmation: '',
                    };
                    form.reset(formData);
                    // Set selected cabang to load units
                    if (user.cabang_id) {
                        setSelectedCabangId(user.cabang_id);
                    }
                })
                .catch((error) => {
                    console.error('Failed to fetch user:', error);
                    form.setError('root', {
                        message: 'Gagal memuat data user'
                    });
                })
                .finally(() => {
                    setIsLoadingUser(false);
                });
        }
    }, [id, isEditMode, form]);

    const onSubmit = async (data: any) => {
        try {
            if (isEditMode) {
                // For edit mode, only include password if provided
                const updateData: any = {
                    nama: data.nama,
                    email: data.email,
                    role_id: Number(data.role_id),
                    cabang_id: data.cabang_id ? Number(data.cabang_id) : null,
                    unit_id: data.unit_id ? Number(data.unit_id) : null,
                    telepon: data.telepon || null,
                };

                if (data.password && data.password.trim()) {
                    updateData.password = data.password;
                    updateData.password_confirmation = data.password_confirmation;
                }

                await update({ id: Number(id), data: updateData });
            } else {
                // For create mode, password is required
                const createData = {
                    nama: data.nama,
                    email: data.email,
                    password: data.password,
                    password_confirmation: data.password_confirmation,
                    role_id: Number(data.role_id),
                    cabang_id: data.cabang_id ? Number(data.cabang_id) : null,
                    unit_id: data.unit_id ? Number(data.unit_id) : null,
                    telepon: data.telepon || null,
                };
                await create(createData);
            }
            navigate('/users');
        } catch (error: any) {
            console.error('Failed to save user:', error);
            form.setError('root', {
                message: error?.response?.data?.message || `Gagal ${isEditMode ? 'mengupdate' : 'menyimpan'} data user`
            });
        }
    };

    // Password strength indicator
    const password = form.watch('password');
    const getPasswordStrength = (pwd: string) => {
        if (!pwd) return { strength: 0, label: '', color: '' };
        let strength = 0;
        if (pwd.length >= 8) strength++;
        if (/[A-Z]/.test(pwd)) strength++;
        if (/[a-z]/.test(pwd)) strength++;
        if (/[0-9]/.test(pwd)) strength++;
        if (/[^A-Za-z0-9]/.test(pwd)) strength++;

        if (strength <= 2) return { strength, label: 'Lemah', color: 'bg-red-500' };
        if (strength <= 3) return { strength, label: 'Sedang', color: 'bg-amber-500' };
        return { strength, label: 'Kuat', color: 'bg-emerald-500' };
    };

    const passwordStrength = getPasswordStrength(password || '');

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            {/* Back Button */}
            <Button
                variant="ghost"
                className="h-10 px-0 text-gray-600 hover:text-[#0053C5] hover:bg-transparent"
                onClick={() => navigate('/users')}
            >
                <ArrowLeft size={18} className="mr-2" />
                Kembali ke Daftar User
            </Button>

            {/* Header */}
            {isLoadingUser ? (
                <div className="flex items-start gap-4 animate-pulse">
                    <div className="w-14 h-14 rounded-2xl bg-gray-200" />
                    <div className="flex-1 space-y-2">
                        <div className="h-8 bg-gray-200 rounded w-48" />
                        <div className="h-4 bg-gray-100 rounded w-64" />
                    </div>
                </div>
            ) : (
                <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-[#0053C5]/10 flex items-center justify-center">
                        <User size={28} className="text-[#0053C5]" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                            {isEditMode ? 'Edit User' : 'Tambah User Baru'}
                        </h1>
                        <p className="text-gray-500 mt-1">
                            {isEditMode
                                ? 'Update informasi pengguna'
                                : 'Lengkapi formulir berikut untuk menambahkan pengguna baru'
                            }
                        </p>
                    </div>
                </div>
            )}

            {/* Form */}
            <div className="space-y-6">
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    {/* Section: Informasi Dasar */}
                    <div className="p-6 border-b border-gray-100">
                        <h2 className="text-lg font-semibold text-gray-900 mb-1">Informasi Dasar</h2>
                        <p className="text-sm text-gray-500 mb-6">Data identitas pengguna</p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <InputField
                                label="Nama Lengkap"
                                icon={User}
                                placeholder="Masukkan nama lengkap"
                                error={errors.nama?.message as string}
                                disabled={isLoadingUser}
                                {...form.register('nama')}
                            />

                            <InputField
                                label="Email"
                                icon={Mail}
                                type="email"
                                placeholder="nama@email.com"
                                error={errors.email?.message as string}
                                {...form.register('email')}
                            />
                        </div>

                        <div className="mt-6">
                            <InputField
                                label="No. Telepon (Opsional)"
                                icon={Phone}
                                placeholder="08xxxxxxxxxx"
                                {...form.register('telepon')}
                            />
                        </div>
                    </div>

                    {/* Section: Password */}
                    <div className="p-6 border-b border-gray-100">
                        <h2 className="text-lg font-semibold text-gray-900 mb-1">Keamanan</h2>
                        <p className="text-sm text-gray-500 mb-6">Password untuk akses akun</p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <InputField
                                    label={isEditMode ? "Password Baru (Opsional)" : "Password"}
                                    icon={Lock}
                                    type={showPassword ? "text" : "password"}
                                    placeholder={isEditMode ? "Kosongkan jika tidak ingin mengubah" : "Minimal 8 karakter"}
                                    error={errors.password?.message as string}
                                    rightElement={
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="text-gray-400 hover:text-gray-600"
                                        >
                                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    }
                                    {...form.register('password')}
                                />

                                {/* Password Strength */}
                                {password && (
                                    <div className="space-y-1.5">
                                        <div className="flex gap-1">
                                            {[1, 2, 3, 4, 5].map((i) => (
                                                <div
                                                    key={i}
                                                    className={cn(
                                                        "h-1 flex-1 rounded-full transition-colors",
                                                        i <= passwordStrength.strength
                                                            ? passwordStrength.color
                                                            : "bg-gray-200"
                                                    )}
                                                />
                                            ))}
                                        </div>
                                        <p className={cn(
                                            "text-xs font-medium",
                                            passwordStrength.color === 'bg-red-500' && "text-red-500",
                                            passwordStrength.color === 'bg-amber-500' && "text-amber-500",
                                            passwordStrength.color === 'bg-emerald-500' && "text-emerald-500"
                                        )}>
                                            Kekuatan Password: {passwordStrength.label}
                                        </p>
                                    </div>
                                )}
                            </div>

                            <InputField
                                label={isEditMode ? "Konfirmasi Password Baru" : "Konfirmasi Password"}
                                icon={Lock}
                                type={showConfirmPassword ? "text" : "password"}
                                placeholder={isEditMode ? "Ulangi password baru" : "Ulangi password"}
                                error={errors.password_confirmation?.message as string}
                                rightElement={
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="text-gray-400 hover:text-gray-600"
                                    >
                                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                }
                                {...form.register('password_confirmation')}
                            />
                        </div>
                    </div>

                    {/* Section: Role & Akses */}
                    <div className="p-6 border-b border-gray-100">
                        <h2 className="text-lg font-semibold text-gray-900 mb-1">Role & Akses</h2>
                        <p className="text-sm text-gray-500 mb-6">Tentukan hak akses pengguna</p>

                        <div className="space-y-6">
                            <SelectField
                                label="Role"
                                icon={Shield}
                                error={errors.role_id?.message as string}
                                {...form.register('role_id', { valueAsNumber: true })}
                            >
                                <option value="">Pilih Role</option>
                                {roles?.map((role: any) => (
                                    <option key={role.id} value={role.id}>
                                        {role.display_name}
                                    </option>
                                ))}
                            </SelectField>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <SelectField
                                    label="Cabang"
                                    icon={Building}
                                    {...form.register('cabang_id', {
                                        valueAsNumber: true,
                                        onChange: (e) => {
                                            const newCabangId = Number(e.target.value) || null;
                                            setSelectedCabangId(newCabangId);
                                            // Reset unit when cabang changes
                                            form.setValue('unit_id', undefined);
                                        }
                                    })}
                                >
                                    <option value="">
                                        {watchedRole === 1 ? 'Semua Cabang (Super Admin)' : 'Pilih Cabang'}
                                    </option>
                                    {cabangs?.map((cabang: any) => (
                                        <option key={cabang.id} value={cabang.id}>
                                            {cabang.nama_cabang}
                                        </option>
                                    ))}
                                </SelectField>

                                <SelectField
                                    label="Unit (Opsional)"
                                    icon={Building2}
                                    disabled={!selectedCabangId}
                                    {...form.register('unit_id', { valueAsNumber: true })}
                                >
                                    <option value="">
                                        {!selectedCabangId ? 'Pilih cabang terlebih dahulu' : 'Pilih Unit'}
                                    </option>
                                    {units?.map((unit: any) => (
                                        <option key={unit.id} value={unit.id}>
                                            {unit.nama_unit}
                                        </option>
                                    ))}
                                </SelectField>
                            </div>
                        </div>
                    </div>
                    {/* Error Message */}
                    {errors.root && (
                        <div className="mx-6 mt-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3">
                            <AlertCircle size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="font-medium text-red-700">Gagal menyimpan</p>
                                <p className="text-sm text-red-600">{errors.root.message}</p>
                            </div>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="p-6 bg-gray-50/50 flex items-center justify-end gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            className="h-11 px-6 border-gray-200 rounded-xl"
                            onClick={() => navigate('/users')}
                        >
                            Batal
                        </Button>
                        <Button
                            type="submit"
                            className="h-11 px-6 bg-[#0053C5] hover:bg-[#0047AB] rounded-xl shadow-lg shadow-[#0053C5]/20"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 size={18} className="mr-2 animate-spin" />
                                    {isEditMode ? 'Mengupdate...' : 'Menyimpan...'}
                                </>
                            ) : (
                                <>
                                    <Save size={18} className="mr-2" />
                                    {isEditMode ? 'Update User' : 'Simpan User'}
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}