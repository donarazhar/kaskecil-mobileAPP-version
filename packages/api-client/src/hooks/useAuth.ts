import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { getApiConfig } from '../client';
import { QUERY_KEYS } from '@kas-kecil/shared';
import type { AuthResponse } from '@kas-kecil/shared';

export function useAuth() {
    const queryClient = useQueryClient();
    const config = getApiConfig();

    // Use state to track token existence (works for both web and mobile)
    const [hasToken, setHasToken] = useState<boolean>(() => {
        const token = config.getToken();
        return !!token;
    });

    // Update hasToken when component mounts (for async storage scenarios)
    useEffect(() => {
        const token = config.getToken();
        setHasToken(!!token);
    }, []);

    const { data: user, isLoading } = useQuery({
        queryKey: QUERY_KEYS.AUTH.ME,
        queryFn: authService.me,
        retry: false,
        staleTime: 5 * 60 * 1000,
        enabled: hasToken,
    });

    const loginMutation = useMutation({
        mutationFn: authService.login,
        onSuccess: (data: AuthResponse) => {
            config.setToken(data.token);
            config.setUser(JSON.stringify(data.user));
            setHasToken(true);
            queryClient.setQueryData(QUERY_KEYS.AUTH.ME, data.user);
        },
    });

    const logoutMutation = useMutation({
        mutationFn: authService.logout,
        onSuccess: () => {
            // Ensure we wait for potential async operations in config if possible, 
            // but since they are void in interface, we assume they fire off.
            config.removeToken();
            config.removeUser();
            setHasToken(false);

            // Forcefully set user data to null to update UI immediately
            queryClient.setQueryData(QUERY_KEYS.AUTH.ME, null);
            queryClient.removeQueries({ queryKey: QUERY_KEYS.AUTH.ME });
            queryClient.clear();
        },
    });

    const logout = useCallback(async () => {
        try {
            await logoutMutation.mutateAsync();
        } catch {
            // Even if logout API fails, clear local state
            config.removeToken();
            config.removeUser();
            setHasToken(false);

            // Forcefully set user data to null to update UI immediately
            queryClient.setQueryData(QUERY_KEYS.AUTH.ME, null);
            queryClient.removeQueries({ queryKey: QUERY_KEYS.AUTH.ME });
            queryClient.clear();
        }
    }, [logoutMutation, queryClient, config]);

    const updateProfileMutation = useMutation({
        mutationFn: authService.updateProfile,
        onSuccess: (updatedUser) => {
            queryClient.setQueryData(QUERY_KEYS.AUTH.ME, updatedUser);
            // Also update stored user in config if needed
            config.setUser(JSON.stringify(updatedUser));
        },
    });

    const changePasswordMutation = useMutation({
        mutationFn: authService.changePassword,
    });

    return {
        user,
        isLoading: hasToken ? isLoading : false,
        isAuthenticated: !!user,
        login: loginMutation.mutateAsync,
        logout,
        updateProfile: updateProfileMutation.mutateAsync,
        changePassword: changePasswordMutation.mutateAsync,
        isLoginLoading: loginMutation.isPending,
        isLogoutLoading: logoutMutation.isPending,
        isUpdateProfileLoading: updateProfileMutation.isPending,
        isChangePasswordLoading: changePasswordMutation.isPending,
    };
}
