import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useUnit, useCabang, unitService } from '@kas-kecil/api-client';
import { ArrowLeft, Loader2, Save, Building2 } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';

export default function UnitCreatePage() {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditMode = !!id;

    const { create, update } = useUnit();
    const { data: cabangs, isLoading: isCabangLoading } = useCabang();

    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [formData, setFormData] = useState({
        cabang_id: 0,
        kode_unit: '',
        nama_unit: '',
        kepala_unit: '',
        nip_kepala: '',
        plafon_kas: 0,
        is_active: true
    });

    // Load data if edit mode
    useEffect(() => {
        if (isEditMode && id) {
            setIsLoading(true);
            unitService.getById(Number(id))
                .then((data) => {
                    setFormData({
                        cabang_id: data.cabang_id || 0,
                        kode_unit: data.kode_unit || '',
                        nama_unit: data.nama_unit || '',
                        kepala_unit: data.kepala_unit || '',
                        nip_kepala: data.nip_kepala || '',
                        plafon_kas: data.plafon_kas || 0,
                        is_active: data.is_active ?? true
                    });
                })
                .catch((error) => {
                    console.error('Failed to load unit:', error);
                    alert('Gagal memuat data unit');
                    navigate('/master/unit');
                })
                .finally(() => setIsLoading(false));
        }
    }, [id, isEditMode, navigate]);

    // Auto-select first cabang if creating
    useEffect(() => {
        if (!isEditMode && cabangs.length > 0 && formData.cabang_id === 0) {
            setFormData(prev => ({ ...prev, cabang_id: cabangs[0].id }));
        }
    }, [cabangs, isEditMode, formData.cabang_id]);

    const handleChange = (field: string, value: string | number | boolean) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.kode_unit || !formData.nama_unit || !formData.cabang_id) {
            alert('Kode unit, nama unit, dan cabang wajib diisi');
            return;
        }

        setIsSaving(true);
        try {
            if (isEditMode && id) {
                await update({ id: Number(id), data: formData });
            } else {
                await create(formData);
            }
            navigate('/master/unit');
        } catch (error: any) {
            console.error('Failed to save unit:', error);
            alert(error?.response?.data?.message || 'Gagal menyimpan unit');
        } finally {
            setIsSaving(false);
        }
    };

    if (isCabangLoading || isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-[#0053C5]" />
            </div>
        );
    }

    if (cabangs.length === 0) {
        return (
            <div className="max-w-2xl mx-auto space-y-6">
                <Button
                    variant="ghost"
                    className="pl-0 hover:pl-2 transition-all"
                    onClick={() => navigate('/master/unit')}
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Kembali
                </Button>
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center">
                    <h2 className="text-lg font-semibold text-amber-800 mb-2">Cabang Belum Ada</h2>
                    <p className="text-amber-700 mb-4">Anda harus membuat cabang terlebih dahulu sebelum menambah unit.</p>
                    <Button onClick={() => navigate('/master/cabang/create')} className="bg-amber-600 hover:bg-amber-700">
                        Tambah Cabang
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            {/* Back Button */}
            <Button
                variant="ghost"
                className="pl-0 hover:pl-2 transition-all"
                onClick={() => navigate('/master/unit')}
            >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Kembali ke Daftar Unit
            </Button>

            {/* Page Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                    {isEditMode ? 'Edit Unit' : 'Tambah Unit Baru'}
                </h1>
                <p className="text-gray-500 mt-1">
                    {isEditMode ? 'Perbarui informasi unit' : 'Tambahkan unit baru ke dalam sistem'}
                </p>
            </div>

            {/* Form Card */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {/* Header */}
                <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-[#0053C5]/5 to-transparent">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-[#0053C5] flex items-center justify-center text-white">
                            <Building2 size={24} />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900">Data Unit</h2>
                            <p className="text-sm text-gray-500">Lengkapi informasi unit</p>
                        </div>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Cabang Select */}
                    <div className="space-y-2">
                        <Label htmlFor="cabang_id">Cabang <span className="text-red-500">*</span></Label>
                        <select
                            id="cabang_id"
                            className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            value={formData.cabang_id || ''}
                            onChange={(e) => handleChange('cabang_id', e.target.value ? Number(e.target.value) : 0)}
                            required
                        >
                            <option value="">Pilih Cabang</option>
                            {cabangs.map((cabang) => (
                                <option key={cabang.id} value={cabang.id}>
                                    {cabang.nama_cabang} ({cabang.kode_cabang})
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Kode & Nama */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="kode_unit">Kode Unit <span className="text-red-500">*</span></Label>
                            <Input
                                id="kode_unit"
                                placeholder="Contoh: UNIT-KEU"
                                value={formData.kode_unit}
                                onChange={(e) => handleChange('kode_unit', e.target.value)}
                                className="h-11"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="nama_unit">Nama Unit <span className="text-red-500">*</span></Label>
                            <Input
                                id="nama_unit"
                                placeholder="Contoh: Unit Keuangan"
                                value={formData.nama_unit}
                                onChange={(e) => handleChange('nama_unit', e.target.value)}
                                className="h-11"
                                required
                            />
                        </div>
                    </div>

                    {/* Kepala Unit */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="kepala_unit">Kepala Unit</Label>
                            <Input
                                id="kepala_unit"
                                placeholder="Nama kepala unit"
                                value={formData.kepala_unit}
                                onChange={(e) => handleChange('kepala_unit', e.target.value)}
                                className="h-11"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="nip_kepala">NIP Kepala</Label>
                            <Input
                                id="nip_kepala"
                                placeholder="NIP kepala unit"
                                value={formData.nip_kepala}
                                onChange={(e) => handleChange('nip_kepala', e.target.value)}
                                className="h-11"
                            />
                        </div>
                    </div>

                    {/* Plafon Kas */}
                    <div className="space-y-2">
                        <Label htmlFor="plafon_kas">Plafon Kas (Rp)</Label>
                        <Input
                            id="plafon_kas"
                            type="number"
                            placeholder="0"
                            value={formData.plafon_kas}
                            onChange={(e) => handleChange('plafon_kas', Number(e.target.value))}
                            className="h-11"
                        />
                        <p className="text-xs text-gray-500">Batas maksimal kas kecil untuk unit ini (diisi oleh Super Admin)</p>
                    </div>

                    {/* Status */}
                    <div className="flex items-center gap-3">
                        <input
                            type="checkbox"
                            id="is_active"
                            checked={formData.is_active}
                            onChange={(e) => handleChange('is_active', e.target.checked)}
                            className="w-4 h-4 rounded border-gray-300 text-[#0053C5] focus:ring-[#0053C5]"
                        />
                        <Label htmlFor="is_active" className="font-normal">Unit Aktif</Label>
                    </div>

                    {/* Submit Button */}
                    <div className="pt-4">
                        <Button
                            type="submit"
                            disabled={isSaving}
                            className="w-full bg-[#0053C5] hover:bg-[#0047AB] text-white h-11"
                        >
                            {isSaving ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Menyimpan...
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4 mr-2" />
                                    {isEditMode ? 'Simpan Perubahan' : 'Simpan Unit'}
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
