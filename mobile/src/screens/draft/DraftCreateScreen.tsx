import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView, ActivityIndicator, Platform, Alert, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useDraft, useAuth } from '@/lib/api-client';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Calendar, FileText, Camera, Image as ImageIcon, X } from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import { formatDateTime } from '@/lib/shared';
import clsx from 'clsx';

export default function DraftCreateScreen() {
    const navigation = useNavigation<any>();
    const { create, isCreating } = useDraft();
    const { user } = useAuth();

    const [formData, setFormData] = useState({
        tanggal: new Date(),
        jumlah: '',
        keterangan: ''
    });

    const [showDatePicker, setShowDatePicker] = useState(false);
    const [selectedImage, setSelectedImage] = useState<ImagePicker.ImagePickerAsset | null>(null);

    const handleImagePick = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.5,
            });

            if (!result.canceled) {
                setSelectedImage(result.assets[0]);
            }
        } catch (error) {
            Alert.alert('Error', 'Gagal memuat gambar');
        }
    };

    const handleCamera = async () => {
        try {
            const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
            if (permissionResult.granted === false) {
                Alert.alert("Permission to access camera is required!");
                return;
            }

            const result = await ImagePicker.launchCameraAsync({
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.5,
            });

            if (!result.canceled) {
                setSelectedImage(result.assets[0]);
            }
        } catch (error) {
            Alert.alert('Error', 'Gagal membuka kamera');
        }
    };

    const handleSubmit = async () => {
        if (!formData.jumlah || !formData.keterangan) {
            Alert.alert('Mohon lengkapi semua data');
            return;
        }
        try {
            const payload: any = {
                tanggal: formData.tanggal.toISOString().split('T')[0],
                jumlah: parseInt(formData.jumlah.replace(/\D/g, '')),
                keterangan: formData.keterangan,
                cabang_id: user?.cabang?.id || 1, // Fallback to 1
            };

            if (selectedImage) {
                const localUri = selectedImage.uri;
                const filename = localUri.split('/').pop();
                const match = /\.(\w+)$/.exec(filename || '');
                const type = match ? `image/${match[1]}` : `image`;

                payload.lampiran = {
                    uri: localUri,
                    name: filename,
                    type,
                };
            }

            await create(payload);
            Alert.alert('Sukses', 'Draft berhasil diajukan');
            navigation.goBack();
        } catch (error: any) {
            console.error(error);
            Alert.alert('Error', error?.message || 'Gagal menyimpan draft');
        }
    };

    const formatInputCurrency = (text: string) => {
        const clean = text.replace(/\D/g, '');
        if (!clean) return '';
        return new Intl.NumberFormat('id-ID').format(parseInt(clean));
    };

    const onDateChange = (event: any, selectedDate?: Date) => {
        setShowDatePicker(Platform.OS === 'ios');
        if (selectedDate) {
            setFormData({ ...formData, tanggal: selectedDate });
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-white" edges={['top']}>
            <View className="flex-row items-center px-6 py-4 border-b border-gray-100">
                <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4 w-10 h-10 items-center justify-center rounded-full bg-gray-50">
                    <ArrowLeft size={24} color="#374151" />
                </TouchableOpacity>
                <Text className="text-xl font-bold text-gray-900">Pengajuan Anggaran</Text>
            </View>

            <ScrollView className="flex-1 p-6">
                <View className="bg-orange-50 p-4 rounded-xl mb-6 border border-orange-100">
                    <Text className="text-orange-800 text-sm">
                        Formulir ini digunakan untuk mengajukan anggaran baru yang memerlukan persetujuan atasan sebelum dana dapat dicairkan.
                    </Text>
                </View>

                <View className="space-y-4">
                    <View>
                        <Text className="text-gray-700 font-medium mb-2 ml-1">Jumlah Pengajuan (Rp)</Text>
                        <TextInput
                            className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 text-xl font-bold text-gray-900"
                            placeholder="0"
                            keyboardType="numeric"
                            value={formData.jumlah}
                            onChangeText={(text) => setFormData({ ...formData, jumlah: formatInputCurrency(text) })}
                        />
                    </View>

                    <View>
                        <Text className="text-gray-700 font-medium mb-2 ml-1">Tanggal Diperlukan</Text>
                        <TouchableOpacity
                            onPress={() => setShowDatePicker(true)}
                            className="flex-row items-center bg-gray-50 border border-gray-200 rounded-xl px-4 py-3"
                        >
                            <Calendar size={20} color="#6B7280" />
                            <Text className="flex-1 ml-3 text-gray-900 font-medium">
                                {formatDateTime(formData.tanggal.toISOString())}
                            </Text>
                        </TouchableOpacity>

                        {showDatePicker && (
                            <DateTimePicker
                                value={formData.tanggal}
                                mode="date"
                                display="default"
                                onChange={onDateChange}
                                minimumDate={new Date()} // Can't start in past
                            />
                        )}
                    </View>

                    <View>
                        <Text className="text-gray-700 font-medium mb-2 ml-1">Keperluan / Keterangan</Text>
                        <TextInput
                            className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 h-32"
                            placeholder="Jelaskan detail pengajuan..."
                            multiline
                            textAlignVertical="top"
                            value={formData.keterangan}
                            onChangeText={(text) => setFormData({ ...formData, keterangan: text })}
                        />
                    </View>

                    <View>
                        <Text className="text-gray-700 font-medium mb-2 ml-1">Lampiran Pendukung (Opsional)</Text>

                        {!selectedImage ? (
                            <View className="flex-row gap-3">
                                <TouchableOpacity
                                    className="flex-1 bg-gray-50 border border-gray-200 border-dashed rounded-xl p-6 items-center justify-center"
                                    onPress={handleCamera}
                                >
                                    <Camera size={24} color="#9CA3AF" />
                                    <Text className="text-gray-400 mt-2 text-xs font-bold">Kamera</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    className="flex-1 bg-gray-50 border border-gray-200 border-dashed rounded-xl p-6 items-center justify-center"
                                    onPress={handleImagePick}
                                >
                                    <ImageIcon size={24} color="#9CA3AF" />
                                    <Text className="text-gray-400 mt-2 text-xs font-bold">Galeri</Text>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <View className="relative rounded-xl overflow-hidden border border-gray-200">
                                <Image
                                    source={{ uri: selectedImage.uri }}
                                    className="w-full h-48 bg-gray-100"
                                    resizeMode="cover"
                                />
                                <TouchableOpacity
                                    className="absolute top-2 right-2 bg-black/50 p-2 rounded-full"
                                    onPress={() => setSelectedImage(null)}
                                >
                                    <X size={16} color="white" />
                                </TouchableOpacity>
                                <View className="absolute bottom-0 w-full bg-black/50 p-2">
                                    <Text className="text-white text-xs text-center" numberOfLines={1}>
                                        {selectedImage.fileName || 'Image Selected'}
                                    </Text>
                                </View>
                            </View>
                        )}
                    </View>
                </View>
            </ScrollView>

            <View className="p-6 border-t border-gray-100 bg-white">
                <TouchableOpacity
                    className={clsx(
                        "w-full bg-orange-500 p-4 rounded-xl items-center shadow-lg shadow-orange-200",
                        isCreating && "opacity-70"
                    )}
                    onPress={handleSubmit}
                    disabled={isCreating}
                >
                    {isCreating ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <Text className="text-white font-bold text-lg">Ajukan Draft</Text>
                    )}
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}
