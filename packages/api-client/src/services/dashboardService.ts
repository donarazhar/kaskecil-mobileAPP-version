import { apiClient } from '../client';
import { API_ENDPOINTS } from '@kas-kecil/shared';
import type { DashboardSummary, ChartData, TopAnggaran, Transaksi, DashboardFilter } from '@kas-kecil/shared';
import { buildQueryString } from '@kas-kecil/shared';

export const dashboardService = {
    getSummary: async (filters?: DashboardFilter): Promise<DashboardSummary> => {
        const query = buildQueryString((filters || {}) as any);
        const { data } = await apiClient.get(`${API_ENDPOINTS.DASHBOARD.SUMMARY}${query}`);
        return data.data;
    },

    getChart: async (filters?: DashboardFilter): Promise<ChartData[]> => {
        const query = buildQueryString((filters || {}) as any);
        const { data } = await apiClient.get(`${API_ENDPOINTS.DASHBOARD.CHART}${query}`);
        return data.data;
    },

    getRecent: async (filters?: DashboardFilter & { limit?: number }): Promise<Transaksi[]> => {
        const query = buildQueryString({ limit: 5, ...filters } as any);
        const { data } = await apiClient.get(`${API_ENDPOINTS.DASHBOARD.RECENT}${query}`);
        return data.data;
    },

    getTopAnggaran: async (filters?: DashboardFilter): Promise<TopAnggaran[]> => {
        const query = buildQueryString((filters || {}) as any);
        const { data } = await apiClient.get(`${API_ENDPOINTS.DASHBOARD.TOP_ANGGARAN}${query}`);
        return data.data;
    },
};
