import { UnitSummary } from '@kas-kecil/shared';
import { cn } from '@/lib/utils';
import { useMemo, useState } from 'react';
import { ChevronDown, ChevronUp, Search, SlidersHorizontal } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface UnitRecapTableProps {
    data: UnitSummary[];
}

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value);
};

export const UnitRecapTable = ({ data }: UnitRecapTableProps) => {
    const [search, setSearch] = useState('');
    const [sortConfig, setSortConfig] = useState<{ key: keyof UnitSummary, direction: 'asc' | 'desc' } | null>(null);

    const sortedData = useMemo(() => {
        let sortableData = [...data];

        if (search) {
            const lowerSearch = search.toLowerCase();
            sortableData = sortableData.filter(item =>
                item.nama_unit.toLowerCase().includes(lowerSearch) ||
                item.cabang.toLowerCase().includes(lowerSearch) ||
                item.kode_unit.toLowerCase().includes(lowerSearch)
            );
        }

        if (sortConfig) {
            sortableData.sort((a, b) => {
                if (a[sortConfig.key] < b[sortConfig.key]) {
                    return sortConfig.direction === 'asc' ? -1 : 1;
                }
                if (a[sortConfig.key] > b[sortConfig.key]) {
                    return sortConfig.direction === 'asc' ? 1 : -1;
                }
                return 0;
            });
        }

        return sortableData;
    }, [data, search, sortConfig]);

    const requestSort = (key: keyof UnitSummary) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const getSortIcon = (key: keyof UnitSummary) => {
        if (!sortConfig || sortConfig.key !== key) {
            return <SlidersHorizontal size={14} className="ml-1 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />;
        }
        return sortConfig.direction === 'asc' ? <ChevronUp size={14} className="ml-1" /> : <ChevronDown size={14} className="ml-1" />;
    };

    return (
        <div className="card-modern p-6">
            <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
                <div>
                    <h2 className="text-lg font-semibold text-gray-900">Rekapitulasi Unit</h2>
                    <p className="text-sm text-gray-500 mt-0.5">Monitoring anggaran seluruh unit cabang</p>
                </div>
                <div className="relative w-full sm:w-64">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                        type="text"
                        placeholder="Cari unit atau cabang..."
                        className="pl-9 h-9 text-sm"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-gray-100 bg-gray-50/50">
                            <th
                                className="text-left py-3 px-4 font-semibold text-gray-600 cursor-pointer group hover:bg-gray-100 transition-colors"
                                onClick={() => requestSort('nama_unit')}
                            >
                                <div className="flex items-center">Unit / Cabang {getSortIcon('nama_unit')}</div>
                            </th>
                            <th
                                className="text-right py-3 px-4 font-semibold text-gray-600 cursor-pointer group hover:bg-gray-100 transition-colors"
                                onClick={() => requestSort('plafon')}
                            >
                                <div className="flex items-center justify-end">Plafon {getSortIcon('plafon')}</div>
                            </th>
                            <th
                                className="text-right py-3 px-4 font-semibold text-gray-600 cursor-pointer group hover:bg-gray-100 transition-colors"
                                onClick={() => requestSort('total_pengeluaran')}
                            >
                                <div className="flex items-center justify-end">Terpakai {getSortIcon('total_pengeluaran')}</div>
                            </th>
                            <th
                                className="text-right py-3 px-4 font-semibold text-gray-600 cursor-pointer group hover:bg-gray-100 transition-colors"
                                onClick={() => requestSort('sisa_kas')}
                            >
                                <div className="flex items-center justify-end">Sisa Kas {getSortIcon('sisa_kas')}</div>
                            </th>
                            <th
                                className="text-center py-3 px-4 font-semibold text-gray-600 cursor-pointer group hover:bg-gray-100 transition-colors"
                                onClick={() => requestSort('persentase_pemakaian')}
                            >
                                <div className="flex items-center justify-center">% {getSortIcon('persentase_pemakaian')}</div>
                            </th>
                            <th
                                className="text-right py-3 px-4 font-semibold text-gray-600 cursor-pointer group hover:bg-gray-100 transition-colors"
                                onClick={() => requestSort('total_draft')}
                            >
                                <div className="flex items-center justify-end">Draft (Belum Cair) {getSortIcon('total_draft')}</div>
                            </th>
                            <th className="text-center py-3 px-4 font-semibold text-gray-600">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {sortedData.length > 0 ? (
                            sortedData.map((row) => {
                                const percentage = row.persentase_pemakaian;
                                const isCritical = percentage > 90 || row.sisa_kas < 1000000; // Example threshold
                                const isWarning = percentage > 75;

                                return (
                                    <tr key={row.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="py-3 px-4">
                                            <div className="font-medium text-gray-900">{row.nama_unit}</div>
                                            <div className="text-xs text-gray-500">{row.cabang} ({row.kode_unit})</div>
                                        </td>
                                        <td className="py-3 px-4 text-right font-medium text-gray-600">
                                            {formatCurrency(row.plafon)}
                                        </td>
                                        <td className="py-3 px-4 text-right text-red-600 font-medium">
                                            {formatCurrency(row.total_pengeluaran)}
                                        </td>
                                        <td className="py-3 px-4 text-right text-emerald-600 font-medium">
                                            {formatCurrency(row.sisa_kas)}
                                        </td>
                                        <td className="py-3 px-4 text-center">
                                            <div className={cn(
                                                "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium",
                                                percentage > 80 ? "bg-red-100 text-red-700" :
                                                    percentage > 50 ? "bg-yellow-100 text-yellow-700" :
                                                        "bg-emerald-100 text-emerald-700"
                                            )}>
                                                {percentage}%
                                            </div>
                                        </td>
                                        <td className="py-3 px-4 text-right text-amber-600 font-medium">
                                            {row.total_draft > 0 ? formatCurrency(row.total_draft) : '-'}
                                        </td>
                                        <td className="py-3 px-4 text-center">
                                            {isCritical ? (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                    Kritis
                                                </span>
                                            ) : isWarning ? (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                                    Waspada
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                    Aman
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan={7} className="py-8 text-center text-gray-500">
                                    Tidak ada data unit yang ditemukan
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
