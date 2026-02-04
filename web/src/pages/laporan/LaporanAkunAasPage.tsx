import { useState } from 'react';
import { useLaporan, useCabang, useUnit } from '@kas-kecil/api-client';
import { useAuth } from '@/hooks/useAuth';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '../../components/ui/table';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { FileText, Loader2, Filter, Building, Layers, Printer } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export default function LaporanAkunAasPage() {
    const { user } = useAuth();
    const isSuperAdmin = user?.role?.name === 'super_admin';

    // Filters
    const [selectedCabang, setSelectedCabang] = useState<number>(0);
    const [selectedUnit, setSelectedUnit] = useState<number>(0);

    // Data Fetching
    const { data: cabangs } = useCabang();
    const { data: units } = useUnit(selectedCabang || undefined);

    // Logic check for enabling query
    const isFilterComplete = isSuperAdmin ? (selectedCabang > 0 && selectedUnit > 0) : true;

    const { rekapAnggaran, isRekapAnggaranLoading, exportPdf, exportExcel } = useLaporan('rekap-anggaran', {
        tahun: new Date().getFullYear(),
        cabang_id: isSuperAdmin ? (selectedCabang || undefined) : undefined,
        unit_id: isSuperAdmin ? (selectedUnit || undefined) : undefined,
    }, { enabled: isFilterComplete });

    const formatPercent = (val: number) => `${val.toFixed(2)}%`;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
                        {/* @ts-ignore */}
                        <FileText className="h-6 w-6 text-[#0053C5]" />
                        Laporan Akun
                    </h1>
                    <p className="text-gray-500 mt-1">Rekapitulasi anggaran per Akun</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => exportExcel()} disabled={!isFilterComplete}>
                        Export Excel
                    </Button>
                    <Button className="bg-[#0053C5] hover:bg-[#0047AB]" onClick={() => exportPdf()} disabled={!isFilterComplete}>
                        {/* @ts-ignore */}
                        <Printer className="mr-2 h-4 w-4" />
                        Cetak PDF
                    </Button>
                </div>
            </div>

            <Card className="border-gray-100 shadow-sm">
                <CardHeader className="pb-4">
                    <CardTitle className="text-base font-medium flex items-center gap-2">
                        {/* @ts-ignore */}
                        <Filter className="h-4 w-4 text-gray-500" />
                        Filter Data
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {isSuperAdmin ? (
                            <>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                                        {/* @ts-ignore */}
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
                                        {/* @ts-ignore */}
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
                            </>
                        ) : (
                            <div className="space-y-2 col-span-1 md:col-span-3">
                                <p className="text-sm text-gray-500 italic">Menampilkan data tahun {new Date().getFullYear()}</p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            <Card className="border-gray-100 shadow-sm overflow-hidden min-h-[400px]">
                <div className="overflow-x-auto h-full flex flex-col">
                    {!isFilterComplete ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-gray-400">
                                {/* @ts-ignore */}
                                <Filter className="h-8 w-8" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900">Pilih Cabang & Unit</h3>
                            <p className="text-gray-500 max-w-sm mt-1">Silakan pilih Cabang dan Unit terlebih dahulu untuk menampilkan data laporan.</p>
                        </div>
                    ) : isRekapAnggaranLoading ? (
                        <div className="flex items-center justify-center p-12">
                            {/* @ts-ignore */}
                            <Loader2 className="h-8 w-8 animate-spin text-[#0053C5]" />
                        </div>
                    ) : (
                        <Table>
                            <TableHeader className="bg-gray-50/50">
                                <TableRow>
                                    <TableHead className="w-[150px]">Kode</TableHead>
                                    <TableHead>Nama Mata Anggaran</TableHead>
                                    <TableHead className="text-right">Pagu Anggaran</TableHead>
                                    <TableHead className="text-right">Realisasi</TableHead>
                                    <TableHead className="text-right">Sisa</TableHead>
                                    <TableHead className="text-center w-[100px]">%</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {rekapAnggaran?.mata_anggaran?.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                                            Tidak ada data laporan untuk filter ini
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    rekapAnggaran?.mata_anggaran.map((row, idx) => (
                                        <TableRow key={idx} className="hover:bg-gray-50/50">
                                            <TableCell className="font-medium font-mono text-xs text-gray-600">
                                                {row.kode}
                                            </TableCell>
                                            <TableCell>{row.nama}</TableCell>
                                            <TableCell className="text-right font-medium">
                                                {formatCurrency(row.pagu)}
                                            </TableCell>
                                            <TableCell className="text-right text-orange-600">
                                                {formatCurrency(row.realisasi)}
                                            </TableCell>
                                            <TableCell className="text-right text-green-600">
                                                {formatCurrency(row.sisa)}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${row.persentase > 90 ? 'bg-red-50 text-red-700' :
                                                    row.persentase > 70 ? 'bg-yellow-50 text-yellow-700' :
                                                        'bg-green-50 text-green-700'
                                                    }`}>
                                                    {formatPercent(row.persentase)}
                                                </span>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                                {/* Footer / Total */}
                                {rekapAnggaran && rekapAnggaran.mata_anggaran.length > 0 && (
                                    <TableRow className="bg-gray-50 border-t-2 border-gray-100 hidden">
                                        {/* Total row hidden as per request */}
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    )}
                </div>
            </Card>
        </div>
    );
}


