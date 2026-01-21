import { useState } from 'react';
import { useDraft } from '@kas-kecil/api-client';
import { formatCurrency, formatDate } from '@kas-kecil/shared';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, FileText, ArrowLeft, ArrowRight, Check, X, Send } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

export default function DraftListPage() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<'draft' | 'pending' | 'approved' | 'rejected' | undefined>(undefined);

    // Debounce search
    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value);
        const timeoutId = setTimeout(() => {
            setDebouncedSearch(e.target.value);
            setPage(1); // Reset to first page
        }, 500);
        return () => clearTimeout(timeoutId);
    };

    const { data, isLoading, submit, approve, reject, isSubmitting, isApproving, isRejecting, refetch } = useDraft({
        page,
        per_page: 10,
        search: debouncedSearch,
        status: statusFilter,
    });

    const drafts = data?.data || [];
    const meta = data?.meta;
    const links = data?.links;

    const handleAction = async (action: 'submit' | 'approve' | 'reject', id: number) => {
        try {
            if (action === 'submit') {
                if (confirm('Ajukan draft ini?')) await submit(id);
            } else if (action === 'approve') {
                if (confirm('Setujui pengajuan ini?')) await approve({ id });
            } else if (action === 'reject') {
                const reason = prompt('Masukkan alasan penolakan:');
                if (reason !== null) await reject({ id, data: { catatan: reason } });
            }
            refetch(); // Refresh list
        } catch (error) {
            console.error(error);
            alert('Gagal memproses draft');
        }
    };

    // Helper to check permissions (simplified)
    const canApprove = ['admin_cabang', 'admin_unit', 'super_admin'].includes(user?.role?.name || '');

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Pengajuan (Draft)</h1>
                    <p className="text-gray-500 mt-1">Kelola draft dan persetujuan transaksi</p>
                </div>
                <Button onClick={() => navigate('/drafts/create')} className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20">
                    <Plus className="w-4 h-4 mr-2" />
                    Buat Pengajuan
                </Button>
            </div>

            <Card className="border-none shadow-xl bg-white/50 backdrop-blur-sm">
                <CardHeader className="pb-4">
                    <div className="flex flex-col md:flex-row gap-4 justify-between">
                        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
                            {[
                                { label: 'Semua', value: undefined },
                                { label: 'Draft', value: 'draft' },
                                { label: 'Menunggu', value: 'pending' },
                                { label: 'Disetujui', value: 'approved' },
                                { label: 'Ditolak', value: 'rejected' },
                            ].map((tab) => (
                                <Button
                                    key={tab.label}
                                    variant={statusFilter === tab.value ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => {
                                        setStatusFilter(tab.value as any);
                                        setPage(1);
                                    }}
                                    className={statusFilter === tab.value ? "bg-blue-600" : "text-gray-600"}
                                >
                                    {tab.label}
                                </Button>
                            ))}
                        </div>
                        <div className="relative w-full md:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <Input
                                placeholder="Cari draft..."
                                className="pl-9 bg-white"
                                value={search}
                                onChange={handleSearch}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="rounded-lg border bg-white overflow-hidden">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-gray-600 font-medium border-b">
                                <tr>
                                    <th className="px-6 py-4">Tanggal</th>
                                    <th className="px-6 py-4">Keterangan</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">Jumlah</th>
                                    <th className="px-6 py-4 text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                            Memuat data...
                                        </td>
                                    </tr>
                                ) : drafts.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                            Tidak ada data pengajuan.
                                        </td>
                                    </tr>
                                ) : (
                                    drafts.map((item) => (
                                        <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 text-gray-600">
                                                {formatDate(item.tanggal)}
                                            </td>
                                            <td className="px-6 py-4 text-gray-600">
                                                {item.keterangan}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                                                    ${item.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                                                        item.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                            item.status === 'approved' ? 'bg-green-100 text-green-800' :
                                                                'bg-red-100 text-red-800'}`}>
                                                    {item.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right font-medium text-gray-900">
                                                {formatCurrency(item.jumlah)}
                                            </td>
                                            <td className="px-6 py-4 text-center flex justify-center gap-1">
                                                {item.status === 'draft' && (
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="text-blue-600 hover:bg-blue-50"
                                                        title="Ajukan"
                                                        onClick={() => handleAction('submit', item.id)}
                                                        disabled={isSubmitting}
                                                    >
                                                        <Send className="w-4 h-4" />
                                                    </Button>
                                                )}
                                                {item.status === 'pending' && canApprove && (
                                                    <>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="text-green-600 hover:bg-green-50"
                                                            title="Setujui"
                                                            onClick={() => handleAction('approve', item.id)}
                                                            disabled={isApproving}
                                                        >
                                                            <Check className="w-4 h-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="text-red-600 hover:bg-red-50"
                                                            title="Tolak"
                                                            onClick={() => handleAction('reject', item.id)}
                                                            disabled={isRejecting}
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </Button>
                                                    </>
                                                )}
                                                <Button variant="ghost" size="icon" className="text-gray-400 hover:text-blue-600" title="Detail">
                                                    <FileText className="w-4 h-4" />
                                                </Button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {meta && links && (
                        <div className="flex items-center justify-between mt-6">
                            <p className="text-sm text-gray-500">
                                Menampilkan {meta.from || 0} sampai {meta.to || 0} dari {meta.total} data
                            </p>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={!links.prev}
                                    className="h-8 w-8 p-0"
                                >
                                    <ArrowLeft className="w-4 h-4" />
                                </Button>
                                <span className="text-sm font-medium text-gray-600">
                                    Halaman {meta.current_page}
                                </span>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPage(p => p + 1)}
                                    disabled={!links.next}
                                    className="h-8 w-8 p-0"
                                >
                                    <ArrowRight className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
