import { useQuery } from '@tanstack/react-query';
import { laporanService } from '../services/laporanService';
import { QUERY_KEYS } from '../shared';
import type { LaporanFilter } from '../shared';

export function useLaporan(type: 'buku-kas' | 'rekap-anggaran', filters: LaporanFilter, options?: { enabled?: boolean }) {
    const bukuKas = useQuery({
        queryKey: QUERY_KEYS.LAPORAN.BUKU_KAS(filters),
        queryFn: () => laporanService.getBukuKas(filters),
        enabled: type === 'buku-kas' && (options?.enabled ?? true),
    });

    const rekapAnggaran = useQuery({
        queryKey: QUERY_KEYS.LAPORAN.REKAP_ANGGARAN(filters),
        queryFn: () => laporanService.getRekapAnggaran(filters),
        enabled: type === 'rekap-anggaran' && (options?.enabled ?? true),
    });

    const exportPdf = async () => {
        const blob = await laporanService.exportPdf(type, filters);
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `laporan-${type}-${Date.now()}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const exportExcel = async () => {
        const blob = await laporanService.exportExcel(type, filters);
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `laporan-${type}-${Date.now()}.xlsx`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return {
        bukuKas: bukuKas.data,
        isBukuKasLoading: bukuKas.isLoading,
        rekapAnggaran: rekapAnggaran.data,
        isRekapAnggaranLoading: rekapAnggaran.isLoading,
        exportPdf,
        exportExcel,
    };
}
