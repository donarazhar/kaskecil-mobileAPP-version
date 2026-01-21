// @ts-nocheck
import { useState } from 'react';
import { FileText, Printer, Info, Calendar, ArrowRight, Building, Layers } from 'lucide-react';
import { getApiConfig, useCabang, useUnit } from '@kas-kecil/api-client';
import { useAuth } from '@/hooks/useAuth';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription
} from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const { apiUrl: API_URL } = getApiConfig();

export default function LaporanPage() {
    const { user } = useAuth();
    const isSuperAdmin = user?.role?.name === 'super_admin';

    const [tanggalAwal, setTanggalAwal] = useState('');
    const [tanggalAkhir, setTanggalAkhir] = useState('');
    const [selectedCabang, setSelectedCabang] = useState<number>(0);
    const [selectedUnit, setSelectedUnit] = useState<number>(0);

    const { data: cabangs } = useCabang();
    const { data: units } = useUnit(selectedCabang || undefined);

    const handlePrint = (e: React.FormEvent) => {
        e.preventDefault();

        if (!tanggalAwal || !tanggalAkhir) {
            return;
        }

        const { getToken } = getApiConfig();
        const token = getToken();
        let url = `${API_URL}/laporan/cetaklaporan?tanggalawal=${tanggalAwal}&tanggalakhir=${tanggalAkhir}&token=${token}`;

        if (isSuperAdmin) {
            if (selectedCabang) url += `&cabang_id=${selectedCabang}`;
            if (selectedUnit) url += `&unit_id=${selectedUnit}`;
        }

        window.open(url, '_blank');
    };

    const isFormValid = () => {
        if (!tanggalAwal || !tanggalAkhir) return false;
        if (isSuperAdmin) {
            return selectedCabang > 0 && selectedUnit > 0;
        }
        return true;
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
                    <FileText className="h-6 w-6 text-[#0053C5]" />
                    Laporan Kas Kecil
                </h1>
                <p className="text-gray-500 mt-1">Cetak laporan kas kecil berdasarkan periode tanggal</p>
            </div>

            <Card className="border-gray-100 shadow-sm">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Printer className="h-5 w-5 text-[#0053C5]" />
                        Cetak Laporan
                    </CardTitle>
                    <CardDescription>
                        Pilih tanggal awal dan tanggal akhir periode, kemudian klik tombol Cetak Laporan.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Alert className="bg-blue-50 border-blue-100 mb-6">
                        <Info className="h-4 w-4 text-blue-600" />
                        <AlertTitle className="text-blue-800">Panduan</AlertTitle>
                        <AlertDescription className="text-blue-700">
                            Pastikan Anda memilih periode yang benar. Dokumen PDF akan otomatis terunduh atau terbuka di tab baru.
                        </AlertDescription>
                    </Alert>

                    <form onSubmit={handlePrint} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-6">
                            {/* Date Range Selection */}
                            <div className="flex flex-col md:flex-row items-start md:items-end gap-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
                                <div className="w-full md:w-auto flex-1 space-y-2">
                                    <label htmlFor="tanggalawal" className="text-sm font-medium text-gray-700 flex items-center gap-1">
                                        <Calendar className="h-3.5 w-3.5" /> Tanggal Awal
                                    </label>
                                    <Input
                                        type="date"
                                        id="tanggalawal"
                                        value={tanggalAwal}
                                        onChange={(e) => setTanggalAwal(e.target.value)}
                                        className="bg-white"
                                        required
                                    />
                                </div>

                                <div className="hidden md:flex items-center justify-center h-10 pb-2 text-gray-400">
                                    <ArrowRight className="h-5 w-5" />
                                </div>

                                <div className="w-full md:w-auto flex-1 space-y-2">
                                    <label htmlFor="tanggalakhir" className="text-sm font-medium text-gray-700 flex items-center gap-1">
                                        <Calendar className="h-3.5 w-3.5" /> Tanggal Akhir
                                    </label>
                                    <Input
                                        type="date"
                                        id="tanggalakhir"
                                        value={tanggalAkhir}
                                        onChange={(e) => setTanggalAkhir(e.target.value)}
                                        className="bg-white"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Filters for Super Admin */}
                            {isSuperAdmin && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                                            <Building className="h-3.5 w-3.5" /> Cabang
                                        </label>
                                        <Select
                                            value={selectedCabang.toString()}
                                            onValueChange={(val) => {
                                                setSelectedCabang(Number(val));
                                                setSelectedUnit(0);
                                            }}
                                        >
                                            <SelectTrigger className="bg-white">
                                                <SelectValue placeholder="Pilih Cabang" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="0">Pilih Cabang</SelectItem>
                                                {cabangs?.map((c) => (
                                                    <SelectItem key={c.id} value={c.id.toString()}>
                                                        {c.nama_cabang}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                                            <Layers className="h-3.5 w-3.5" /> Unit
                                        </label>
                                        <Select
                                            value={selectedUnit.toString()}
                                            onValueChange={(val) => setSelectedUnit(Number(val))}
                                            disabled={!selectedCabang}
                                        >
                                            <SelectTrigger className="bg-white">
                                                <SelectValue placeholder="Pilih Unit" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="0">Pilih Unit</SelectItem>
                                                {units?.map((u) => (
                                                    <SelectItem key={u.id} value={u.id.toString()}>
                                                        {u.nama_unit}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex justify-start pt-2">
                            <Button
                                type="submit"
                                className="bg-[#0053C5] hover:bg-[#0047AB] px-8"
                                disabled={!isFormValid()}
                            >
                                <Printer className="mr-2 h-4 w-4" />
                                Cetak Laporan
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
