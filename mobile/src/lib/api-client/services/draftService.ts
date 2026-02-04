import { apiClient } from '../client';
import { API_ENDPOINTS, buildQueryString } from '../shared';
import type { Draft, CreateDraftDTO, UpdateDraftDTO, DraftFilter, ApprovalDTO, PaginatedResponse } from '../shared';

export const draftService = {
    getAll: async (filters?: DraftFilter): Promise<PaginatedResponse<Draft>> => {
        const query = buildQueryString((filters || {}) as any);
        const { data } = await apiClient.get(`${API_ENDPOINTS.DRAFT.LIST}${query}`);
        return data;
    },

    getById: async (id: number): Promise<Draft> => {
        const { data } = await apiClient.get(API_ENDPOINTS.DRAFT.DETAIL(id));
        return data.data;
    },

    create: async (payload: CreateDraftDTO): Promise<Draft> => {
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
        const { data } = await apiClient.post(API_ENDPOINTS.DRAFT.CREATE, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return data.data;
    },

    update: async (id: number, payload: UpdateDraftDTO): Promise<Draft> => {
        const { data } = await apiClient.put(API_ENDPOINTS.DRAFT.UPDATE(id), payload);
        return data.data;
    },

    delete: async (id: number): Promise<void> => {
        await apiClient.delete(API_ENDPOINTS.DRAFT.DELETE(id));
    },

    submit: async (id: number): Promise<Draft> => {
        const { data } = await apiClient.post(API_ENDPOINTS.DRAFT.SUBMIT(id));
        return data.data;
    },

    approve: async (id: number, payload?: ApprovalDTO): Promise<Draft> => {
        const { data } = await apiClient.post(API_ENDPOINTS.DRAFT.APPROVE(id), payload);
        return data.data;
    },

    reject: async (id: number, payload?: ApprovalDTO): Promise<Draft> => {
        const { data } = await apiClient.post(API_ENDPOINTS.DRAFT.REJECT(id), payload);
        return data.data;
    },
};
