import { useState } from 'react';
import { useMaster } from '@kas-kecil/api-client';
import { masterService } from '@kas-kecil/api-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Plus,
    Search,
    Pencil,
    Trash2,
    Wallet,
    X,
    Loader2,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

const ITEMS_PER_PAGE = 5;

// Format currency
const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(value);
};

export default function MataAnggaranListPage() {
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAnggaran, setEditingAnggaran] = useState<any>(null);
    const [formData, setFormData] = useState({
        kode_matanggaran: '',
        akun_aas_id: 0,
        saldo: 0
    });

    // Fetch Akun AAS and Mata Anggaran - backend will filter by user's unit_id for non-SuperAdmin
    const { akunAAS, isAkunAASLoading, mataAnggaran, isMataAnggaranLoading, createMataAnggaran, updateMataAnggaran } = useMaster();

    const filteredAnggaran = mataAnggaran.filter((anggaran) =>
        anggaran.nama_matanggaran?.toLowerCase().includes(search.toLowerCase()) ||
        anggaran.kode_matanggaran.toLowerCase().includes(search.toLowerCase())
    );

    // Pagination
    const totalPages = Math.ceil(filteredAnggaran.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginatedAnggaran = filteredAnggaran.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    const handleSearch = (value: string) => {
        setSearch(value);
        setCurrentPage(1);
    };

    const handleOpenModal = (anggaran?: any) => {
        if (anggaran) {
            setEditingAnggaran(anggaran);
            setFormData({
                kode_matanggaran: anggaran.kode_matanggaran,
                akun_aas_id: anggaran.akun_aas_id,
                saldo: anggaran.saldo || 0
            });
        } else {
            setEditingAnggaran(null);
            setFormData({
                kode_matanggaran: '',
                akun_aas_id: 0,
                saldo: 0
            });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate akun_aas_id is selected
        if (!formData.akun_aas_id) {
            alert('Silakan pilih Akun AAS terlebih dahulu.');
            return;
        }

        try {
            if (editingAnggaran) {
                await updateMataAnggaran({ id: editingAnggaran.id, data: formData as any });
            } else {
                await createMataAnggaran(formData as any);
            }
            setIsModalOpen(false);
            setFormData({
                kode_matanggaran: '',
                akun_aas_id: 0,
                saldo: 0
            });
            setEditingAnggaran(null);
        } catch (error: any) {
            alert(error?.response?.data?.message || 'Gagal menyimpan mata anggaran');
        }
    };

    const handleDelete = async (id: number, nama: string) => {
        if (confirm(`Apakah Anda yakin ingin menghapus mata anggaran "${nama}"?`)) {
            try {
                await masterService.deleteMataAnggaran(id);
                window.location.reload();
            } catch (error: any) {
                alert(error?.response?.data?.message || 'Gagal menghapus mata anggaran');
            }
        }
    };

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Mata Anggaran</h1>
                    <p className="text-gray-500 mt-1">Kelola master data mata anggaran unit Anda</p>
                </div>
                <Button
                    onClick={() => handleOpenModal()}
                    className="bg-[#0053C5] hover:bg-[#0047AB] text-white shadow-lg shadow-[#0053C5]/20"
                >
                    {/* @ts-ignore */}
                    <Plus className="w-4 h-4 mr-2" />
                    Tambah Mata Anggaran
                </Button>
            </div>

            {/* Main Card */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {/* Toolbar */}
                <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row justify-between gap-4">
                    <div className="relative max-w-md flex-1">
                        {/* @ts-ignore */}
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                            placeholder="Cari kode atau nama mata anggaran..."
                            className="pl-11 h-11 bg-gray-50/80 border-gray-200 rounded-xl focus:bg-white"
                            value={search}
                            onChange={(e) => handleSearch(e.target.value)}
                        />
                    </div>
                    <div className="text-sm text-gray-500 self-center">
                        Total: <span className="font-semibold text-gray-900">{filteredAnggaran.length}</span> mata anggaran
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    {isMataAnggaranLoading ? (
                        <div className="flex items-center justify-center py-12">
                            {/* @ts-ignore */}
                            <Loader2 className="w-8 h-8 animate-spin text-[#0053C5]" />
                        </div>
                    ) : filteredAnggaran.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                                {/* @ts-ignore */}
                                <Wallet size={32} className="text-gray-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-1">Tidak ada data</h3>
                            <p className="text-gray-500 mb-4">Belum ada mata anggaran yang terdaftar</p>
                            <Button onClick={() => handleOpenModal()} className="bg-[#0053C5] hover:bg-[#0047AB]">
                                {/* @ts-ignore */}
                                <Plus size={18} className="mr-2" />
                                Tambah Mata Anggaran Pertama
                            </Button>
                        </div>
                    ) : (
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Mata Anggaran</th>
                                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Saldo</th>
                                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {paginatedAnggaran.map((anggaran) => (
                                    <tr key={anggaran.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-mono text-sm font-semibold text-[#0053C5]">{anggaran.kode_matanggaran}</span>
                                                    <span className="text-xs text-gray-400">•</span>
                                                    <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                                                        {anggaran.akun_aas?.kode_akun || '-'}
                                                    </span>
                                                </div>
                                                <span className="text-sm text-gray-700 font-medium">
                                                    {anggaran.akun_aas?.nama_akun || '-'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className="font-medium text-emerald-600">{formatCurrency(Number(anggaran.saldo || 0))}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-center gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-gray-400 hover:text-[#0053C5] hover:bg-[#0053C5]/10"
                                                    onClick={() => handleOpenModal(anggaran)}
                                                >
                                                    {/* @ts-ignore */}
                                                    <Pencil size={16} />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-gray-400 hover:text-red-600 hover:bg-red-50"
                                                    onClick={() => handleDelete(anggaran.id, anggaran.akun_aas?.nama_akun || anggaran.kode_matanggaran)}
                                                >
                                                    {/* @ts-ignore */}
                                                    <Trash2 size={16} />
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
                {filteredAnggaran.length > ITEMS_PER_PAGE && (
                    <div className="p-4 border-t border-gray-100 flex items-center justify-between">
                        <div className="text-sm text-gray-500">
                            Menampilkan {startIndex + 1}-{Math.min(startIndex + ITEMS_PER_PAGE, filteredAnggaran.length)} dari {filteredAnggaran.length} data
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

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/50" onClick={() => setIsModalOpen(false)} />
                    <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6 m-4">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-gray-900">
                                {editingAnggaran ? 'Edit Mata Anggaran' : 'Tambah Mata Anggaran'}
                            </h2>
                            <Button variant="ghost" size="icon" onClick={() => setIsModalOpen(false)}>
                                {/* @ts-ignore */}
                                <X size={20} />
                            </Button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="kode_aas">Akun AAS <span className="text-red-500">*</span></Label>
                                <select
                                    id="akun_aas_id"
                                    className="w-full h-10 px-3 rounded-md border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#0053C5] focus:border-transparent"
                                    value={formData.akun_aas_id}
                                    onChange={(e) => setFormData({ ...formData, akun_aas_id: Number(e.target.value) })}
                                    required
                                    disabled={isAkunAASLoading}
                                >
                                    <option value="0">-- Pilih Akun AAS --</option>
                                    {akunAAS.map((akun) => (
                                        <option key={akun.id} value={akun.id}>
                                            [{akun.kode_akun}] {akun.nama_akun}
                                        </option>
                                    ))}
                                </select>
                                {isAkunAASLoading && (
                                    <p className="text-xs text-gray-500">Memuat data Akun AAS...</p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="kode_matanggaran">Kode Mata Anggaran <span className="text-red-500">*</span></Label>
                                <Input
                                    id="kode_matanggaran"
                                    placeholder="Contoh: MA-ATK-001"
                                    value={formData.kode_matanggaran}
                                    onChange={(e) => setFormData({ ...formData, kode_matanggaran: e.target.value })}
                                    required
                                    maxLength={25}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="saldo">Saldo Awal</Label>
                                <Input
                                    id="saldo"
                                    type="number"
                                    placeholder="Contoh: 0"
                                    value={formData.saldo}
                                    onChange={(e) => setFormData({ ...formData, saldo: Number(e.target.value) })}
                                    min={0}
                                />
                                <p className="text-xs text-gray-500">Opsional - default: 0</p>
                            </div>
                            <div className="flex justify-end gap-3 pt-4">
                                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                                    Batal
                                </Button>
                                <Button type="submit" className="bg-[#0053C5] hover:bg-[#0047AB]">
                                    {editingAnggaran ? 'Simpan' : 'Tambah'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
