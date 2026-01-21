// @ts-nocheck
import { useState, useMemo } from 'react';
import { useLaporan, useCabang, useUnit } from '@kas-kecil/api-client';
import { useAuth } from '@/hooks/useAuth';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
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
import { FileBarChart, Loader2, Filter, Building, Layers, Printer, Calendar } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import { TransaksiKategori } from '@kas-kecil/shared';

export default function LaporanTransaksiPage() {
    const { user } = useAuth();
    const isSuperAdmin = user?.role?.name === 'super_admin';

    // Filters
    const currentYear = new Date().getFullYear();
    const [selectedYear, setSelectedYear] = useState<number>(currentYear);
    const [selectedCabang, setSelectedCabang] = useState<number>(0);
    const [selectedUnit, setSelectedUnit] = useState<number>(0);

    // Data Fetching
    const { data: cabangs } = useCabang();
    const { data: units } = useUnit(selectedCabang || undefined);

    // Logic to determine date range from year
    const dateRange = useMemo(() => {
        return {
            from: `${selectedYear}-01-01`,
            to: `${selectedYear}-12-31`,
        };
    }, [selectedYear]);

    // Logic check for enabling query
    const isFilterComplete = isSuperAdmin ? (selectedCabang > 0 && selectedUnit > 0) : true;

    const { bukuKas, isBukuKasLoading, exportPdf, exportExcel } = useLaporan('buku-kas', {
        from: dateRange.from,
        to: dateRange.to,
        cabang_id: isSuperAdmin ? (selectedCabang || undefined) : undefined,
        unit_id: isSuperAdmin ? (selectedUnit || undefined) : undefined,
    }, { enabled: isFilterComplete });

    // Generate years for dropdown (last 5 years)
    const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

    // Calculate running balance for display
    const transactionsWithBalance = useMemo(() => {
        if (!bukuKas?.transaksi) return [];

        // Starting balance from API
        let currentBalance = bukuKas.saldo_awal || 0;

        return bukuKas.transaksi.map(trx => {
            const isPengeluaran = trx.kategori === 'pengeluaran';
            const jumlah = trx.jumlah;

            // Update balance
            if (isPengeluaran) {
                currentBalance -= jumlah;
            } else {
                currentBalance += jumlah;
            }

            return {
                ...trx,
                running_balance: currentBalance,
                is_pengeluaran: isPengeluaran
            };
        });

    }, [bukuKas]);

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
                        <FileBarChart className="h-6 w-6 text-[#0053C5]" />
                        Laporan Transaksi
                    </h1>
                    <p className="text-gray-500 mt-1">Buku Kas Umum (Detail Transaksi)</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => exportExcel()} disabled={!isFilterComplete}>
                        Export Excel
                    </Button>
                    <Button className="bg-[#0053C5] hover:bg-[#0047AB]" onClick={() => exportPdf()} disabled={!isFilterComplete}>
                        <Printer className="mr-2 h-4 w-4" />
                        Cetak PDF
                    </Button>
                </div>
            </div>

            <Card className="border-gray-100 shadow-sm">
                <CardHeader className="pb-4">
                    <CardTitle className="text-base font-medium flex items-center gap-2">
                        <Filter className="h-4 w-4 text-gray-500" />
                        Filter Data
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Year Filter - Always Visible */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                                <Calendar className="h-3.5 w-3.5" /> Tahun
                            </label>
                            <Select
                                value={selectedYear.toString()}
                                onValueChange={(val) => setSelectedYear(Number(val))}
                            >
                                <SelectTrigger className="bg-white">
                                    <SelectValue placeholder="Pilih Tahun" />
                                </SelectTrigger>
                                <SelectContent>
                                    {years.map((year) => (
                                        <SelectItem key={year} value={year.toString()}>
                                            {year}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {isSuperAdmin ? (
                            <>
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
                            </>
                        ) : null}
                    </div>
                </CardContent>
            </Card>

            <Card className="border-gray-100 shadow-sm overflow-hidden min-h-[400px]">
                <div className="overflow-x-auto h-full flex flex-col">
                    {!isFilterComplete ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-gray-400">
                                <Filter className="h-8 w-8" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900">Pilih Cabang & Unit</h3>
                            <p className="text-gray-500 max-w-sm mt-1">Silakan pilih Cabang dan Unit terlebih dahulu untuk menampilkan data transaksi.</p>
                        </div>
                    ) : isBukuKasLoading ? (
                        <div className="flex items-center justify-center p-12">
                            <Loader2 className="h-8 w-8 animate-spin text-[#0053C5]" />
                        </div>
                    ) : (
                        <Table>
                            <TableHeader className="bg-gray-50/50">
                                <TableRow>
                                    <TableHead className="w-[120px]">Tanggal</TableHead>
                                    <TableHead className="w-[150px]">No. Bukti</TableHead>
                                    <TableHead>Keterangan</TableHead>
                                    <TableHead className="text-right w-[150px]">Masuk</TableHead>
                                    <TableHead className="text-right w-[150px]">Keluar</TableHead>
                                    <TableHead className="text-right w-[150px]">Saldo</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {/* Saldo Awal Row */}
                                <TableRow className="bg-gray-50/30">
                                    <TableCell colSpan={3} className="font-semibold text-gray-700 italic text-center">
                                        Saldo Awal (per 1 Januari {selectedYear})
                                    </TableCell>
                                    <TableCell className="text-right font-medium text-gray-500">-</TableCell>
                                    <TableCell className="text-right font-medium text-gray-500">-</TableCell>
                                    <TableCell className="text-right font-bold text-gray-800">
                                        {formatCurrency(bukuKas?.saldo_awal || 0)}
                                    </TableCell>
                                </TableRow>

                                {transactionsWithBalance.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-12 text-gray-500">
                                            Tidak ada transaksi pada periode ini
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    transactionsWithBalance.map((row, idx) => (
                                        <TableRow key={row.id || idx} className="hover:bg-gray-50/50">
                                            <TableCell className="text-gray-600 font-medium text-xs">
                                                {formatDate(row.tanggal)}
                                            </TableCell>
                                            <TableCell className="text-xs font-mono text-gray-500">
                                                {row.no_bukti || '-'}
                                            </TableCell>
                                            <TableCell className="text-sm">
                                                {row.keterangan}
                                                {row.unit && isSuperAdmin && (
                                                    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-blue-50 text-blue-700">
                                                        {row.unit.nama_unit}
                                                    </span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right text-green-600 font-medium text-xs">
                                                {!row.is_pengeluaran ? formatCurrency(row.jumlah) : '-'}
                                            </TableCell>
                                            <TableCell className="text-right text-orange-600 font-medium text-xs">
                                                {row.is_pengeluaran ? formatCurrency(row.jumlah) : '-'}
                                            </TableCell>
                                            <TableCell className="text-right font-semibold text-gray-800 text-xs">
                                                {formatCurrency(row.running_balance)}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}

                                {/* Footer Summary */}
                                <TableRow className="bg-gray-100/50 border-t-2 border-gray-200 font-bold">
                                    <TableCell colSpan={3} className="text-center uppercase text-xs tracking-wider">Total Akhir</TableCell>
                                    <TableCell className="text-right text-green-700">
                                        {formatCurrency(bukuKas?.total_masuk || 0)}
                                    </TableCell>
                                    <TableCell className="text-right text-orange-700">
                                        {formatCurrency(bukuKas?.total_keluar || 0)}
                                    </TableCell>
                                    <TableCell className="text-right text-[#0053C5]">
                                        {formatCurrency(bukuKas?.saldo_akhir || 0)}
                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    )}
                </div>
            </Card>
        </div>
    );
}
