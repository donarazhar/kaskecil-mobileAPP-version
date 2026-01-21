import { apiClient } from '../client';
import { API_ENDPOINTS, buildQueryString } from '@kas-kecil/shared';
import type { User, CreateUserDTO, UpdateUserDTO, Role, PaginatedResponse } from '@kas-kecil/shared';

export const userService = {
    getAll: async (filters?: { page?: number; search?: string }): Promise<PaginatedResponse<User>> => {
        const query = buildQueryString(filters || {});
        const { data } = await apiClient.get(`${API_ENDPOINTS.USERS.LIST}${query}`);
        return data;
    },

    getById: async (id: number): Promise<User> => {
        const { data } = await apiClient.get(API_ENDPOINTS.USERS.DETAIL(id));
        return data.data;
    },

    create: async (payload: CreateUserDTO): Promise<User> => {
        const { data } = await apiClient.post(API_ENDPOINTS.USERS.CREATE, payload);
        return data.data;
    },

    update: async (id: number, payload: UpdateUserDTO): Promise<User> => {
        const { data } = await apiClient.put(API_ENDPOINTS.USERS.UPDATE(id), payload);
        return data.data;
    },

    delete: async (id: number): Promise<void> => {
        await apiClient.delete(API_ENDPOINTS.USERS.DELETE(id));
    },

    toggleStatus: async (id: number): Promise<User> => {
        const { data } = await apiClient.post(API_ENDPOINTS.USERS.TOGGLE_STATUS(id));
        return data.data;
    },

    getRoles: async (): Promise<Role[]> => {
        const { data } = await apiClient.get(API_ENDPOINTS.ROLES.LIST);
        return data.data;
    },
};
