import { useState, useEffect } from 'react';
import { useMaster } from '@kas-kecil/api-client';
import { masterService } from '@kas-kecil/api-client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Plus,
    Search,
    Pencil,
    Trash2,
    CreditCard,
    ArrowUp,
    ArrowDown,
    X,
    Loader2,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

const ITEMS_PER_PAGE = 5;

export default function AkunAASListPage() {
    const { user } = useAuth();
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAkun, setEditingAkun] = useState<any>(null);
    const [formData, setFormData] = useState({
        kode_akun: '',
        nama_akun: '',
        jenis: 'debet' as 'debet' | 'kredit',
        unit_id: 0
    });

    // Update formData unit_id when user loads (for display purposes only)
    useEffect(() => {
        if (user?.unit_id && formData.unit_id === 0) {
            setFormData(prev => ({ ...prev, unit_id: user.unit_id! }));
        }
    }, [user?.unit_id]);

    // useMaster - backend will automatically filter by user's unit_id for non-SuperAdmin
    const { akunAAS, isAkunAASLoading, createAkunAAS, updateAkunAAS } = useMaster();

    const filteredAkun = akunAAS.filter((akun) =>
        akun.nama_akun.toLowerCase().includes(search.toLowerCase()) ||
        akun.kode_akun.toLowerCase().includes(search.toLowerCase())
    );

    // Pagination
    const totalPages = Math.ceil(filteredAkun.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginatedAkun = filteredAkun.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    const handleSearch = (value: string) => {
        setSearch(value);
        setCurrentPage(1);
    };

    const handleOpenModal = (akun?: any) => {
        if (akun) {
            setEditingAkun(akun);
            setFormData({
                kode_akun: akun.kode_akun,
                nama_akun: akun.nama_akun,
                jenis: akun.jenis,
                unit_id: akun.unit_id
            });
        } else {
            setEditingAkun(null);
            setFormData({
                kode_akun: '',
                nama_akun: '',
                jenis: 'debet',
                unit_id: user?.unit_id ?? 0
            });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Get unit_id from user for create, from formData for edit
        const unitId = editingAkun ? formData.unit_id : user?.unit_id;

        // Validate unit_id
        if (!unitId) {
            alert('Unit ID tidak valid. Pastikan Anda sudah login sebagai Admin Unit.');
            return;
        }

        try {
            if (editingAkun) {
                await updateAkunAAS({ id: editingAkun.id, data: formData as any });
            } else {
                // Always use user's unit_id for create
                await createAkunAAS({ ...formData, unit_id: unitId } as any);
            }
            setIsModalOpen(false);
            setFormData({ kode_akun: '', nama_akun: '', jenis: 'debet', unit_id: user?.unit_id ?? 0 });
            setEditingAkun(null);
        } catch (error: any) {
            alert(error?.response?.data?.message || 'Gagal menyimpan akun');
        }
    };

    const handleDelete = async (id: number, nama: string) => {
        if (confirm(`Apakah Anda yakin ingin menghapus akun "${nama}"?`)) {
            try {
                await masterService.deleteAkunAAS(id);
                window.location.reload();
            } catch (error: any) {
                alert(error?.response?.data?.message || 'Gagal menghapus akun');
            }
        }
    };

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Akun AAS</h1>
                    <p className="text-gray-500 mt-1">Kelola master data akun akuntansi unit Anda</p>
                </div>
                <Button
                    onClick={() => handleOpenModal()}
                    className="bg-[#0053C5] hover:bg-[#0047AB] text-white shadow-lg shadow-[#0053C5]/20"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Tambah Akun
                </Button>
            </div>

            {/* Main Card */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {/* Toolbar */}
                <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row justify-between gap-4">
                    <div className="relative max-w-md flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                            placeholder="Cari kode atau nama akun..."
                            className="pl-11 h-11 bg-gray-50/80 border-gray-200 rounded-xl focus:bg-white"
                            value={search}
                            onChange={(e) => handleSearch(e.target.value)}
                        />
                    </div>
                    <div className="text-sm text-gray-500 self-center">
                        Total: <span className="font-semibold text-gray-900">{filteredAkun.length}</span> akun
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    {isAkunAASLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="w-8 h-8 animate-spin text-[#0053C5]" />
                        </div>
                    ) : filteredAkun.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                                <CreditCard size={32} className="text-gray-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-1">Tidak ada data</h3>
                            <p className="text-gray-500 mb-4">Belum ada akun AAS yang terdaftar</p>
                            <Button onClick={() => handleOpenModal()} className="bg-[#0053C5] hover:bg-[#0047AB]">
                                <Plus size={18} className="mr-2" />
                                Tambah Akun Pertama
                            </Button>
                        </div>
                    ) : (
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Kode Akun</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Nama Akun</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Jenis</th>
                                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {paginatedAkun.map((akun) => (
                                    <tr key={akun.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <span className="font-mono text-sm font-medium text-[#0053C5]">{akun.kode_akun}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="font-medium text-gray-900">{akun.nama_akun}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={cn(
                                                "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold capitalize",
                                                akun.jenis === 'debet' ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                                            )}>
                                                {akun.jenis === 'debet' ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
                                                {akun.jenis}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={cn(
                                                "px-2.5 py-1 rounded-full text-xs font-medium",
                                                akun.is_active ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                                            )}>
                                                {akun.is_active ? 'Aktif' : 'Nonaktif'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-center gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-gray-400 hover:text-[#0053C5] hover:bg-[#0053C5]/10"
                                                    onClick={() => handleOpenModal(akun)}
                                                >
                                                    <Pencil size={16} />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-gray-400 hover:text-red-600 hover:bg-red-50"
                                                    onClick={() => handleDelete(akun.id, akun.nama_akun)}
                                                >
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
                {filteredAkun.length > ITEMS_PER_PAGE && (
                    <div className="p-4 border-t border-gray-100 flex items-center justify-between">
                        <div className="text-sm text-gray-500">
                            Menampilkan {startIndex + 1}-{Math.min(startIndex + ITEMS_PER_PAGE, filteredAkun.length)} dari {filteredAkun.length} data
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

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/50" onClick={() => setIsModalOpen(false)} />
                    <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6 m-4">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-gray-900">
                                {editingAkun ? 'Edit Akun AAS' : 'Tambah Akun AAS'}
                            </h2>
                            <Button variant="ghost" size="icon" onClick={() => setIsModalOpen(false)}>
                                <X size={20} />
                            </Button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="kode_akun">Kode Akun <span className="text-red-500">*</span></Label>
                                <Input
                                    id="kode_akun"
                                    placeholder="Contoh: 1.1.1"
                                    value={formData.kode_akun}
                                    onChange={(e) => setFormData({ ...formData, kode_akun: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="nama_akun">Nama Akun <span className="text-red-500">*</span></Label>
                                <Input
                                    id="nama_akun"
                                    placeholder="Contoh: Kas Kecil"
                                    value={formData.nama_akun}
                                    onChange={(e) => setFormData({ ...formData, nama_akun: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="jenis">Jenis Akun <span className="text-red-500">*</span></Label>
                                <select
                                    id="jenis"
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    value={formData.jenis}
                                    onChange={(e) => setFormData({ ...formData, jenis: e.target.value as 'debet' | 'kredit' })}
                                >
                                    <option value="debet">Debet</option>
                                    <option value="kredit">Kredit</option>
                                </select>
                            </div>
                            <div className="flex justify-end gap-3 pt-4">
                                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                                    Batal
                                </Button>
                                <Button type="submit" className="bg-[#0053C5] hover:bg-[#0047AB]">
                                    {editingAkun ? 'Simpan' : 'Tambah'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
