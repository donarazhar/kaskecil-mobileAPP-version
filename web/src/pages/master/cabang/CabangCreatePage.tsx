import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCabang, useMaster } from '@kas-kecil/api-client';
import { cabangService } from '@kas-kecil/api-client';
import { ArrowLeft, Loader2, Save, Building } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';

export default function CabangCreatePage() {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditMode = !!id;

    const { create, update } = useCabang();
    const { instansi, isInstansiLoading } = useMaster();

    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [formData, setFormData] = useState<{
        kode_cabang: string;
        nama_cabang: string;
        alamat: string;
        telepon: string;
        email: string;
        kepala_cabang: string;
        nip_kepala: string;
        instansi_id: number;
        latitude?: number | string;
        longitude?: number | string;
    }>({
        kode_cabang: '',
        nama_cabang: '',
        alamat: '',
        telepon: '',
        email: '',
        kepala_cabang: '',
        nip_kepala: '',
        instansi_id: 0,
        latitude: '',
        longitude: ''
    });

    // Load data if edit mode
    useEffect(() => {
        if (isEditMode && id) {
            setIsLoading(true);
            cabangService.getById(Number(id))
                .then((data) => {
                    setFormData({
                        kode_cabang: data.kode_cabang || '',
                        nama_cabang: data.nama_cabang || '',
                        alamat: data.alamat || '',
                        telepon: data.telepon || '',
                        email: data.email || '',
                        kepala_cabang: data.kepala_cabang || '',
                        nip_kepala: data.nip_kepala || '',
                        instansi_id: data.instansi_id || 0,
                        latitude: data.latitude || '',
                        longitude: data.longitude || ''
                    });
                })
                .catch((error) => {
                    console.error('Failed to load cabang:', error);
                    alert('Gagal memuat data cabang');
                    navigate('/master/cabang');
                })
                .finally(() => setIsLoading(false));
        }
    }, [id, isEditMode, navigate]);

    // Auto-set instansi_id
    useEffect(() => {
        if (instansi && !isEditMode) {
            setFormData(prev => ({ ...prev, instansi_id: instansi.id }));
        }
    }, [instansi, isEditMode]);

    const handleChange = (field: string, value: string | number) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.kode_cabang || !formData.nama_cabang) {
            alert('Kode cabang dan nama cabang wajib diisi');
            return;
        }

        setIsSaving(true);
        try {
            const payload: any = { ...formData };
            if (payload.latitude) payload.latitude = Number(payload.latitude);
            else payload.latitude = null;

            if (payload.longitude) payload.longitude = Number(payload.longitude);
            else payload.longitude = null;

            if (isEditMode && id) {
                await update({ id: Number(id), data: payload as any });
            } else {
                await create(payload as any);
            }
            navigate('/master/cabang');
        } catch (error: any) {
            console.error('Failed to save cabang:', error);
            alert(error?.response?.data?.message || 'Gagal menyimpan cabang');
        } finally {
            setIsSaving(false);
        }
    };

    if (isInstansiLoading || isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                {/* @ts-ignore */}
                <Loader2 className="w-8 h-8 animate-spin text-[#0053C5]" />
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            {/* Back Button */}
            <Button
                variant="ghost"
                className="pl-0 hover:pl-2 transition-all"
                onClick={() => navigate('/master/cabang')}
            >
                {/* @ts-ignore */}
                <ArrowLeft className="w-4 h-4 mr-2" />
                Kembali ke Daftar Cabang
            </Button>

            {/* Page Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                    {isEditMode ? 'Edit Cabang' : 'Tambah Cabang Baru'}
                </h1>
                <p className="text-gray-500 mt-1">
                    {isEditMode ? 'Perbarui informasi cabang' : 'Tambahkan cabang baru ke dalam sistem'}
                </p>
            </div>

            {/* Form Card */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {/* Header */}
                <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-[#0053C5]/5 to-transparent">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-[#0053C5] flex items-center justify-center text-white">
                            {/* @ts-ignore */}
                            <Building size={24} />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900">Data Cabang</h2>
                            <p className="text-sm text-gray-500">Lengkapi informasi cabang</p>
                        </div>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Kode & Nama */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="kode_cabang">Kode Cabang <span className="text-red-500">*</span></Label>
                            <Input
                                id="kode_cabang"
                                placeholder="Contoh: CBG-JKT"
                                value={formData.kode_cabang}
                                onChange={(e) => handleChange('kode_cabang', e.target.value)}
                                className="h-11"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="nama_cabang">Nama Cabang <span className="text-red-500">*</span></Label>
                            <Input
                                id="nama_cabang"
                                placeholder="Contoh: Cabang Jakarta"
                                value={formData.nama_cabang}
                                onChange={(e) => handleChange('nama_cabang', e.target.value)}
                                className="h-11"
                                required
                            />
                        </div>
                    </div>

                    {/* Alamat */}
                    <div className="space-y-2">
                        <Label htmlFor="alamat">Alamat</Label>
                        <textarea
                            id="alamat"
                            placeholder="Alamat lengkap cabang"
                            value={formData.alamat}
                            onChange={(e) => handleChange('alamat', e.target.value)}
                            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        />
                    </div>

                    {/* Koordinat (Latitude & Longitude) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="latitude">Latitude</Label>
                            <Input
                                id="latitude"
                                placeholder="Contoh: -6.123456"
                                value={formData.latitude}
                                onChange={(e) => handleChange('latitude', e.target.value)}
                                className="h-11"
                                type="number"
                                step="any"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="longitude">Longitude</Label>
                            <Input
                                id="longitude"
                                placeholder="Contoh: 106.123456"
                                value={formData.longitude}
                                onChange={(e) => handleChange('longitude', e.target.value)}
                                className="h-11"
                                type="number"
                                step="any"
                            />
                        </div>
                    </div>

                    {/* Telepon & Email */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="telepon">Telepon</Label>
                            <Input
                                id="telepon"
                                placeholder="Contoh: 021-12345678"
                                value={formData.telepon}
                                onChange={(e) => handleChange('telepon', e.target.value)}
                                className="h-11"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="Contoh: cabang@perusahaan.com"
                                value={formData.email}
                                onChange={(e) => handleChange('email', e.target.value)}
                                className="h-11"
                            />
                        </div>
                    </div>

                    {/* Kepala Cabang */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="kepala_cabang">Kepala Cabang</Label>
                            <Input
                                id="kepala_cabang"
                                placeholder="Nama kepala cabang"
                                value={formData.kepala_cabang}
                                onChange={(e) => handleChange('kepala_cabang', e.target.value)}
                                className="h-11"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="nip_kepala">NIP Kepala</Label>
                            <Input
                                id="nip_kepala"
                                placeholder="NIP kepala cabang"
                                value={formData.nip_kepala}
                                onChange={(e) => handleChange('nip_kepala', e.target.value)}
                                className="h-11"
                            />
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="pt-4">
                        <Button
                            type="submit"
                            disabled={isSaving || !instansi}
                            className="w-full bg-[#0053C5] hover:bg-[#0047AB] text-white h-11"
                        >
                            {isSaving ? (
                                <>
                                    {/* @ts-ignore */}
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Menyimpan...
                                </>
                            ) : (
                                <>
                                    {/* @ts-ignore */}
                                    <Save className="w-4 h-4 mr-2" />
                                    {isEditMode ? 'Simpan Perubahan' : 'Simpan Cabang'}
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
