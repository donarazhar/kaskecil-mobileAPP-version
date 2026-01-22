import axios, { type AxiosInstance, type AxiosError } from 'axios';
import { STORAGE_KEYS } from '../shared';

// Platform-agnostic config
let config = {
    apiUrl: 'https://api.donarazhar.site/api',
    getToken: (): string | null => null,
    setToken: (_token: string): void => { },
    removeToken: (): void => { },
    getUser: (): string | null => null,
    setUser: (_user: string): void => { },
    removeUser: (): void => { },
    onUnauthorized: (): void => { },
};

// Check if running in browser environment
const isBrowser = typeof window !== 'undefined' && typeof localStorage !== 'undefined';

// Initialize for web environment
if (isBrowser) {
    config.getToken = () => localStorage.getItem(STORAGE_KEYS.TOKEN);
    config.setToken = (token: string) => { localStorage.setItem(STORAGE_KEYS.TOKEN, token); };
    config.removeToken = () => { localStorage.removeItem(STORAGE_KEYS.TOKEN); };
    config.getUser = () => localStorage.getItem(STORAGE_KEYS.USER);
    config.setUser = (user: string) => { localStorage.setItem(STORAGE_KEYS.USER, user); };
    config.removeUser = () => { localStorage.removeItem(STORAGE_KEYS.USER); };
    config.onUnauthorized = () => {
        window.location.href = '/login';
    };
}

/**
 * Configure the API client for different platforms (web/mobile)
 * Call this before making any API requests to set the correct config
 */
export function configureApiClient(options: Partial<typeof config>): void {
    config = { ...config, ...options };
    apiClient.defaults.baseURL = config.apiUrl;
}

/**
 * Get the current API client configuration
 */
export function getApiConfig(): typeof config {
    return config;
}

const apiClient: AxiosInstance = axios.create({
    baseURL: config.apiUrl,
    headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
    },
});

// Request interceptor
apiClient.interceptors.request.use(
    (reqConfig) => {
        const token = config.getToken();
        if (token) {
            reqConfig.headers.Authorization = `Bearer ${token}`;
        }
        return reqConfig;
    },
    (error) => Promise.reject(error)
);

// Response interceptor
apiClient.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
        if (error.response?.status === 401) {
            config.removeToken();
            config.removeUser();
            config.onUnauthorized();
        }
        return Promise.reject(error);
    }
);

export { apiClient };
export default apiClient;
