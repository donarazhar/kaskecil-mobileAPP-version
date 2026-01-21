import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useDraft, useDraftDetail, useMaster } from '@kas-kecil/api-client';
import { ArrowLeft, Loader2, Save, Wallet } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';

export default function PengisianEditPage() {
    const navigate = useNavigate();
    const { id } = useParams();
    const draftId = Number(id);

    const { update, isUpdating } = useDraft();
    const { data: draft, isLoading: isLoadingDetail } = useDraftDetail(draftId);
    const { user } = useAuth();
    const { mataAnggaran, isMataAnggaranLoading } = useMaster({
        unit_id: user?.unit?.id
    });

    const [formData, setFormData] = useState({
        tanggal: '',
        keterangan: '',
        jumlah: '',
        kode_matanggaran: '',
    });

    // Load existing data
    useEffect(() => {
        if (draft) {
            setFormData({
                tanggal: draft.tanggal || '',
                keterangan: draft.keterangan || '',
                jumlah: draft.jumlah?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') || '',
                kode_matanggaran: draft.kode_matanggaran || '',
            });
        }
    }, [draft]);

    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.keterangan || !formData.jumlah || !formData.tanggal) {
            alert('Tanggal, perincian, dan jumlah wajib diisi');
            return;
        }

        if (!formData.kode_matanggaran) {
            alert('Mata Anggaran wajib dipilih');
            return;
        }

        try {
            const payload: any = {
                ...formData,
                jumlah: parseFloat(formData.jumlah.replace(/\./g, '').replace(',', '.')) || 0,
            };

            await update({ id: draftId, data: payload });
            navigate('/pengisian');
        } catch (error: any) {
            console.error('Error updating pengisian:', error);
            alert(error?.response?.data?.message || 'Gagal mengupdate data pengisian');
        }
    };

    const formatCurrency = (value: string) => {
        const number = value.replace(/\D/g, '');
        return new Intl.NumberFormat('id-ID').format(Number(number));
    };

    const handleJumlahChange = (value: string) => {
        const formatted = formatCurrency(value);
        handleChange('jumlah', formatted);
    };

    if (isLoadingDetail) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-8 h-8 animate-spin text-[#0053C5]" />
                    <span className="text-gray-500">Memuat data...</span>
                </div>
            </div>
        );
    }

    if (!draft) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Data tidak ditemukan</h3>
                    <Button onClick={() => navigate('/pengisian')}>
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Kembali
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex items-center gap-4">
                <Button
                    variant="outline"
                    size="icon"
                    onClick={() => navigate('/pengisian')}
                    className="shrink-0"
                >
                    <ArrowLeft className="w-4 h-4" />
                </Button>
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
                        <Wallet className="w-8 h-8 text-[#0053C5]" />
                        Edit Pengisian Kas
                    </h1>
                    <p className="text-gray-500 mt-1">Ubah data transaksi pengisian kas kecil</p>
                </div>
            </div>

            {/* Form Card */}
            <Card className="border-none shadow-xl">
                <CardHeader className="border-b border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-900">Informasi Pengisian</h2>
                </CardHeader>
                <CardContent className="p-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Mata Anggaran - Only show 1.1.2 Pengisian Kas */}
                        <div className="space-y-2">
                            <Label htmlFor="kode_matanggaran" className="text-gray-700 font-medium">
                                Mata Anggaran <span className="text-red-500">*</span>
                            </Label>
                            <select
                                id="kode_matanggaran"
                                className="flex h-10 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0053C5]/20 focus:border-[#0053C5]"
                                value={formData.kode_matanggaran}
                                onChange={(e) => handleChange('kode_matanggaran', e.target.value)}
                                required
                            >
                                <option value="">- Pilih Mata Anggaran -</option>
                                {isMataAnggaranLoading ? (
                                    <option disabled>Memuat...</option>
                                ) : (
                                    mataAnggaran
                                        .filter((ma: any) => {
                                            // Hanya tampilkan mata anggaran dengan akun 1.1.2 (Pengisian Kas)
                                            return ma.akun_aas?.kode_akun === '1.1.2';
                                        })
                                        .map((ma: any) => (
                                            <option key={ma.id} value={ma.kode_matanggaran}>
                                                {ma.kode_matanggaran} - {ma.akun_aas?.nama_akun || '-'}
                                            </option>
                                        ))
                                )}
                            </select>
                            <p className="text-xs text-gray-500">Mata anggaran untuk pengisian kas</p>
                        </div>

                        {/* Tanggal */}
                        <div className="space-y-2">
                            <Label htmlFor="tanggal" className="text-gray-700 font-medium">
                                Tanggal <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="tanggal"
                                type="date"
                                value={formData.tanggal}
                                onChange={(e) => handleChange('tanggal', e.target.value)}
                                className="border-gray-200 focus:ring-[#0053C5]/20 focus:border-[#0053C5]"
                                required
                            />
                        </div>

                        {/* Perincian */}
                        <div className="space-y-2">
                            <Label htmlFor="keterangan" className="text-gray-700 font-medium">
                                Perincian <span className="text-red-500">*</span>
                            </Label>
                            <textarea
                                id="keterangan"
                                rows={4}
                                className="flex w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0053C5]/20 focus:border-[#0053C5]"
                                placeholder="Masukkan perincian transaksi pengisian..."
                                value={formData.keterangan}
                                onChange={(e) => handleChange('keterangan', e.target.value)}
                                required
                            />
                        </div>

                        {/* Jumlah */}
                        <div className="space-y-2">
                            <Label htmlFor="jumlah" className="text-gray-700 font-medium">
                                Jumlah (Rp) <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="jumlah"
                                type="text"
                                placeholder="0"
                                value={formData.jumlah}
                                onChange={(e) => handleJumlahChange(e.target.value)}
                                className="border-gray-200 focus:ring-[#0053C5]/20 focus:border-[#0053C5]"
                                required
                            />
                            {formData.jumlah && (
                                <p className="text-sm text-gray-500">
                                    Rp {formData.jumlah}
                                </p>
                            )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3 pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => navigate('/pengisian')}
                                className="flex-1"
                                disabled={isUpdating}
                            >
                                Batal
                            </Button>
                            <Button
                                type="submit"
                                className="flex-1 bg-[#0053C5] hover:bg-[#0047AB] text-white"
                                disabled={isUpdating}
                            >
                                {isUpdating ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Menyimpan...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4 mr-2" />
                                        Simpan Perubahan
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
