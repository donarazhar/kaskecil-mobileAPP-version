import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { authService } from '@/lib/api-client';
import { ArrowLeft, Mail, KeyRound } from 'lucide-react-native';
import clsx from 'clsx';

export default function ForgotPasswordScreen() {
    const navigation = useNavigation();
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleSubmit = async () => {
        if (!email) {
            Alert.alert('Error', 'Mohonukkan email Anda');
            return;
        }

        try {
            setIsLoading(true);
            await authService.forgotPassword({ email });
            setIsSuccess(true);
        } catch (error: any) {
            Alert.alert('Error', error.response?.data?.message || 'Gagal mengirim email reset password');
        } finally {
            setIsLoading(false);
        }
    };

    if (isSuccess) {
        return (
            <SafeAreaView className="flex-1 bg-white p-6 justify-center items-center">
                <View className="mb-6 bg-green-100 p-4 rounded-full">
                    <Mail size={48} color="#15803D" />
                </View>
                <Text className="text-2xl font-bold text-gray-900 mb-2 text-center">Cek Email Anda</Text>
                <Text className="text-gray-500 text-center mb-8">
                    Kami telah mengirimkan instruksi reset password ke {email}
                </Text>
                <TouchableOpacity
                    className="w-full bg-blue-600 py-4 rounded-xl items-center"
                    onPress={() => navigation.goBack()}
                >
                    <Text className="text-white font-bold text-lg">Kembali ke Login</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-white">
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1"
            >
                <View className="px-6 py-4">
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        className="w-10 h-10 items-center justify-center rounded-full bg-gray-50"
                    >
                        <ArrowLeft size={24} color="#1F2937" />
                    </TouchableOpacity>
                </View>

                <View className="flex-1 px-6 justify-center pb-20">
                    <View className="items-center mb-8">
                        <View className="bg-blue-50 p-4 rounded-full mb-4">
                            <KeyRound size={40} color="#2563EB" />
                        </View>
                        <Text className="text-3xl font-bold text-gray-900 mb-2">Lupa Password?</Text>
                        <Text className="text-gray-500 text-center">
                            Jangan khawatir! Masukkan email yang terdaftar dan kami akan mengirimkan link reset password.
                        </Text>
                    </View>

                    <View className="space-y-4">
                        <View>
                            <Text className="text-gray-700 font-medium mb-1.5 ml-1">Email</Text>
                            <View className="flex-row items-center bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 focus:border-blue-500 focus:bg-white transition-colors">
                                <Mail size={20} color="#9CA3AF" />
                                <TextInput
                                    className="flex-1 ml-3 text-gray-900 text-base"
                                    placeholder="nama@email.com"
                                    placeholderTextColor="#9CA3AF"
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    value={email}
                                    onChangeText={setEmail}
                                    editable={!isLoading}
                                />
                            </View>
                        </View>

                        <TouchableOpacity
                            className={clsx(
                                "w-full bg-blue-600 py-4 rounded-xl items-center shadow-lg shadow-blue-200 mt-4",
                                isLoading && "opacity-70"
                            )}
                            onPress={handleSubmit}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <Text className="text-white font-bold text-lg">Kirim Link Reset</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
