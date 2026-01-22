import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '@/lib/api-client';
import { ArrowLeft, Lock, Save, Eye, EyeOff } from 'lucide-react-native';
import { useForm, Controller } from 'react-hook-form';

interface FormData {
    current_password: string;
    password: string;
    password_confirmation: string;
}

export default function ChangePasswordScreen() {
    const navigation = useNavigation();
    const { changePassword, isChangePasswordLoading } = useAuth();

    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const { control, handleSubmit, watch, reset, formState: { errors } } = useForm<FormData>({
        defaultValues: {
            current_password: '',
            password: '',
            password_confirmation: '',
        }
    });

    const newPassword = watch('password');

    const onSubmit = async (data: FormData) => {
        try {
            await changePassword({
                current_password: data.current_password,
                password: data.password,
                password_confirmation: data.password_confirmation,
            });
            Alert.alert('Sukses', 'Password berhasil diubah', [
                {
                    text: 'OK', onPress: () => {
                        reset();
                        navigation.goBack();
                    }
                }
            ]);
        } catch (error: any) {
            console.error('Change password error:', error);
            const errorMessage = error.response?.data?.message || 'Gagal mengubah password';
            const validationErrors = error.response?.data?.errors;

            if (validationErrors) {
                const detailedErrors = Object.values(validationErrors).flat().join('\n');
                Alert.alert('Validasi Gagal', detailedErrors);
            } else {
                Alert.alert('Error', errorMessage);
            }
        }
    };

    const PasswordInput = ({
        name,
        label,
        placeholder,
        showPassword,
        togglePassword,
        rules,
        error
    }: {
        name: keyof FormData,
        label: string,
        placeholder: string,
        showPassword: boolean,
        togglePassword: () => void,
        rules?: object,
        error?: any
    }) => (
        <View className="mb-4">
            <Text className="text-sm font-bold text-gray-700 mb-2">{label}</Text>
            <View className={`flex-row items-center bg-gray-50 border rounded-xl px-4 h-12 ${error ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}>
                <Lock size={18} color={error ? '#EF4444' : '#9CA3AF'} />
                <Controller
                    control={control}
                    rules={rules}
                    render={({ field: { onChange, onBlur, value } }) => (
                        <TextInput
                            className="flex-1 ml-3 text-gray-900 text-base"
                            placeholder={placeholder}
                            onBlur={onBlur}
                            onChangeText={onChange}
                            value={value}
                            secureTextEntry={!showPassword}
                            editable={!isChangePasswordLoading}
                        />
                    )}
                    name={name}
                />
                <TouchableOpacity onPress={togglePassword} className="p-1">
                    {showPassword ? (
                        <EyeOff size={18} color="#9CA3AF" />
                    ) : (
                        <Eye size={18} color="#9CA3AF" />
                    )}
                </TouchableOpacity>
            </View>
            {error && (
                <Text className="text-red-500 text-xs mt-1 ml-1">{error.message}</Text>
            )}
        </View>
    );

    return (
        <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
            {/* Header */}
            <View className="px-4 py-3 bg-white flex-row items-center border-b border-gray-100">
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    className="mr-3 w-10 h-10 items-center justify-center rounded-full bg-gray-100"
                    activeOpacity={0.7}
                    disabled={isChangePasswordLoading}
                >
                    <ArrowLeft size={20} color="#374151" />
                </TouchableOpacity>
                <Text className="text-lg font-bold text-gray-900 flex-1">Ganti Password</Text>
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                className="flex-1"
            >
                <ScrollView className="flex-1 px-4 pt-6">
                    <View className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm mb-6">

                        <PasswordInput
                            name="current_password"
                            label="Password Saat Ini"
                            placeholder="Masukkan password saat ini"
                            showPassword={showCurrentPassword}
                            togglePassword={() => setShowCurrentPassword(!showCurrentPassword)}
                            rules={{ required: 'Password saat ini wajib diisi' }}
                            error={errors.current_password}
                        />

                        <PasswordInput
                            name="password"
                            label="Password Baru"
                            placeholder="Masukkan password baru"
                            showPassword={showNewPassword}
                            togglePassword={() => setShowNewPassword(!showNewPassword)}
                            rules={{
                                required: 'Password baru wajib diisi',
                                minLength: { value: 8, message: 'Password minimal 8 karakter' }
                            }}
                            error={errors.password}
                        />

                        <PasswordInput
                            name="password_confirmation"
                            label="Konfirmasi Password Baru"
                            placeholder="Ulangi password baru"
                            showPassword={showConfirmPassword}
                            togglePassword={() => setShowConfirmPassword(!showConfirmPassword)}
                            rules={{
                                required: 'Konfirmasi password wajib diisi',
                                validate: (val: string) => val === newPassword || 'Konfirmasi password tidak cocok'
                            }}
                            error={errors.password_confirmation}
                        />

                    </View>

                    <Text className="text-gray-400 text-xs text-center px-4 leading-5">
                        Gunakan password yang kuat dengan minimal 8 karakter, kombinasi huruf dan angka.
                    </Text>

                </ScrollView>

                {/* Footer Button */}
                <View className="p-4 bg-white border-t border-gray-100">
                    <TouchableOpacity
                        className={`flex-row items-center justify-center py-4 rounded-2xl shadow-sm ${isChangePasswordLoading ? 'bg-blue-400' : 'bg-blue-600'}`}
                        onPress={handleSubmit(onSubmit)}
                        disabled={isChangePasswordLoading}
                        activeOpacity={0.8}
                    >
                        {isChangePasswordLoading ? (
                            <ActivityIndicator color="white" size="small" />
                        ) : (
                            <>
                                <Save size={20} color="white" className="mr-2" />
                                <Text className="text-white font-bold text-base">Simpan Password</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
