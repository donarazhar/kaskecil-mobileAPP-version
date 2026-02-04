import axios from 'axios';

// API Client - using Bearer token auth (no credentials/cookies needed)
export const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

export const configureApiClient = (config: any) => {
    if (config.apiUrl) {
        apiClient.defaults.baseURL = config.apiUrl;
    }
};

export const getApiConfig = () => ({ apiUrl: apiClient.defaults.baseURL });

// Mock Hooks (returning empty/loading state to prevent crash)
const mockQuery = { data: [], isLoading: false, isError: false, error: null, refetch: async () => { } };
const mockMutation = { mutate: async () => { }, isPending: false };

export const useAuth = () => ({
    user: { name: 'Admin Stub', email: 'admin@stub.com', role: 'super_admin' },
    login: async () => { },
    logout: async () => { },
    isLoading: false
});

export const useTransaksi = () => ({ ...mockQuery, data: [] });
export const useTransaksiDetail = () => ({ ...mockQuery, data: {} });
export const useMaster = () => ({ ...mockQuery, data: [] });
export const useCabang = () => ({ ...mockQuery, data: [] });
export const useUnit = () => ({ ...mockQuery, data: [] });
export const useUser = () => ({ ...mockQuery, data: [] });
export const useDraft = () => ({ ...mockQuery, data: [] });
export const useDraftDetail = () => ({ ...mockQuery, data: {} });
export const useLaporan = () => ({ ...mockQuery, data: [] });
export const useDashboard = () => ({ ...mockQuery, data: { total_kas: 0, total_masuk: 0, total_keluar: 0 } });

// Services Stub
export const transaksiService = { create: async () => { }, update: async () => { }, delete: async () => { } };
export const unitService = { create: async () => { }, update: async () => { }, delete: async () => { } };
export const userService = { create: async () => { }, update: async () => { }, delete: async () => { } };
export const cabangService = { create: async () => { }, update: async () => { }, delete: async () => { } };
export const masterService = {};
