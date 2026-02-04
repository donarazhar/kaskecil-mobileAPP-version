import { apiClient } from '../client';
import { API_ENDPOINTS } from '../shared';
import type { Cabang, CreateCabangDTO, UpdateCabangDTO } from '../shared';

export const cabangService = {
    getAll: async (): Promise<Cabang[]> => {
        const { data } = await apiClient.get(API_ENDPOINTS.CABANG.LIST);
        return data.data;
    },

    getById: async (id: number): Promise<Cabang> => {
        const { data } = await apiClient.get(API_ENDPOINTS.CABANG.DETAIL(id));
        return data.data;
    },

    create: async (payload: CreateCabangDTO): Promise<Cabang> => {
        const { data } = await apiClient.post(API_ENDPOINTS.CABANG.CREATE, payload);
        return data.data;
    },

    update: async (id: number, payload: UpdateCabangDTO): Promise<Cabang> => {
        const { data } = await apiClient.put(API_ENDPOINTS.CABANG.UPDATE(id), payload);
        return data.data;
    },

    delete: async (id: number): Promise<void> => {
        await apiClient.delete(API_ENDPOINTS.CABANG.DELETE(id));
    },
};
