// Local useAuth implementation
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';

interface User {
    id: number;
    nama: string;
    email: string;
    role?: {
        name: string;
        display_name?: string;
    };
    unit_id?: number;
    foto?: string;
}

export function useAuth() {
    const queryClient = useQueryClient();

    const { data: user, isLoading, isError } = useQuery<User | null>({
        queryKey: ['auth', 'user'],
        queryFn: async () => {
            const token = localStorage.getItem('auth_token');
            if (!token) return null;
            
            try {
                apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                const response = await apiClient.get('/user');
                return response.data.data || response.data;
            } catch (error) {
                localStorage.removeItem('auth_token');
                return null;
            }
        },
        retry: false,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });

    const loginMutation = useMutation({
        mutationFn: async (credentials: { email: string; password: string }) => {
            const response = await apiClient.post('/login', credentials);
            const token = response.data.token || response.data.data?.token;
            if (token) {
                localStorage.setItem('auth_token', token);
                apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            }
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['auth', 'user'] });
        },
    });

    const logout = async () => {
        try {
            await apiClient.post('/logout');
        } catch {
            // Ignore logout errors
        }
        localStorage.removeItem('auth_token');
        delete apiClient.defaults.headers.common['Authorization'];
        queryClient.clear();
        window.location.href = '/login';
    };

    return {
        user,
        isLoading,
        isError,
        isAuthenticated: !!user,
        login: loginMutation.mutateAsync,
        logout,
        loginError: loginMutation.error,
        isLoginLoading: loginMutation.isPending,
    };
}

