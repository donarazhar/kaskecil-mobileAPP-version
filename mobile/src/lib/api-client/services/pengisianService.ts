import { apiClient } from '../client';
import { API_ENDPOINTS, buildQueryString } from '../shared';
import type { PengisianPending, PengisianHistory, ProcessPengisianDTO } from '../shared';

export const pengisianService = {
    getPending: async (filters?: { cabang_id?: number; unit_id?: number }): Promise<PengisianPending> => {
        const query = buildQueryString(filters || {});
        const { data } = await apiClient.get(`${API_ENDPOINTS.PENGISIAN.PENDING}${query}`);
        return data.data;
    },

    process: async (payload: ProcessPengisianDTO): Promise<void> => {
        await apiClient.post(API_ENDPOINTS.PENGISIAN.PROCESS, payload);
    },

    getHistory: async (filters?: { cabang_id?: number; page?: number }): Promise<PengisianHistory[]> => {
        const query = buildQueryString(filters || {});
        const { data } = await apiClient.get(`${API_ENDPOINTS.PENGISIAN.HISTORY}${query}`);
        return data.data;
    },
};
