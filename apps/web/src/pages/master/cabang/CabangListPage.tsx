import { useState } from 'react';
import { useCabang } from '@kas-kecil/api-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Pencil, Trash2, Building, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

import { BranchMap } from '@/components/maps/BranchMap';

const ITEMS_PER_PAGE = 5;

export default function CabangListPage() {
    const navigate = useNavigate();
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [showMap, setShowMap] = useState(true);

    const { data: cabangs, isLoading, remove } = useCabang();

    const filteredCabangs = cabangs.filter((cabang) =>
        cabang.nama_cabang.toLowerCase().includes(search.toLowerCase()) ||
        cabang.kode_cabang.toLowerCase().includes(search.toLowerCase())
    );

    // Pagination
    const totalPages = Math.ceil(filteredCabangs.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginatedCabangs = filteredCabangs.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    // Reset to page 1 when search changes
    const handleSearch = (value: string) => {
        setSearch(value);
        setCurrentPage(1);
    };

    const handleDelete = async (id: number, nama: string) => {
        if (confirm(`Apakah Anda yakin ingin menghapus cabang "${nama}"?\n\nCabang yang sudah memiliki unit tidak dapat dihapus.`)) {
            setDeletingId(id);
            try {
                await remove(id);
            } catch (error: any) {
                console.error(error);
                alert(error?.response?.data?.message || 'Gagal menghapus cabang. Pastikan cabang tidak memiliki unit.');
            } finally {
                setDeletingId(null);
            }
        }
    };

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Manajemen Cabang</h1>
                    <p className="text-gray-500 mt-1">Kelola data cabang instansi</p>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        onClick={() => setShowMap(!showMap)}
                        className={cn(showMap && "bg-blue-50 border-blue-200 text-blue-700")}
                    >
                        {showMap ? 'Sembunyikan Peta' : 'Tampilkan Peta'}
                    </Button>
                    <Button
                        onClick={() => navigate('/master/cabang/create')}
                        className="bg-[#0053C5] hover:bg-[#0047AB] text-white shadow-lg shadow-[#0053C5]/20"
                    >
                        {/* @ts-ignore */}
                        <Plus className="w-4 h-4 mr-2" />
                        Tambah Cabang
                    </Button>
                </div>
            </div>

            {/* Map Visualization */}
            {showMap && !isLoading && cabangs.length > 0 && (
                <div className="animate-in fade-in slide-in-from-top-4 duration-500">
                    <BranchMap branches={filteredCabangs} />
                </div>
            )}

            {/* Main Card */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {/* Toolbar */}
                <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row justify-between gap-4">
                    <div className="relative max-w-md flex-1">
                        {/* @ts-ignore */}
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                            placeholder="Cari kode atau nama cabang..."
                            className="pl-11 h-11 bg-gray-50/80 border-gray-200 rounded-xl focus:bg-white"
                            value={search}
                            onChange={(e) => handleSearch(e.target.value)}
                        />
                    </div>
                    <div className="text-sm text-gray-500 self-center">
                        Total: <span className="font-semibold text-gray-900">{filteredCabangs.length}</span> cabang
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            {/* @ts-ignore */}
                            <Loader2 className="w-8 h-8 animate-spin text-[#0053C5]" />
                        </div>
                    ) : filteredCabangs.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                                {/* @ts-ignore */}
                                <Building size={32} className="text-gray-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-1">Tidak ada data</h3>
                            <p className="text-gray-500 mb-4">Belum ada cabang yang terdaftar</p>
                            <Button onClick={() => navigate('/master/cabang/create')} className="bg-[#0053C5] hover:bg-[#0047AB]">
                                {/* @ts-ignore */}
                                <Plus size={18} className="mr-2" />
                                Tambah Cabang Pertama
                            </Button>
                        </div>
                    ) : (
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Kode</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Nama Cabang</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Alamat</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Telepon</th>
                                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {paginatedCabangs.map((cabang) => (
                                    <tr key={cabang.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <span className="font-mono text-sm font-medium text-[#0053C5]">{cabang.kode_cabang}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-[#0053C5]/10 flex items-center justify-center">
                                                    {/* @ts-ignore */}
                                                    <Building className="w-4 h-4 text-[#0053C5]" />
                                                </div>
                                                <span className="font-medium text-gray-900">{cabang.nama_cabang}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-gray-600 line-clamp-1">{cabang.alamat || '-'}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-gray-600">{cabang.telepon || '-'}</span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={cn(
                                                "px-2.5 py-1 rounded-full text-xs font-medium",
                                                cabang.is_active
                                                    ? "bg-emerald-100 text-emerald-700"
                                                    : "bg-red-100 text-red-700"
                                            )}>
                                                {cabang.is_active ? 'Aktif' : 'Nonaktif'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-center gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-gray-400 hover:text-[#0053C5] hover:bg-[#0053C5]/10"
                                                    onClick={() => navigate(`/master/cabang/${cabang.id}/edit`)}
                                                >
                                                    {/* @ts-ignore */}
                                                    <Pencil className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-gray-400 hover:text-red-600 hover:bg-red-50"
                                                    onClick={() => handleDelete(cabang.id, cabang.nama_cabang)}
                                                    disabled={deletingId === cabang.id}
                                                >
                                                    {deletingId === cabang.id ? (
                                                        // @ts-ignore
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                    ) : (
                                                        // @ts-ignore
                                                        <Trash2 className="w-4 h-4" />
                                                    )}
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Pagination */}
                {filteredCabangs.length > ITEMS_PER_PAGE && (
                    <div className="p-4 border-t border-gray-100 flex items-center justify-between">
                        <div className="text-sm text-gray-500">
                            Menampilkan {startIndex + 1}-{Math.min(startIndex + ITEMS_PER_PAGE, filteredCabangs.length)} dari {filteredCabangs.length} data
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                disabled={currentPage === 1}
                                className="h-9"
                            >
                                {/* @ts-ignore */}
                                <ChevronLeft size={16} className="mr-1" />
                                Prev
                            </Button>
                            <div className="flex items-center gap-1">
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                    <Button
                                        key={page}
                                        variant={currentPage === page ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => setCurrentPage(page)}
                                        className={cn(
                                            "h-9 w-9",
                                            currentPage === page && "bg-[#0053C5] hover:bg-[#0047AB]"
                                        )}
                                    >
                                        {page}
                                    </Button>
                                ))}
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                disabled={currentPage === totalPages}
                                className="h-9"
                            >
                                Next
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
