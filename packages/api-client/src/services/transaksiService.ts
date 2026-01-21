import { apiClient } from '../client';
import { API_ENDPOINTS, buildQueryString } from '@kas-kecil/shared';
import type { Transaksi, CreateTransaksiDTO, UpdateTransaksiDTO, TransaksiFilter, PaginatedResponse } from '@kas-kecil/shared';

export const transaksiService = {
    getAll: async (filters?: TransaksiFilter): Promise<PaginatedResponse<Transaksi>> => {
        const query = buildQueryString((filters || {}) as any);
        const { data } = await apiClient.get(`${API_ENDPOINTS.TRANSAKSI.LIST}${query}`);
        return data;
    },

    getById: async (id: number): Promise<Transaksi> => {
        const { data } = await apiClient.get(API_ENDPOINTS.TRANSAKSI.DETAIL(id));
        return data.data;
    },

    create: async (payload: CreateTransaksiDTO): Promise<Transaksi> => {
        const formData = new FormData();
        Object.entries(payload).forEach(([key, value]) => {
            if (value !== null && value !== undefined) {
                const isFile = (v: any) => {
                    if (typeof File !== 'undefined' && v instanceof File) return true;
                    return v && typeof v === 'object' && 'uri' in v && 'type' in v && 'name' in v;
                };

                if (isFile(value)) {
                    formData.append(key, value as any);
                } else {
                    formData.append(key, String(value));
                }
            }
        });
        const { data } = await apiClient.post(API_ENDPOINTS.TRANSAKSI.CREATE, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return data.data;
    },

    update: async (id: number, payload: UpdateTransaksiDTO): Promise<Transaksi> => {
        const { data } = await apiClient.put(API_ENDPOINTS.TRANSAKSI.UPDATE(id), payload);
        return data.data;
    },

    delete: async (id: number): Promise<void> => {
        await apiClient.delete(API_ENDPOINTS.TRANSAKSI.DELETE(id));
    },

    cairkan: async (shadowId: number): Promise<Transaksi> => {
        const { data } = await apiClient.post(API_ENDPOINTS.TRANSAKSI.CAIRKAN(shadowId));
        return data.data;
    },
};
