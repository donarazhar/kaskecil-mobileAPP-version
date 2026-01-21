import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTransaksi, useMaster } from '@kas-kecil/api-client';
import { ArrowLeft, Loader2, Save, DollarSign, X, ImageIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';

interface FilePreview {
    file: File;
    url: string;
}

export default function TransaksiCreatePage() {
    const navigate = useNavigate();
    const { create, isCreating } = useTransaksi();
    const { user } = useAuth();
    const { mataAnggaran, isMataAnggaranLoading } = useMaster({
        unit_id: user?.unit?.id
    });

    const [isSaving, setIsSaving] = useState(false);
    const [formData, setFormData] = useState({
        tanggal: new Date().toISOString().split('T')[0],
        no_bukti: '',
        keterangan: '',
        jumlah: '',
        kode_matanggaran: '',
        kategori: 'pengeluaran' as const,
        cabang_id: user?.cabang?.id || 0,
        unit_id: user?.unit?.id || undefined,
    });

    const [files, setFiles] = useState<{
        lampiran?: FilePreview;
        lampiran2?: FilePreview;
        lampiran3?: FilePreview;
    }>({});

    // Update cabang_id when user loads
    useEffect(() => {
        if (user?.cabang?.id) {
            setFormData(prev => ({
                ...prev,
                cabang_id: user.cabang!.id,
                unit_id: user.unit?.id,
            }));
        }
    }, [user]);

    const handleChange = (field: string, value: string | number) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleFileChange = (field: 'lampiran' | 'lampiran2' | 'lampiran3', e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Revoke previous URL if exists
            if (files[field]?.url) {
                URL.revokeObjectURL(files[field]!.url);
            }
            setFiles(prev => ({
                ...prev,
                [field]: {
                    file,
                    url: URL.createObjectURL(file),
                }
            }));
        }
    };

    const removeFile = (field: 'lampiran' | 'lampiran2' | 'lampiran3') => {
        if (files[field]?.url) {
            URL.revokeObjectURL(files[field]!.url);
        }
        setFiles(prev => {
            const newFiles = { ...prev };
            delete newFiles[field];
            return newFiles;
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.keterangan || !formData.jumlah || !formData.tanggal) {
            alert('Tanggal, keterangan, dan jumlah wajib diisi');
            return;
        }

        setIsSaving(true);
        try {
            const payload: any = {
                ...formData,
                jumlah: parseFloat(formData.jumlah.replace(/\./g, '').replace(',', '.')) || 0,
            };

            // Add files
            if (files.lampiran) payload.lampiran = files.lampiran.file;
            if (files.lampiran2) payload.lampiran2 = files.lampiran2.file;
            if (files.lampiran3) payload.lampiran3 = files.lampiran3.file;

            await create(payload);
            navigate('/transaksi');
        } catch (error: any) {
            console.error('Failed to create transaction:', error);
            alert(error?.response?.data?.message || 'Gagal menyimpan transaksi');
        } finally {
            setIsSaving(false);
        }
    };

    // Cleanup URLs on unmount
    useEffect(() => {
        return () => {
            Object.values(files).forEach(f => {
                if (f?.url) URL.revokeObjectURL(f.url);
            });
        };
    }, []);

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            {/* Back Button */}
            <Button
                variant="ghost"
                className="pl-0 hover:pl-2 transition-all"
                onClick={() => navigate('/transaksi')}
            >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Kembali ke Daftar Pengeluaran
            </Button>

            {/* Page Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                    Tambah Pengeluaran Baru
                </h1>
                <p className="text-gray-500 mt-1">
                    Catat transaksi pengeluaran kas kecil
                </p>
            </div>

            {/* Form Card */}
            <Card className="border-none shadow-xl bg-white overflow-hidden">
                {/* Header */}
                <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-[#0053C5]/5 to-transparent">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-[#0053C5] flex items-center justify-center text-white">
                            <DollarSign size={24} />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900">Data Pengeluaran</h2>
                            <p className="text-sm text-gray-500">Lengkapi informasi transaksi</p>
                        </div>
                    </div>
                </CardHeader>

                {/* Form */}
                <CardContent className="p-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Mata Anggaran Select */}
                        <div className="space-y-2">
                            <Label htmlFor="kode_matanggaran">Mata Anggaran</Label>
                            <select
                                id="kode_matanggaran"
                                className="flex h-11 w-full rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0053C5]/20 focus:border-[#0053C5]"
                                value={formData.kode_matanggaran}
                                onChange={(e) => handleChange('kode_matanggaran', e.target.value)}
                            >
                                <option value="">- Pilih Mata Anggaran -</option>
                                {isMataAnggaranLoading ? (
                                    <option disabled>Memuat...</option>
                                ) : (
                                    mataAnggaran
                                        .filter((ma: any) => {
                                            // Filter out akun 1.1.1 (Pembentukan Kas) dan 1.1.2 (Pengisian Kas)
                                            const kodeAkun = ma.akun_aas?.kode_akun;
                                            return kodeAkun !== '1.1.1' && kodeAkun !== '1.1.2';
                                        })
                                        .map((ma: any) => (
                                            <option key={ma.id} value={ma.kode_matanggaran}>
                                                {ma.kode_matanggaran} - {ma.akun_aas?.nama_akun || '-'}
                                            </option>
                                        ))
                                )}
                            </select>
                            <p className="text-xs text-gray-500">Pilih kode mata anggaran untuk pengeluaran ini</p>
                        </div>

                        {/* Tanggal */}
                        <div className="space-y-2">
                            <Label htmlFor="tanggal">Tanggal <span className="text-red-500">*</span></Label>
                            <Input
                                id="tanggal"
                                type="date"
                                value={formData.tanggal}
                                onChange={(e) => handleChange('tanggal', e.target.value)}
                                className="h-11"
                                required
                            />
                        </div>

                        {/* Jumlah */}
                        <div className="space-y-2">
                            <Label htmlFor="jumlah">Jumlah (Rp) <span className="text-red-500">*</span></Label>
                            <Input
                                id="jumlah"
                                type="text"
                                placeholder="0"
                                value={formData.jumlah}
                                onChange={(e) => {
                                    // Format number with thousand separator
                                    const value = e.target.value.replace(/[^\d]/g, '');
                                    const formatted = value.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
                                    handleChange('jumlah', formatted);
                                }}
                                className="h-11 text-lg font-medium"
                                required
                            />
                        </div>

                        {/* Keterangan */}
                        <div className="space-y-2">
                            <Label htmlFor="keterangan">Keterangan/Perincian <span className="text-red-500">*</span></Label>
                            <textarea
                                id="keterangan"
                                placeholder="Masukkan perincian transaksi..."
                                value={formData.keterangan}
                                onChange={(e) => handleChange('keterangan', e.target.value)}
                                className="flex min-h-[100px] w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0053C5]/20 focus:border-[#0053C5] resize-none"
                                required
                            />
                        </div>

                        {/* Lampiran */}
                        <div className="space-y-4">
                            <Label>Lampiran (Maks 3 file)</Label>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {/* Lampiran 1 */}
                                <div className="space-y-2">
                                    {files.lampiran ? (
                                        <div className="relative rounded-lg overflow-hidden border border-gray-200">
                                            <img
                                                src={files.lampiran.url}
                                                alt="Preview 1"
                                                className="w-full h-32 object-cover"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeFile('lampiran')}
                                                className="absolute top-2 right-2 p-1 rounded-full bg-red-500 text-white hover:bg-red-600"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                            <p className="p-2 text-xs text-gray-600 truncate">{files.lampiran.file.name}</p>
                                        </div>
                                    ) : (
                                        <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-gray-200 rounded-lg cursor-pointer hover:border-[#0053C5] hover:bg-[#0053C5]/5 transition-colors">
                                            <ImageIcon className="w-8 h-8 text-gray-400 mb-2" />
                                            <span className="text-sm text-gray-500">Pilih File 1</span>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={(e) => handleFileChange('lampiran', e)}
                                            />
                                        </label>
                                    )}
                                </div>

                                {/* Lampiran 2 */}
                                <div className="space-y-2">
                                    {files.lampiran2 ? (
                                        <div className="relative rounded-lg overflow-hidden border border-gray-200">
                                            <img
                                                src={files.lampiran2.url}
                                                alt="Preview 2"
                                                className="w-full h-32 object-cover"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeFile('lampiran2')}
                                                className="absolute top-2 right-2 p-1 rounded-full bg-red-500 text-white hover:bg-red-600"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                            <p className="p-2 text-xs text-gray-600 truncate">{files.lampiran2.file.name}</p>
                                        </div>
                                    ) : (
                                        <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-gray-200 rounded-lg cursor-pointer hover:border-[#0053C5] hover:bg-[#0053C5]/5 transition-colors">
                                            <ImageIcon className="w-8 h-8 text-gray-400 mb-2" />
                                            <span className="text-sm text-gray-500">Pilih File 2</span>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={(e) => handleFileChange('lampiran2', e)}
                                            />
                                        </label>
                                    )}
                                </div>

                                {/* Lampiran 3 */}
                                <div className="space-y-2">
                                    {files.lampiran3 ? (
                                        <div className="relative rounded-lg overflow-hidden border border-gray-200">
                                            <img
                                                src={files.lampiran3.url}
                                                alt="Preview 3"
                                                className="w-full h-32 object-cover"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeFile('lampiran3')}
                                                className="absolute top-2 right-2 p-1 rounded-full bg-red-500 text-white hover:bg-red-600"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                            <p className="p-2 text-xs text-gray-600 truncate">{files.lampiran3.file.name}</p>
                                        </div>
                                    ) : (
                                        <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-gray-200 rounded-lg cursor-pointer hover:border-[#0053C5] hover:bg-[#0053C5]/5 transition-colors">
                                            <ImageIcon className="w-8 h-8 text-gray-400 mb-2" />
                                            <span className="text-sm text-gray-500">Pilih File 3</span>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={(e) => handleFileChange('lampiran3', e)}
                                            />
                                        </label>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="pt-4">
                            <Button
                                type="submit"
                                disabled={isSaving || isCreating}
                                className="w-full bg-[#0053C5] hover:bg-[#0047AB] text-white h-12 text-base font-medium"
                            >
                                {isSaving || isCreating ? (
                                    <>
                                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                        Menyimpan...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-5 h-5 mr-2" />
                                        Simpan Pengeluaran
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
