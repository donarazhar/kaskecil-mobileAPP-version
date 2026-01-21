import { useState, useEffect } from 'react';
import { useMaster } from '@kas-kecil/api-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Building,
    Save,
    Loader2,
    Phone,
    Mail,
    MapPin,
    User,
    CheckCircle
} from 'lucide-react';

export default function InstansiPage() {
    const { instansi, isInstansiLoading, updateInstansi } = useMaster();
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [formData, setFormData] = useState({
        nama_instansi: '',
        alamat: '',
        telepon: '',
        email: '',
        kepala_instansi: '',
        nip_kepala: '',
        logo: ''
    });

    // Load data when instansi is fetched
    useEffect(() => {
        if (instansi) {
            setFormData({
                nama_instansi: instansi.nama_instansi || '',
                alamat: instansi.alamat || '',
                telepon: instansi.telepon || '',
                email: instansi.email || '',
                kepala_instansi: (instansi as any).kepala_instansi || '',
                nip_kepala: (instansi as any).nip_kepala || '',
                logo: instansi.logo || ''
            });
        }
    }, [instansi]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            await updateInstansi(formData as any);
            setSuccessMessage('Data instansi berhasil disimpan!');
            setIsEditing(false);
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (error: any) {
            alert(error?.response?.data?.message || 'Gagal menyimpan data instansi');
        } finally {
            setIsSaving(false);
        }
    };

    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (!isEditing) setIsEditing(true);
    };

    if (isInstansiLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-[#0053C5]" />
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-4xl">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Profil Instansi</h1>
                    <p className="text-gray-500 mt-1">Kelola informasi profil instansi/perusahaan</p>
                </div>
                {isEditing && (
                    <Button
                        onClick={handleSubmit}
                        disabled={isSaving}
                        className="bg-[#0053C5] hover:bg-[#0047AB] text-white shadow-lg shadow-[#0053C5]/20"
                    >
                        {isSaving ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                            <Save className="w-4 h-4 mr-2" />
                        )}
                        Simpan Perubahan
                    </Button>
                )}
            </div>

            {/* Success Message */}
            {successMessage && (
                <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700">
                    <CheckCircle size={20} />
                    <span className="font-medium">{successMessage}</span>
                </div>
            )}

            {/* Main Form Card */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {/* Header with Icon */}
                <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-[#0053C5]/5 to-transparent">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-[#0053C5] flex items-center justify-center text-white shadow-lg shadow-[#0053C5]/30">
                            <Building size={28} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">
                                {instansi?.nama_instansi || 'Nama Instansi'}
                            </h2>
                            <p className="text-gray-500 text-sm">Informasi lengkap instansi</p>
                        </div>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Nama Instansi */}
                    <div className="space-y-2">
                        <Label htmlFor="nama_instansi" className="flex items-center gap-2 text-gray-700">
                            <Building size={16} />
                            Nama Instansi <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="nama_instansi"
                            placeholder="Contoh: PT Kas Kecil Indonesia"
                            value={formData.nama_instansi}
                            onChange={(e) => handleChange('nama_instansi', e.target.value)}
                            className="h-11"
                            required
                        />
                    </div>

                    {/* Alamat */}
                    <div className="space-y-2">
                        <Label htmlFor="alamat" className="flex items-center gap-2 text-gray-700">
                            <MapPin size={16} />
                            Alamat
                        </Label>
                        <textarea
                            id="alamat"
                            placeholder="Alamat lengkap instansi"
                            value={formData.alamat}
                            onChange={(e) => handleChange('alamat', e.target.value)}
                            className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        />
                    </div>

                    {/* 2 Column Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Telepon */}
                        <div className="space-y-2">
                            <Label htmlFor="telepon" className="flex items-center gap-2 text-gray-700">
                                <Phone size={16} />
                                Telepon
                            </Label>
                            <Input
                                id="telepon"
                                placeholder="Contoh: 021-12345678"
                                value={formData.telepon}
                                onChange={(e) => handleChange('telepon', e.target.value)}
                                className="h-11"
                            />
                        </div>

                        {/* Email */}
                        <div className="space-y-2">
                            <Label htmlFor="email" className="flex items-center gap-2 text-gray-700">
                                <Mail size={16} />
                                Email
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="Contoh: info@perusahaan.com"
                                value={formData.email}
                                onChange={(e) => handleChange('email', e.target.value)}
                                className="h-11"
                            />
                        </div>

                        {/* Kepala Instansi */}
                        <div className="space-y-2">
                            <Label htmlFor="kepala_instansi" className="flex items-center gap-2 text-gray-700">
                                <User size={16} />
                                Kepala Instansi
                            </Label>
                            <Input
                                id="kepala_instansi"
                                placeholder="Nama kepala instansi"
                                value={formData.kepala_instansi}
                                onChange={(e) => handleChange('kepala_instansi', e.target.value)}
                                className="h-11"
                            />
                        </div>

                        {/* NIP Kepala */}
                        <div className="space-y-2">
                            <Label htmlFor="nip_kepala" className="flex items-center gap-2 text-gray-700">
                                <User size={16} />
                                NIP Kepala
                            </Label>
                            <Input
                                id="nip_kepala"
                                placeholder="NIP kepala instansi"
                                value={formData.nip_kepala}
                                onChange={(e) => handleChange('nip_kepala', e.target.value)}
                                className="h-11"
                            />
                        </div>
                    </div>

                    {/* Submit Button (Mobile) */}
                    {isEditing && (
                        <div className="sm:hidden pt-4">
                            <Button
                                type="submit"
                                disabled={isSaving}
                                className="w-full bg-[#0053C5] hover:bg-[#0047AB] text-white h-11"
                            >
                                {isSaving ? (
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                ) : (
                                    <Save className="w-4 h-4 mr-2" />
                                )}
                                Simpan Perubahan
                            </Button>
                        </div>
                    )}
                </form>
            </div>

            {/* Info Card */}
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <Building size={16} className="text-blue-600" />
                    </div>
                    <div>
                        <h3 className="font-medium text-blue-900">Informasi Instansi</h3>
                        <p className="text-sm text-blue-700 mt-1">
                            Data instansi akan ditampilkan pada header laporan dan dokumen resmi lainnya.
                            Pastikan semua informasi terisi dengan lengkap dan benar.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
