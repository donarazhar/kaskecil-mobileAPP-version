import React, { useEffect, useState, useCallback } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SecureStore from 'expo-secure-store';
import * as NativeSplashScreen from 'expo-splash-screen';
import { configureApiClient } from '@kas-kecil/api-client';
import { STORAGE_KEYS } from '@kas-kecil/shared';
import RootNavigator from './navigation/RootNavigator';
import AnimatedSplashScreen from './screens/SplashScreen';

// API URL for mobile - point to your backend server
// Use your computer's network IP when testing on physical device
const API_URL = 'http://10.0.2.2:8000/api';

// Token cache for sync access (SecureStore is async)
let tokenCache: string | null = null;
let userCache: string | null = null;

// Configure API client for React Native environment
configureApiClient({
    apiUrl: API_URL,
    getToken: () => tokenCache,
    setToken: async (token: string) => {
        tokenCache = token;
        await SecureStore.setItemAsync(STORAGE_KEYS.TOKEN, token);
    },
    removeToken: async () => {
        tokenCache = null;
        await SecureStore.deleteItemAsync(STORAGE_KEYS.TOKEN);
    },
    getUser: () => userCache,
    setUser: async (user: string) => {
        userCache = user;
        await SecureStore.setItemAsync(STORAGE_KEYS.USER, user);
    },
    removeUser: async () => {
        userCache = null;
        await SecureStore.deleteItemAsync(STORAGE_KEYS.USER);
    },
    onUnauthorized: () => {
        // Navigation will be handled by auth context/navigator
        console.log('Unauthorized - user needs to re-login');
    },
});

const queryClient = new QueryClient();

// Prevent native splash from auto hiding
NativeSplashScreen.preventAutoHideAsync();

export default function App() {
    const [isDataReady, setIsDataReady] = useState(false);
    const [isSplashAnimationComplete, setIsSplashAnimationComplete] = useState(false);

    useEffect(() => {
        const restoreSession = async () => {
            try {
                // Hide native splash immediately to show our custom one
                await NativeSplashScreen.hideAsync();

                const token = await SecureStore.getItemAsync(STORAGE_KEYS.TOKEN);
                const user = await SecureStore.getItemAsync(STORAGE_KEYS.USER);

                if (token) {
                    tokenCache = token;
                }
                if (user) {
                    userCache = user;
                }
            } catch (e) {
                console.error('Failed to restore session', e);
            } finally {
                setIsDataReady(true);
            }
        };

        restoreSession();
    }, []);

    const handleSplashFinish = useCallback(() => {
        setIsSplashAnimationComplete(true);
    }, []);

    // Show splash while either data is loading OR animation is not complete
    const showSplash = !isDataReady || !isSplashAnimationComplete;

    if (showSplash) {
        return <AnimatedSplashScreen onFinish={handleSplashFinish} />;
    }

    return (
        <QueryClientProvider client={queryClient}>
            <SafeAreaProvider>
                <RootNavigator />
            </SafeAreaProvider>
        </QueryClientProvider>
    );
}
