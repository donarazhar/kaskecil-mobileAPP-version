import { useState } from 'react';
import { useTransaksi, useDraft, transaksiService } from '@kas-kecil/api-client';
import { formatCurrency } from '@kas-kecil/shared';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Plus, Search, FileText, ArrowLeft, ArrowRight, Trash2,
    Edit, Calendar, Loader2, X, Wallet, CheckCircle, Clock
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

export default function PengisianListPage() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [deleteId, setDeleteId] = useState<any | null>(null);

    // Debounce search
    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value);
        const timeoutId = setTimeout(() => {
            setDebouncedSearch(e.target.value);
            setPage(1);
        }, 500);
        return () => clearTimeout(timeoutId);
    };

    const { data: infiniteData, isLoading, remove, isDeleting } = useTransaksi({
        page,
        per_page: 10,
        search: debouncedSearch,
        kategori: 'pengisian',
        unit_id: user?.unit_id || undefined,
    });

    const { data: draftData, remove: removeDraft, isLoading: isDraftLoading } = useDraft({
        kategori: 'pengisian',
        status: 'draft',
        search: debouncedSearch,
        unit_id: user?.unit_id || undefined,
    });

    const drafts = draftData?.data || [];
    const transactions = infiniteData?.pages.flatMap(page => page.data) || [];
    const meta = infiniteData?.pages?.[0]?.meta;

    const isLoadingAll = isLoading || isDraftLoading;

    // Combine drafts and transactions
    const allItems = [
        ...drafts.map(d => ({ ...d, is_draft: true, status_label: 'Belum Cair' })),
        ...transactions.map(t => ({ ...t, is_draft: false, status_label: 'Sudah Cair' }))
    ];

    const handleDelete = async (item: any) => {
        try {
            if (item.is_draft) {
                await removeDraft(item.id);
            } else {
                await remove(item.id);
            }
            setDeleteId(null);
        } catch (error) {
            console.error('Failed to delete transaction:', error);
            alert('Gagal menghapus transaksi');
        }
    };

    const handleCairkan = async (id: number) => {
        try {
            if (window.confirm('Apakah Anda yakin ingin mencairkan pengisian kas ini?')) {
                await transaksiService.cairkan(id);
                // Refresh data
                window.location.reload(); // Simple reload to refresh all data
            }
        } catch (error) {
            console.error('Failed to cairkan:', error);
            alert('Gagal mencairkan pengisian kas');
        }
    };

    const resetSearch = () => {
        setSearch('');
        setDebouncedSearch('');
    };

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
                        {/* @ts-ignore */}
                        <Wallet className="w-8 h-8 text-[#0053C5]" />
                        Pengisian Kas Kecil
                    </h1>
                    <p className="text-gray-500 mt-1">Kelola transaksi pengisian kas kecil</p>
                </div>
                {user?.role?.name !== 'petugas' && (
                    <Button
                        onClick={() => navigate('/pengisian/create')}
                        className="bg-[#0053C5] hover:bg-[#0047AB] text-white shadow-lg shadow-[#0053C5]/20"
                    >
                        {/* @ts-ignore */}
                        <Plus className="w-4 h-4 mr-2" />
                        Tambah Pengisian
                    </Button>
                )}
            </div>

            {/* Search Card */}
            <Card className="border-none shadow-lg bg-gradient-to-r from-[#0053C5]/5 to-transparent">
                <CardContent className="p-6">
                    <div className="space-y-2">
                        <Label className="text-gray-700 font-medium">Pencarian</Label>
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                {/* @ts-ignore */}
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <Input
                                    placeholder="Cari perincian, no bukti..."
                                    className="pl-9 bg-white border-gray-200 focus:ring-[#0053C5]/20 focus:border-[#0053C5]"
                                    value={search}
                                    onChange={handleSearch}
                                />
                            </div>
                            {debouncedSearch && (
                                <Button variant="outline" size="icon" onClick={resetSearch} className="shrink-0">
                                    {/* @ts-ignore */}
                                    <X className="w-4 h-4" />
                                </Button>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Search Info */}
            {debouncedSearch && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center gap-3">
                    {/* @ts-ignore */}
                    <Search className="w-5 h-5 text-blue-600" />
                    <span className="text-blue-800">
                        Menampilkan hasil pencarian untuk: <strong>"{debouncedSearch}"</strong>
                    </span>
                </div>
            )}

            {/* Main Card */}
            <Card className="border-none shadow-xl bg-white overflow-hidden">
                <CardHeader className="pb-4 border-b border-gray-100 flex flex-row items-center justify-between">
                    <div className="flex items-center gap-3">
                        {/* @ts-ignore */}
                        <FileText className="w-5 h-5 text-[#0053C5]" />
                        <h2 className="text-lg font-semibold text-gray-900">Data Pengisian Kas Kecil</h2>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-sm font-medium">
                            Total: {(meta?.total || 0) + drafts.length} data
                        </span>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 text-gray-600 font-semibold border-b">
                                <tr>
                                    <th className="px-6 py-4 text-left">No</th>
                                    <th className="px-6 py-4 text-left">Tanggal</th>
                                    <th className="px-6 py-4 text-left">Informasi Akun</th>
                                    <th className="px-6 py-4 text-left">Perincian</th>
                                    <th className="px-6 py-4 text-right">Jumlah</th>
                                    <th className="px-6 py-4 text-center">Status</th>
                                    <th className="px-6 py-4 text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {isLoadingAll ? (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-16 text-center">
                                            <div className="flex flex-col items-center gap-3">
                                                {/* @ts-ignore */}
                                                <Loader2 className="w-8 h-8 animate-spin text-[#0053C5]" />
                                                <span className="text-gray-500">Memuat data...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : allItems.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-16 text-center">
                                            <div className="flex flex-col items-center gap-3">
                                                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                                                    {/* @ts-ignore */}
                                                    <FileText className="w-8 h-8 text-gray-400" />
                                                </div>
                                                <h3 className="font-semibold text-gray-700">Belum Ada Data</h3>
                                                <p className="text-gray-500 text-sm">
                                                    {debouncedSearch
                                                        ? 'Tidak ada data yang sesuai dengan pencarian Anda'
                                                        : 'Silakan tambahkan data pengisian kas kecil'
                                                    }
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    allItems.map((item: any, index) => {
                                        // Format date to dd/mm/yy
                                        const date = new Date(item.tanggal);
                                        const formattedDate = `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getFullYear()).slice(-2)}`;

                                        const isCair = !item.is_draft;

                                        return (
                                            <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 text-gray-600">
                                                    {((meta?.current_page || 1) - 1) * (meta?.per_page || 10) + index + 1}
                                                </td>
                                                <td className="px-6 py-4 text-gray-600">
                                                    <div className="flex items-center gap-2">
                                                        {/* @ts-ignore */}
                                                        <Calendar className="w-4 h-4 text-gray-400" />
                                                        <span className="font-medium">{formattedDate}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col gap-1.5">
                                                        <div className="flex items-center gap-2">
                                                            {item.kode_matanggaran && (
                                                                <span className="text-xs font-medium text-[#0053C5] bg-[#0053C5]/10 px-2 py-0.5 rounded">
                                                                    {item.kode_matanggaran}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <span className="text-sm text-gray-700 font-medium line-clamp-2">
                                                            {item.mata_anggaran?.akun_aas?.nama_akun || '-'}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-sm text-gray-700 line-clamp-2">
                                                        {item.keterangan}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right font-semibold text-emerald-600">
                                                    + {formatCurrency(item.jumlah)}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex justify-center">
                                                        {isCair ? (
                                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold">
                                                                {/* @ts-ignore */}
                                                                <CheckCircle className="w-3.5 h-3.5" />
                                                                Sudah Cair
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-semibold">
                                                                {/* @ts-ignore */}
                                                                <Clock className="w-3.5 h-3.5" />
                                                                Belum Cair
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center justify-center gap-1">
                                                        {user?.role?.name !== 'petugas' && !isCair && (
                                                            <>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                                                    onClick={() => navigate(`/pengisian/${item.id}/edit`)}
                                                                    title="Edit"
                                                                >
                                                                    {/* @ts-ignore */}
                                                                    <Edit className="w-4 h-4" />
                                                                </Button>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                                                                    onClick={() => setDeleteId(item)}
                                                                    title="Hapus"
                                                                >
                                                                    {/* @ts-ignore */}
                                                                    <Trash2 className="w-4 h-4" />
                                                                </Button>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    className="h-8 px-3 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                                                                    title="Cairkan"
                                                                    onClick={() => handleCairkan(item.id)}
                                                                >
                                                                    {/* @ts-ignore */}
                                                                    <CheckCircle className="w-4 h-4 mr-1" />
                                                                    Cairkan
                                                                </Button>
                                                            </>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {transactions.length > 0 && meta && (
                        <div className="flex items-center justify-between p-6 border-t border-gray-100">
                            <p className="text-sm text-gray-500">
                                Menampilkan {meta.from || 0} - {meta.to || 0} dari {meta.total || 0} data
                            </p>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1 || (meta.current_page || 1) === 1}
                                    className="h-9"
                                >
                                    {/* @ts-ignore */}
                                    <ArrowLeft className="w-4 h-4 mr-1" />
                                    Prev
                                </Button>
                                <span className="px-3 py-1 rounded-lg bg-[#0053C5] text-white text-sm font-medium">
                                    Hal {meta.current_page || 1} dari {meta.last_page || 1}
                                </span>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPage(p => p + 1)}
                                    disabled={(meta.current_page || 1) >= (meta.last_page || 1)}
                                    className="h-9"
                                >
                                    Next
                                    {/* @ts-ignore */}
                                    <ArrowRight className="w-4 h-4 ml-1" />
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Delete Confirmation Modal */}
            {deleteId && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl">
                        <div className="text-center">
                            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                                {/* @ts-ignore */}
                                <Trash2 className="w-8 h-8 text-red-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Yakin Hapus Data?</h3>
                            <p className="text-gray-600 mb-6">Data akan dihapus secara permanen dan tidak dapat dikembalikan.</p>
                            <div className="flex gap-3">
                                <Button
                                    variant="outline"
                                    className="flex-1"
                                    onClick={() => setDeleteId(null)}
                                    disabled={isDeleting}
                                >
                                    Batal
                                </Button>
                                <Button
                                    className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                                    onClick={() => deleteId && handleDelete(deleteId)}
                                    disabled={isDeleting}
                                >
                                    {isDeleting ? (
                                        <>
                                            {/* @ts-ignore */}
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Menghapus...
                                        </>
                                    ) : (
                                        'Ya, Hapus!'
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
