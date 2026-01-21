import { apiClient } from '../client';
import { API_ENDPOINTS } from '@kas-kecil/shared';
import type { AuthResponse, LoginCredentials, ForgotPasswordRequest, ResetPasswordRequest, User } from '@kas-kecil/shared';

export interface UpdateProfileRequest {
    nama?: string;
    telepon?: string;
}

export interface ChangePasswordRequest {
    current_password: string;
    password: string;
    password_confirmation: string;
}

export const authService = {
    login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
        const { data } = await apiClient.post(API_ENDPOINTS.AUTH.LOGIN, credentials);
        return data.data;
    },

    logout: async (): Promise<void> => {
        await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT);
    },

    me: async (): Promise<User> => {
        const { data } = await apiClient.get(API_ENDPOINTS.AUTH.ME);
        return data.data;
    },

    forgotPassword: async (request: ForgotPasswordRequest): Promise<void> => {
        await apiClient.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, request);
    },

    resetPassword: async (request: ResetPasswordRequest): Promise<void> => {
        await apiClient.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, request);
    },

    updateProfile: async (request: UpdateProfileRequest): Promise<User> => {
        const { data } = await apiClient.put(API_ENDPOINTS.AUTH.UPDATE_PROFILE, request);
        return data.data;
    },

    changePassword: async (request: ChangePasswordRequest): Promise<void> => {
        await apiClient.post(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, request);
    },

    updateFcmToken: async (token: string): Promise<void> => {
        await apiClient.post(API_ENDPOINTS.AUTH.FCM_TOKEN, { fcm_token: token });
    },
};

