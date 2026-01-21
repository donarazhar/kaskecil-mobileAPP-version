import { apiClient } from '../client';
import { API_ENDPOINTS, buildQueryString } from '@kas-kecil/shared';
import type {
    AkunAAS, CreateAkunAASDTO, UpdateAkunAASDTO,
    MataAnggaran, CreateMataAnggaranDTO, UpdateMataAnggaranDTO,
    Instansi, UpdateInstansiDTO
} from '@kas-kecil/shared';

export const masterService = {
    // Akun AAS
    getAkunAAS: async (filters?: { unit_id?: number }): Promise<AkunAAS[]> => {
        const query = buildQueryString(filters || {});
        const { data } = await apiClient.get(`${API_ENDPOINTS.MASTER.AKUN_AAS.LIST}${query}`);
        return data.data;
    },

    createAkunAAS: async (payload: CreateAkunAASDTO): Promise<AkunAAS> => {
        const { data } = await apiClient.post(API_ENDPOINTS.MASTER.AKUN_AAS.CREATE, payload);
        return data.data;
    },

    updateAkunAAS: async (id: number, payload: UpdateAkunAASDTO): Promise<AkunAAS> => {
        const { data } = await apiClient.put(API_ENDPOINTS.MASTER.AKUN_AAS.UPDATE(id), payload);
        return data.data;
    },

    deleteAkunAAS: async (id: number): Promise<void> => {
        await apiClient.delete(API_ENDPOINTS.MASTER.AKUN_AAS.DELETE(id));
    },

    // Mata Anggaran
    getMataAnggaran: async (filters?: { unit_id?: number; tahun?: number }): Promise<MataAnggaran[]> => {
        const query = buildQueryString(filters || {});
        const { data } = await apiClient.get(`${API_ENDPOINTS.MASTER.MATA_ANGGARAN.LIST}${query}`);
        return data.data;
    },

    createMataAnggaran: async (payload: CreateMataAnggaranDTO): Promise<MataAnggaran> => {
        const { data } = await apiClient.post(API_ENDPOINTS.MASTER.MATA_ANGGARAN.CREATE, payload);
        return data.data;
    },

    updateMataAnggaran: async (id: number, payload: UpdateMataAnggaranDTO): Promise<MataAnggaran> => {
        const { data } = await apiClient.put(API_ENDPOINTS.MASTER.MATA_ANGGARAN.UPDATE(id), payload);
        return data.data;
    },

    deleteMataAnggaran: async (id: number): Promise<void> => {
        await apiClient.delete(API_ENDPOINTS.MASTER.MATA_ANGGARAN.DELETE(id));
    },

    // Instansi
    getInstansi: async (): Promise<Instansi> => {
        const { data } = await apiClient.get(API_ENDPOINTS.MASTER.INSTANSI.GET);
        return data.data;
    },

    updateInstansi: async (payload: UpdateInstansiDTO): Promise<Instansi> => {
        const { data } = await apiClient.put(API_ENDPOINTS.MASTER.INSTANSI.UPDATE, payload);
        return data.data;
    },
};
