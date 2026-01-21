import { useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { userService } from '@kas-kecil/api-client';
import { Button } from '@/components/ui/button';
import {
    ArrowLeft,
    User,
    Mail,
    Phone,
    Shield,
    Building,
    Building2,
    Pencil,
    Loader2,
    CheckCircle,
    XCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { User as UserType } from '@kas-kecil/shared';

// Role badge colors
const getRoleBadgeStyle = (roleName: string) => {
    switch (roleName?.toLowerCase()) {
        case 'super_admin':
            return 'bg-purple-100 text-purple-700 border-purple-200';
        case 'admin_cabang':
            return 'bg-blue-100 text-blue-700 border-blue-200';
        case 'admin_unit':
            return 'bg-emerald-100 text-emerald-700 border-emerald-200';
        case 'petugas':
            return 'bg-amber-100 text-amber-700 border-amber-200';
        default:
            return 'bg-gray-100 text-gray-700 border-gray-200';
    }
};

export default function UserDetailPage() {
    const navigate = useNavigate();
    const { id } = useParams();
    const [user, setUser] = useState<UserType | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (id) {
            setIsLoading(true);
            userService.getById(Number(id))
                .then((data) => {
                    setUser(data);
                })
                .catch((err) => {
                    console.error('Failed to fetch user:', err);
                    setError('Gagal memuat data user');
                })
                .finally(() => {
                    setIsLoading(false);
                });
        }
    }, [id]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-[#0053C5]" />
            </div>
        );
    }

    if (error || !user) {
        return (
            <div className="text-center py-12">
                <p className="text-red-500">{error || 'User tidak ditemukan'}</p>
                <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => navigate('/users')}
                >
                    <ArrowLeft size={18} className="mr-2" />
                    Kembali
                </Button>
            </div>
        );
    }

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
            <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                    {user.foto ? (
                        <img
                            src={user.foto}
                            alt={user.nama}
                            className="w-20 h-20 rounded-2xl object-cover border-2 border-white shadow-lg"
                        />
                    ) : (
                        <div className="w-20 h-20 rounded-2xl bg-[#0053C5]/10 flex items-center justify-center text-[#0053C5] font-bold text-2xl border-2 border-white shadow-lg">
                            {user.nama?.substring(0, 2).toUpperCase()}
                        </div>
                    )}
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                            {user.nama}
                        </h1>
                        <p className="text-gray-500 mt-1">{user.email}</p>
                        <div className="flex items-center gap-2 mt-2">
                            <span className={cn(
                                "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border",
                                getRoleBadgeStyle(user.role?.name)
                            )}>
                                <Shield size={12} />
                                {user.role?.display_name || user.role?.name || '-'}
                            </span>
                            <span className={cn(
                                "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
                                user.is_active
                                    ? "bg-emerald-100 text-emerald-700"
                                    : "bg-red-100 text-red-700"
                            )}>
                                {user.is_active ? (
                                    <><CheckCircle size={12} /> Aktif</>
                                ) : (
                                    <><XCircle size={12} /> Nonaktif</>
                                )}
                            </span>
                        </div>
                    </div>
                </div>
                <Button
                    onClick={() => navigate(`/users/${user.id}/edit`)}
                    className="h-10 px-4 bg-[#0053C5] hover:bg-[#0047AB] text-white"
                >
                    <Pencil size={16} className="mr-2" />
                    Edit User
                </Button>
            </div>

            {/* Detail Sections */}
            <div className="space-y-6">
                {/* Informasi Kontak */}
                <div className="bg-white rounded-xl border border-gray-100 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Informasi Kontak</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
                                <Mail size={18} />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Email</p>
                                <p className="text-sm font-medium text-gray-900">{user.email}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center text-green-600">
                                <Phone size={18} />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Telepon</p>
                                <p className="text-sm font-medium text-gray-900">{user.telepon || '-'}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Lokasi Penugasan */}
                <div className="bg-white rounded-xl border border-gray-100 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Lokasi Penugasan</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center text-purple-600">
                                <Building size={18} />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Cabang</p>
                                <p className="text-sm font-medium text-gray-900">
                                    {user.cabang?.nama_cabang || 'Semua Cabang'}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                            <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center text-amber-600">
                                <Building2 size={18} />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Unit</p>
                                <p className="text-sm font-medium text-gray-900">
                                    {user.unit?.nama_unit || '-'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Informasi Akun */}
                <div className="bg-white rounded-xl border border-gray-100 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Informasi Akun</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                            <div className="w-10 h-10 rounded-lg bg-gray-200 flex items-center justify-center text-gray-600">
                                <User size={18} />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Dibuat pada</p>
                                <p className="text-sm font-medium text-gray-900">
                                    {new Date(user.created_at).toLocaleDateString('id-ID', {
                                        day: 'numeric',
                                        month: 'long',
                                        year: 'numeric'
                                    })}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                            <div className="w-10 h-10 rounded-lg bg-gray-200 flex items-center justify-center text-gray-600">
                                <User size={18} />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Login Terakhir</p>
                                <p className="text-sm font-medium text-gray-900">
                                    {user.last_login_at
                                        ? new Date(user.last_login_at).toLocaleDateString('id-ID', {
                                            day: 'numeric',
                                            month: 'long',
                                            year: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })
                                        : 'Belum pernah login'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
