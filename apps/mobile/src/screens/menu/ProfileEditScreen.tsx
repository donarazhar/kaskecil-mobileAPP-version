import React, { useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '@/lib/api-client';
import { ArrowLeft, Save, User, Phone } from 'lucide-react-native';
import { useForm, Controller } from 'react-hook-form';

interface FormData {
    nama: string;
    telepon: string;
}

export default function ProfileEditScreen() {
    const navigation = useNavigation();
    const { user, updateProfile, isUpdateProfileLoading } = useAuth();

    const { control, handleSubmit, setValue, formState: { errors } } = useForm<FormData>({
        defaultValues: {
            nama: '',
            telepon: '',
        }
    });

    useEffect(() => {
        if (user) {
            setValue('nama', user.nama);
            setValue('telepon', (user as any).phone || ''); // Handling potential field name mismatch 'phone' vs 'telepon' from API
        }
    }, [user, setValue]);

    const onSubmit = async (data: FormData) => {
        try {
            await updateProfile({
                nama: data.nama,
                telepon: data.telepon,
            });
            Alert.alert('Sukses', 'Profil berhasil diperbarui', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        } catch (error: any) {
            console.error('Update profile error:', error);
            Alert.alert('Error', error.response?.data?.message || 'Gagal memperbarui profil');
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
            {/* Header */}
            <View className="px-4 py-3 bg-white flex-row items-center border-b border-gray-100">
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    className="mr-3 w-10 h-10 items-center justify-center rounded-full bg-gray-100"
                    activeOpacity={0.7}
                    disabled={isUpdateProfileLoading}
                >
                    <ArrowLeft size={20} color="#374151" />
                </TouchableOpacity>
                <Text className="text-lg font-bold text-gray-900 flex-1">Edit Profil</Text>
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                className="flex-1"
            >
                <ScrollView className="flex-1 px-4 pt-6">
                    <View className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm mb-6">

                        {/* Nama Field */}
                        <View className="mb-4">
                            <Text className="text-sm font-bold text-gray-700 mb-2">Nama Lengkap</Text>
                            <View className={`flex-row items-center bg-gray-50 border rounded-xl px-4 h-12 ${errors.nama ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}>
                                <User size={18} color={errors.nama ? '#EF4444' : '#9CA3AF'} />
                                <Controller
                                    control={control}
                                    rules={{ required: 'Nama wajib diisi' }}
                                    render={({ field: { onChange, onBlur, value } }) => (
                                        <TextInput
                                            className="flex-1 ml-3 text-gray-900 text-base"
                                            placeholder="Masukkan nama lengkap"
                                            onBlur={onBlur}
                                            onChangeText={onChange}
                                            value={value}
                                            editable={!isUpdateProfileLoading}
                                        />
                                    )}
                                    name="nama"
                                />
                            </View>
                            {errors.nama && (
                                <Text className="text-red-500 text-xs mt-1 ml-1">{errors.nama.message}</Text>
                            )}
                        </View>

                        {/* Telepon Field */}
                        <View className="mb-2">
                            <Text className="text-sm font-bold text-gray-700 mb-2">No. Telepon</Text>
                            <View className={`flex-row items-center bg-gray-50 border rounded-xl px-4 h-12 ${errors.telepon ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}>
                                <Phone size={18} color={errors.telepon ? '#EF4444' : '#9CA3AF'} />
                                <Controller
                                    control={control}
                                    rules={{
                                        pattern: {
                                            value: /^(\+62|62|0)[0-9]{9,13}$/,
                                            message: 'Format nomor telepon tidak valid'
                                        }
                                    }}
                                    render={({ field: { onChange, onBlur, value } }) => (
                                        <TextInput
                                            className="flex-1 ml-3 text-gray-900 text-base"
                                            placeholder="Masukkan nomor telepon"
                                            keyboardType="phone-pad"
                                            onBlur={onBlur}
                                            onChangeText={onChange}
                                            value={value}
                                            editable={!isUpdateProfileLoading}
                                        />
                                    )}
                                    name="telepon"
                                />
                            </View>
                            {errors.telepon && (
                                <Text className="text-red-500 text-xs mt-1 ml-1">{errors.telepon.message}</Text>
                            )}
                        </View>

                    </View>

                    <Text className="text-gray-400 text-xs text-center px-4 leading-5">
                        Pastikan data yang Anda masukkan sudah benar. Informasi ini akan digunakan untuk keperluan administrasi.
                    </Text>

                </ScrollView>

                {/* Footer Button */}
                <View className="p-4 bg-white border-t border-gray-100">
                    <TouchableOpacity
                        className={`flex-row items-center justify-center py-4 rounded-2xl shadow-sm ${isUpdateProfileLoading ? 'bg-blue-400' : 'bg-blue-600'}`}
                        onPress={handleSubmit(onSubmit)}
                        disabled={isUpdateProfileLoading}
                        activeOpacity={0.8}
                    >
                        {isUpdateProfileLoading ? (
                            <ActivityIndicator color="white" size="small" />
                        ) : (
                            <>
                                <Save size={20} color="white" className="mr-2" />
                                <Text className="text-white font-bold text-base">Simpan Perubahan</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
