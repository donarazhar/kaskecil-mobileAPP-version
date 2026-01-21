import { useState } from 'react';
import { useUnit, useCabang } from '@kas-kecil/api-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Pencil, Trash2, Building2, Loader2, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatCurrency } from '@kas-kecil/shared';
import { cn } from '@/lib/utils';

const ITEMS_PER_PAGE = 5;

export default function UnitListPage() {
    const navigate = useNavigate();
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedCabang, setSelectedCabang] = useState<number | undefined>(undefined);
    const [deletingId, setDeletingId] = useState<number | null>(null);

    const { data: units, isLoading, remove } = useUnit(selectedCabang);
    const { data: cabangs } = useCabang();

    const filteredUnits = units.filter((unit) =>
        unit.nama_unit.toLowerCase().includes(search.toLowerCase()) ||
        unit.kode_unit.toLowerCase().includes(search.toLowerCase())
    );

    // Pagination
    const totalPages = Math.ceil(filteredUnits.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginatedUnits = filteredUnits.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    // Reset to page 1 when search/filter changes
    const handleSearch = (value: string) => {
        setSearch(value);
        setCurrentPage(1);
    };

    const handleFilterChange = (value: number | undefined) => {
        setSelectedCabang(value);
        setCurrentPage(1);
    };

    const handleDelete = async (id: number, nama: string) => {
        if (confirm(`Apakah Anda yakin ingin menghapus unit "${nama}"?\n\nUnit yang memiliki transaksi tidak dapat dihapus.`)) {
            setDeletingId(id);
            try {
                await remove(id);
            } catch (error: any) {
                console.error(error);
                alert(error?.response?.data?.message || 'Gagal menghapus unit.');
            } finally {
                setDeletingId(null);
            }
        }
    };

    // Find cabang name by id
    const getCabangName = (cabangId: number) => {
        const cabang = cabangs.find(c => c.id === cabangId);
        return cabang?.nama_cabang || '-';
    };

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Manajemen Unit</h1>
                    <p className="text-gray-500 mt-1">Kelola data unit dari setiap cabang</p>
                </div>
                <Button
                    onClick={() => navigate('/master/unit/create')}
                    className="bg-[#0053C5] hover:bg-[#0047AB] text-white shadow-lg shadow-[#0053C5]/20"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Tambah Unit
                </Button>
            </div>

            {/* Main Card */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {/* Toolbar */}
                <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                            placeholder="Cari kode atau nama unit..."
                            className="pl-11 h-11 bg-gray-50/80 border-gray-200 rounded-xl focus:bg-white"
                            value={search}
                            onChange={(e) => handleSearch(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <Filter size={16} className="text-gray-400" />
                            <select
                                className="h-11 px-4 rounded-xl border border-gray-200 bg-gray-50/80 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0053C5]/20"
                                value={selectedCabang || ''}
                                onChange={(e) => handleFilterChange(e.target.value ? Number(e.target.value) : undefined)}
                            >
                                <option value="">Semua Cabang</option>
                                {cabangs.map((cabang) => (
                                    <option key={cabang.id} value={cabang.id}>
                                        {cabang.nama_cabang}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="text-sm text-gray-500">
                            Total: <span className="font-semibold text-gray-900">{filteredUnits.length}</span> unit
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="w-8 h-8 animate-spin text-[#0053C5]" />
                        </div>
                    ) : filteredUnits.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                                <Building2 size={32} className="text-gray-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-1">Tidak ada data</h3>
                            <p className="text-gray-500 mb-4">Belum ada unit yang terdaftar</p>
                            <Button onClick={() => navigate('/master/unit/create')} className="bg-[#0053C5] hover:bg-[#0047AB]">
                                <Plus size={18} className="mr-2" />
                                Tambah Unit Pertama
                            </Button>
                        </div>
                    ) : (
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Kode</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Nama Unit</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Cabang</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Kepala Unit</th>
                                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Plafon Kas</th>
                                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {paginatedUnits.map((unit) => (
                                    <tr key={unit.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <span className="font-mono text-sm font-medium text-[#0053C5]">{unit.kode_unit}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-[#0053C5]/10 flex items-center justify-center">
                                                    <Building2 className="w-4 h-4 text-[#0053C5]" />
                                                </div>
                                                <span className="font-medium text-gray-900">{unit.nama_unit}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-gray-600">{getCabangName(unit.cabang_id)}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-gray-600">{unit.kepala_unit || '-'}</span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className="font-semibold text-gray-900">{formatCurrency(unit.plafon_kas || 0)}</span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={cn(
                                                "px-2.5 py-1 rounded-full text-xs font-medium",
                                                unit.is_active
                                                    ? "bg-emerald-100 text-emerald-700"
                                                    : "bg-red-100 text-red-700"
                                            )}>
                                                {unit.is_active ? 'Aktif' : 'Nonaktif'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-center gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-gray-400 hover:text-[#0053C5] hover:bg-[#0053C5]/10"
                                                    onClick={() => navigate(`/master/unit/${unit.id}/edit`)}
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-gray-400 hover:text-red-600 hover:bg-red-50"
                                                    onClick={() => handleDelete(unit.id, unit.nama_unit)}
                                                    disabled={deletingId === unit.id}
                                                >
                                                    {deletingId === unit.id ? (
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                    ) : (
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
                {filteredUnits.length > ITEMS_PER_PAGE && (
                    <div className="p-4 border-t border-gray-100 flex items-center justify-between">
                        <div className="text-sm text-gray-500">
                            Menampilkan {startIndex + 1}-{Math.min(startIndex + ITEMS_PER_PAGE, filteredUnits.length)} dari {filteredUnits.length} data
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                disabled={currentPage === 1}
                                className="h-9"
                            >
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
                                <ChevronRight size={16} className="ml-1" />
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
