import { useState, useMemo } from 'react';
import { useTransaksi } from '@kas-kecil/api-client';
import { formatCurrency } from '@kas-kecil/shared';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Plus, Search, FileText, ArrowLeft, ArrowRight, Trash2,
    Edit, Image, Calendar, DollarSign, Loader2, X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

const MONTH_NAMES = [
    '', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

export default function TransaksiListPage() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [viewLampiran, setViewLampiran] = useState<{
        urls: string[];
        currentIndex: number;
    } | null>(null);

    // Debounce search
    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value);
        const timeoutId = setTimeout(() => {
            setDebouncedSearch(e.target.value);
            setPage(1);
        }, 500);
        return () => clearTimeout(timeoutId);
    };

    // Calculate date range for filter
    const dateRange = useMemo(() => {
        const from = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-01`;
        const lastDay = new Date(selectedYear, selectedMonth, 0).getDate();
        const to = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${lastDay}`;
        return { from, to };
    }, [selectedMonth, selectedYear]);

    const { data: infiniteData, isLoading, remove, isDeleting } = useTransaksi({
        page,
        per_page: 10,
        search: debouncedSearch,
        kategori: 'pengeluaran',
        from: dateRange.from,
        to: dateRange.to,
        unit_id: user?.unit_id || undefined,
    });

    // Fetch all transactions for total calculation (without pagination)
    const { data: infiniteAllData } = useTransaksi({
        page: 1, // Only first page needed if we assume infinite query structure, but logic might need adjustment if total is from all pages
        per_page: 9999, // Get all data for total calculation. Note: Infinite Query might still paginate if backend enforces it.
        kategori: 'pengeluaran',
        from: dateRange.from,
        to: dateRange.to,
        unit_id: user?.unit_id || undefined,
    });

    // Since we forced per_page 9999, we likely get all in first page.
    const transactions = useMemo(() => {
        return infiniteData?.pages.flatMap(page => page.data) || [];
    }, [infiniteData]);

    // Meta from first page (assuming basic pagination metadata is consistent or we only care about total)
    // Note: Infinite Query pagination works differently. If we want standard pagination UI (Prev/Next buttons), 
    // we should probably just use the 'page' state to fetch specific pages via InfiniteQuery's param 
    // OR just use pages[0] if we are treating it as "one page at a time" by manually controlling page param.
    // However, useInfiniteQuery appends pages.
    // If we want "Table Pagination" (Page 1, Page 2, Page 3), useInfiniteQuery is NOT the right tool if it accumulates data.
    // BUT since we pass 'page' to useTransaksi, and useTransaksi passes it to useInfiniteQuery...
    // useInfiniteQuery keys include 'filters'. If filters change (e.g. page changes), it creates a NEW query entry?
    // Actually, useTransaksi's key is QUERY_KEYS.TRANSAKSI.LIST(filters). 
    // If 'page' is in filters, then changing page triggers a fresh query, getting just that page.
    // So infiniteData.pages[0] will be the requested page.

    // Check useTransaksi implementation:
    // queryKey: QUERY_KEYS.TRANSAKSI.LIST(filters)
    // filters INCLUDE page.
    // So changing page creates a new cache key.
    // This effectively makes useInfiniteQuery behave like useQuery for single pages if we explicitly control page.
    const meta = infiniteData?.pages?.[0]?.meta;

    // Calculate total from ALL transactions in the month
    const totalPengeluaran = useMemo(() => {
        const allTransactions = infiniteAllData?.pages.flatMap(p => p.data) || [];
        return allTransactions.reduce((sum, item) => sum + (Number(item.jumlah) || 0), 0);
    }, [infiniteAllData]);

    // Generate year options
    const yearOptions = useMemo(() => {
        const currentYear = new Date().getFullYear();
        const years = [];
        for (let y = 2023; y <= currentYear; y++) {
            years.push(y);
        }
        return years;
    }, []);

    const handleDelete = async (id: number) => {
        try {
            await remove(id);
            setDeleteId(null);
        } catch (error) {
            console.error('Failed to delete transaction:', error);
            alert('Gagal menghapus transaksi');
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
                        <DollarSign className="w-8 h-8 text-[#0053C5]" />
                        Pengeluaran Kas Kecil
                    </h1>
                    <p className="text-gray-500 mt-1">Kelola transaksi pengeluaran kas kecil</p>
                </div>
                {user?.role?.name !== 'petugas' && (
                    <Button
                        onClick={() => navigate('/transaksi/create')}
                        className="bg-[#0053C5] hover:bg-[#0047AB] text-white shadow-lg shadow-[#0053C5]/20"
                    >
                        {/* @ts-ignore */}
                        <Plus className="w-4 h-4 mr-2" />
                        Tambah Pengeluaran
                    </Button>
                )}
            </div>

            {/* Filter Card */}
            <Card className="border-none shadow-lg bg-gradient-to-r from-[#0053C5]/5 to-transparent">
                <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {/* Month Filter */}
                        <div className="space-y-2">
                            <Label className="text-gray-700 font-medium">Bulan</Label>
                            <select
                                className="flex h-10 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0053C5]/20 focus:border-[#0053C5]"
                                value={selectedMonth}
                                onChange={(e) => {
                                    setSelectedMonth(Number(e.target.value));
                                    setPage(1);
                                }}
                            >
                                {MONTH_NAMES.slice(1).map((name, idx) => (
                                    <option key={idx + 1} value={idx + 1}>{name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Year Filter */}
                        <div className="space-y-2">
                            <Label className="text-gray-700 font-medium">Tahun</Label>
                            <select
                                className="flex h-10 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0053C5]/20 focus:border-[#0053C5]"
                                value={selectedYear}
                                onChange={(e) => {
                                    setSelectedYear(Number(e.target.value));
                                    setPage(1);
                                }}
                            >
                                {yearOptions.map((year) => (
                                    <option key={year} value={year}>{year}</option>
                                ))}
                            </select>
                        </div>

                        {/* Search */}
                        <div className="space-y-2 md:col-span-2">
                            <Label className="text-gray-700 font-medium">Pencarian</Label>
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    {/* @ts-ignore */}
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <Input
                                        placeholder="Cari keterangan, no bukti..."
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
                        <h2 className="text-lg font-semibold text-gray-900">Data Pengeluaran Kas Kecil</h2>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-sm font-medium">
                            Total: {meta?.total || 0} data
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
                                    <th className="px-6 py-4 text-left">Detail Transaksi</th>
                                    <th className="px-6 py-4 text-right">Jumlah</th>
                                    <th className="px-6 py-4 text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-16 text-center">
                                            <div className="flex flex-col items-center gap-3">
                                                {/* @ts-ignore */}
                                                <Loader2 className="w-8 h-8 animate-spin text-[#0053C5]" />
                                                <span className="text-gray-500">Memuat data...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : transactions.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-16 text-center">
                                            <div className="flex flex-col items-center gap-3">
                                                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                                                    {/* @ts-ignore */}
                                                    <FileText className="w-8 h-8 text-gray-400" />
                                                </div>
                                                <h3 className="font-semibold text-gray-700">Belum Ada Data</h3>
                                                <p className="text-gray-500 text-sm">
                                                    {debouncedSearch
                                                        ? 'Tidak ada data yang sesuai dengan pencarian Anda'
                                                        : 'Silakan tambahkan data pengeluaran kas kecil'
                                                    }
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    transactions.map((item, index) => {
                                        // Format date to dd/mm/yy
                                        const date = new Date(item.tanggal);
                                        const formattedDate = `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getFullYear()).slice(-2)}`;

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
                                                            {item.no_bukti && (
                                                                <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                                                                    {item.no_bukti}
                                                                </span>
                                                            )}
                                                            {item.kode_matanggaran && (
                                                                <span className="text-xs font-medium text-[#0053C5] bg-[#0053C5]/10 px-2 py-0.5 rounded">
                                                                    {item.kode_matanggaran}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <span className="text-sm text-gray-700 line-clamp-2">
                                                            {item.keterangan}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right font-semibold text-gray-900">
                                                    {formatCurrency(item.jumlah)}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center justify-center gap-1">
                                                        {item.lampiran && (
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8 text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                                                                title="Lihat Lampiran"
                                                                onClick={() => {
                                                                    const urls = [
                                                                        item.lampiran,
                                                                        item.lampiran2,
                                                                        item.lampiran3
                                                                    ].filter(Boolean) as string[];
                                                                    setViewLampiran({ urls, currentIndex: 0 });
                                                                }}
                                                            >
                                                                {/* @ts-ignore */}
                                                                <Image className="w-4 h-4" />
                                                            </Button>
                                                        )}
                                                        {user?.role?.name !== 'petugas' && (
                                                            <>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                                                    onClick={() => navigate(`/transaksi/${item.id}/edit`)}
                                                                    title="Edit"
                                                                >
                                                                    {/* @ts-ignore */}
                                                                    <Edit className="w-4 h-4" />
                                                                </Button>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                                                                    onClick={() => setDeleteId(item.id)}
                                                                    title="Hapus"
                                                                >
                                                                    {/* @ts-ignore */}
                                                                    <Trash2 className="w-4 h-4" />
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
                            {transactions.length > 0 && (
                                <tfoot>
                                    <tr className="bg-[#0053C5]/5 border-t-2 border-[#0053C5]">
                                        <th colSpan={3} className="px-6 py-4 text-center font-semibold text-[#0053C5]">
                                            Total Pengeluaran Bulan {MONTH_NAMES[selectedMonth]} {selectedYear}
                                        </th>
                                        <th colSpan={2} className="px-6 py-4 text-center font-bold text-[#0053C5] text-lg">
                                            {formatCurrency(totalPengeluaran)}
                                        </th>
                                    </tr>
                                </tfoot>
                            )}
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
            {
                deleteId && (
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
                                        onClick={() => handleDelete(deleteId)}
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
                )
            }

            {/* Lampiran Viewer Modal */}
            {
                viewLampiran && (
                    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50" onClick={() => setViewLampiran(null)}>
                        <div className="relative max-w-4xl w-full mx-4" onClick={(e) => e.stopPropagation()}>
                            {/* Close Button */}
                            <button
                                onClick={() => setViewLampiran(null)}
                                className="absolute -top-12 right-0 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                            >
                                {/* @ts-ignore */}
                                <X className="w-6 h-6" />
                            </button>

                            {/* Image */}
                            <div className="bg-white rounded-2xl p-4 shadow-2xl">
                                <img
                                    src={viewLampiran.urls[viewLampiran.currentIndex]}
                                    alt={`Lampiran ${viewLampiran.currentIndex + 1}`}
                                    className="w-full h-auto max-h-[70vh] object-contain rounded-lg"
                                />

                                {/* Navigation */}
                                {viewLampiran.urls.length > 1 && (
                                    <div className="flex items-center justify-between mt-4">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setViewLampiran(prev => prev ? {
                                                ...prev,
                                                currentIndex: Math.max(0, prev.currentIndex - 1)
                                            } : null)}
                                            disabled={viewLampiran.currentIndex === 0}
                                        >
                                            {/* @ts-ignore */}
                                            <ArrowLeft className="w-4 h-4 mr-1" />
                                            Sebelumnya
                                        </Button>
                                        <span className="text-sm text-gray-600">
                                            {viewLampiran.currentIndex + 1} / {viewLampiran.urls.length}
                                        </span>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setViewLampiran(prev => prev ? {
                                                ...prev,
                                                currentIndex: Math.min(prev.urls.length - 1, prev.currentIndex + 1)
                                            } : null)}
                                            disabled={viewLampiran.currentIndex === viewLampiran.urls.length - 1}
                                        >
                                            Selanjutnya
                                            {/* @ts-ignore */}
                                            <ArrowRight className="w-4 h-4 ml-1" />
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
}
