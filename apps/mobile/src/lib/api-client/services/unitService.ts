import { apiClient } from '../client';
import { API_ENDPOINTS } from '../shared';
import type { Unit, CreateUnitDTO, UpdateUnitDTO } from '../shared';

export const unitService = {
    getAll: async (cabang_id?: number): Promise<Unit[]> => {
        const query = cabang_id ? `?cabang_id=${cabang_id}` : '';
        const { data } = await apiClient.get(`${API_ENDPOINTS.UNIT.LIST}${query}`);
        return data.data;
    },

    getById: async (id: number): Promise<Unit> => {
        const { data } = await apiClient.get(API_ENDPOINTS.UNIT.DETAIL(id));
        return data.data;
    },

    create: async (payload: CreateUnitDTO): Promise<Unit> => {
        const { data } = await apiClient.post(API_ENDPOINTS.UNIT.CREATE, payload);
        return data.data;
    },

    update: async (id: number, payload: UpdateUnitDTO): Promise<Unit> => {
        const { data } = await apiClient.put(API_ENDPOINTS.UNIT.UPDATE(id), payload);
        return data.data;
    },

    delete: async (id: number): Promise<void> => {
        await apiClient.delete(API_ENDPOINTS.UNIT.DELETE(id));
    },
};
