import { useState } from 'react';
import { useUser } from '@kas-kecil/api-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Plus,
    Search,
    Pencil,
    Trash2,
    ChevronLeft,
    ChevronRight,
    UserCog,
    MoreHorizontal,
    Filter,
    Download,
    Mail,
    Phone,
    Shield,
    Building,
    Users
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

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

// Status badge
const StatusBadge = ({ isActive }: { isActive: boolean }) => (
    <span className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
        isActive
            ? "bg-emerald-100 text-emerald-700"
            : "bg-red-100 text-red-700"
    )}>
        <span className={cn(
            "w-1.5 h-1.5 rounded-full",
            isActive ? "bg-emerald-500" : "bg-red-500"
        )} />
        {isActive ? 'Aktif' : 'Nonaktif'}
    </span>
);

export default function UserListPage() {
    const navigate = useNavigate();
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value);
        const timeoutId = setTimeout(() => {
            setDebouncedSearch(e.target.value);
            setPage(1);
        }, 500);
        return () => clearTimeout(timeoutId);
    };

    const { data: userData, isLoading, remove } = useUser({
        page,
        search: debouncedSearch,
    });

    const users = userData?.data || [];
    const meta = userData?.meta;
    const links = userData?.links;

    const handleDelete = async (id: number, name: string) => {
        if (confirm(`Apakah Anda yakin ingin menghapus user "${name}"?`)) {
            try {
                await remove(id);
            } catch (error) {
                console.error(error);
                alert('Gagal menghapus user');
            }
        }
    };

    // Stats cards data
    const stats = [
        { label: 'Total User', value: meta?.total || 0, icon: Users, color: 'bg-[#0053C5]' },
        { label: 'User Aktif', value: users.filter((u: any) => u.is_active).length, icon: UserCog, color: 'bg-emerald-500' },
        { label: 'Admin', value: users.filter((u: any) => u.role?.name?.includes('admin')).length, icon: Shield, color: 'bg-purple-500' },
    ];

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Manajemen Pengguna</h1>
                    <p className="text-gray-500 mt-1">Kelola data pengguna dan hak akses aplikasi</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        className="h-10 px-4 border-gray-200 hover:bg-gray-50"
                    >
                        {/* @ts-ignore */}
                        <Download size={18} className="mr-2" />
                        Export
                    </Button>
                    <Button
                        onClick={() => navigate('/users/create')}
                        className="h-10 px-4 bg-[#0053C5] hover:bg-[#0047AB] text-white shadow-lg shadow-[#0053C5]/20"
                    >
                        {/* @ts-ignore */}
                        <Plus size={18} className="mr-2" />
                        Tambah User
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {stats.map((stat, index) => (
                    <div
                        key={index}
                        className="bg-white rounded-xl border border-gray-100 p-5 flex items-center gap-4"
                    >
                        <div className={cn(
                            "w-12 h-12 rounded-xl flex items-center justify-center text-white",
                            stat.color
                        )}>
                            {/* @ts-ignore */}
                            <stat.icon size={22} />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                            <p className="text-sm text-gray-500">{stat.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Card */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {/* Toolbar */}
                <div className="p-4 border-b border-gray-100">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                        {/* Search */}
                        <div className="relative flex-1 max-w-md">
                            {/* @ts-ignore */}
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <Input
                                placeholder="Cari nama, email, atau role..."
                                className="pl-11 h-11 bg-gray-50/80 border-gray-200 rounded-xl focus:bg-white"
                                value={search}
                                onChange={handleSearch}
                            />
                        </div>

                        {/* Filters */}
                        <div className="flex items-center gap-2">
                            <Button variant="outline" className="h-11 px-4 border-gray-200 rounded-xl">
                                {/* @ts-ignore */}
                                <Filter size={16} className="mr-2" />
                                Filter
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-50/80">
                                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Pengguna
                                </th>
                                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Role
                                </th>
                                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Cabang / Unit
                                </th>
                                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="text-right px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Aksi
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {isLoading ? (
                                // Loading skeleton
                                [...Array(5)].map((_, i) => (
                                    <tr key={i}>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-11 h-11 rounded-full bg-gray-200 animate-pulse" />
                                                <div className="space-y-2">
                                                    <div className="w-32 h-4 bg-gray-200 rounded animate-pulse" />
                                                    <div className="w-40 h-3 bg-gray-100 rounded animate-pulse" />
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="w-24 h-6 bg-gray-200 rounded-full animate-pulse" />
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="w-32 h-4 bg-gray-200 rounded animate-pulse" />
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="w-16 h-6 bg-gray-200 rounded-full animate-pulse" />
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="w-8 h-8 bg-gray-200 rounded-lg animate-pulse ml-auto" />
                                        </td>
                                    </tr>
                                ))
                            ) : users.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-16 text-center">
                                        <div className="flex flex-col items-center">
                                            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                                                {/* @ts-ignore */}
                                                <Users size={32} className="text-gray-400" />
                                            </div>
                                            <h3 className="text-lg font-semibold text-gray-900 mb-1">Tidak ada data</h3>
                                            <p className="text-gray-500 mb-4">Belum ada pengguna yang terdaftar</p>
                                            <Button
                                                onClick={() => navigate('/users/create')}
                                                className="bg-[#0053C5] hover:bg-[#0047AB]"
                                            >
                                                {/* @ts-ignore */}
                                                <Plus size={18} className="mr-2" />
                                                Tambah User Pertama
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                users.map((user: any) => (
                                    <tr key={user.id} className="group hover:bg-gray-50/50 transition-colors">
                                        {/* User Info */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="relative">
                                                    {user.foto ? (
                                                        <img
                                                            src={user.foto}
                                                            alt={user.nama}
                                                            className="w-11 h-11 rounded-full object-cover border-2 border-white shadow-sm"
                                                        />
                                                    ) : (
                                                        <div className="w-11 h-11 rounded-full bg-[#0053C5]/10 flex items-center justify-center text-[#0053C5] font-semibold text-sm border-2 border-white shadow-sm">
                                                            {user.nama?.substring(0, 2).toUpperCase()}
                                                        </div>
                                                    )}
                                                    {user.is_active && (
                                                        <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full" />
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-gray-900 group-hover:text-[#0053C5] transition-colors">
                                                        {user.nama}
                                                    </p>
                                                    <div className="flex items-center gap-3 mt-0.5">
                                                        <span className="flex items-center text-sm text-gray-500">
                                                            {/* @ts-ignore */}
                                                            <Mail size={12} className="mr-1.5" />
                                                            {user.email}
                                                        </span>
                                                        {user.telepon && (
                                                            <span className="flex items-center text-sm text-gray-500">
                                                                {/* @ts-ignore */}
                                                                <Phone size={12} className="mr-1.5" />
                                                                {user.telepon}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Role */}
                                        <td className="px-6 py-4">
                                            <span className={cn(
                                                "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border",
                                                getRoleBadgeStyle(user.role?.name)
                                            )}>
                                                {/* @ts-ignore */}
                                                <Shield size={12} />
                                                {user.role?.display_name || user.role?.name || '-'}
                                            </span>
                                        </td>

                                        {/* Cabang/Unit */}
                                        <td className="px-6 py-4">
                                            {user.cabang ? (
                                                <div className="flex items-center gap-2">
                                                    {/* @ts-ignore */}
                                                    <Building size={14} className="text-gray-400" />
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-900">
                                                            {user.cabang.nama_cabang}
                                                        </p>
                                                        {user.unit && (
                                                            <p className="text-xs text-gray-500">
                                                                {user.unit.nama_unit}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            ) : (
                                                <span className="text-sm text-gray-400">Semua Cabang</span>
                                            )}
                                        </td>

                                        {/* Status */}
                                        <td className="px-6 py-4">
                                            <StatusBadge isActive={user.is_active} />
                                        </td>

                                        {/* Actions */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-9 w-9 text-gray-400 hover:text-[#0053C5] hover:bg-[#0053C5]/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                                                    onClick={() => navigate(`/users/${user.id}/edit`)}
                                                >
                                                    {/* @ts-ignore */}
                                                    <Pencil size={16} />
                                                </Button>

                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-9 w-9 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                                                        >
                                                            {/* @ts-ignore */}
                                                            <MoreHorizontal size={16} />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-48">
                                                        <DropdownMenuItem onClick={() => navigate(`/users/${user.id}`)}>
                                                            {/* @ts-ignore */}
                                                            <UserCog size={16} className="mr-2" />
                                                            Lihat Detail
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => navigate(`/users/${user.id}/edit`)}>
                                                            {/* @ts-ignore */}
                                                            <Pencil size={16} className="mr-2" />
                                                            Edit User
                                                        </DropdownMenuItem>
                                                        {user.role?.name !== 'super_admin' && (
                                                            <>
                                                                <DropdownMenuSeparator />
                                                                <DropdownMenuItem
                                                                    onClick={() => handleDelete(user.id, user.nama)}
                                                                    className="text-red-600 focus:text-red-600 focus:bg-red-50"
                                                                >
                                                                    {/* @ts-ignore */}
                                                                    <Trash2 size={16} className="mr-2" />
                                                                    Hapus User
                                                                </DropdownMenuItem>
                                                            </>
                                                        )}
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {meta && (
                    <div className="px-6 py-4 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <p className="text-sm text-gray-500">
                            Menampilkan <span className="font-medium text-gray-900">{meta.from || 0}</span> - <span className="font-medium text-gray-900">{meta.to || 0}</span> dari <span className="font-medium text-gray-900">{meta.total}</span> pengguna
                        </p>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={!links?.prev}
                                className="h-9 px-3 border-gray-200 rounded-lg disabled:opacity-50"
                            >
                                {/* @ts-ignore */}
                                <ChevronLeft size={16} className="mr-1" />
                                Sebelumnya
                            </Button>

                            {/* Page Numbers */}
                            <div className="hidden sm:flex items-center gap-1">
                                {[...Array(Math.min(5, meta.last_page || 1))].map((_, i) => {
                                    const pageNum = i + 1;
                                    return (
                                        <Button
                                            key={pageNum}
                                            variant={pageNum === meta.current_page ? "default" : "ghost"}
                                            size="sm"
                                            onClick={() => setPage(pageNum)}
                                            className={cn(
                                                "h-9 w-9 p-0 rounded-lg",
                                                pageNum === meta.current_page
                                                    ? "bg-[#0053C5] text-white hover:bg-[#0047AB]"
                                                    : "text-gray-600 hover:bg-gray-100"
                                            )}
                                        >
                                            {pageNum}
                                        </Button>
                                    );
                                })}
                            </div>

                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPage(p => p + 1)}
                                disabled={!links?.next}
                                className="h-9 px-3 border-gray-200 rounded-lg disabled:opacity-50"
                            >
                                Selanjutnya
                                {/* @ts-ignore */}
                                <ChevronRight size={16} className="ml-1" />
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}