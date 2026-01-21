import { apiClient } from '../client';
import { API_ENDPOINTS, buildQueryString } from '@kas-kecil/shared';
import type { LaporanBukuKas, LaporanRekapAnggaran, LaporanFilter } from '@kas-kecil/shared';

export const laporanService = {
    getBukuKas: async (filters: LaporanFilter): Promise<LaporanBukuKas> => {
        const query = buildQueryString(filters as any);
        const { data } = await apiClient.get(`${API_ENDPOINTS.LAPORAN.BUKU_KAS}${query}`);
        return data.data;
    },

    getRekapAnggaran: async (filters: LaporanFilter): Promise<LaporanRekapAnggaran> => {
        const query = buildQueryString(filters as any);
        const { data } = await apiClient.get(`${API_ENDPOINTS.LAPORAN.REKAP_ANGGARAN}${query}`);
        return data.data;
    },

    exportPdf: async (type: 'buku-kas' | 'rekap-anggaran', filters: LaporanFilter): Promise<Blob> => {
        const query = buildQueryString({ ...filters, type });
        const { data } = await apiClient.get(`${API_ENDPOINTS.LAPORAN.EXPORT_PDF}${query}`, {
            responseType: 'blob',
        });
        return data;
    },

    exportExcel: async (type: 'buku-kas' | 'rekap-anggaran', filters: LaporanFilter): Promise<Blob> => {
        const query = buildQueryString({ ...filters, type });
        const { data } = await apiClient.get(`${API_ENDPOINTS.LAPORAN.EXPORT_EXCEL}${query}`, {
            responseType: 'blob',
        });
        return data;
    },
};
