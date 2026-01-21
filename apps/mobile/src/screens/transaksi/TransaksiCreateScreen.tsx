import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView, Image, ActivityIndicator, Platform, Alert, Modal, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTransaksi, useAuth, useMaster } from '@kas-kecil/api-client';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Camera, Calendar, Upload, X, Image as ImageIcon, ChevronDown, Check, Search } from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import { formatDateTime } from '@kas-kecil/shared';
import clsx from 'clsx';

export default function TransaksiCreateScreen() {
    const navigation = useNavigation<any>();
    const { create, isCreating } = useTransaksi();
    const { user } = useAuth();
    const { mataAnggaran, isMataAnggaranLoading } = useMaster({
        unit_id: user?.unit?.id
    });

    const [formData, setFormData] = useState({
        tanggal: new Date(),
        kategori: 'pengeluaran', // pengeluaran | pengisian
        jumlah: '',
        keterangan: '',
        kode_matanggaran: '',
    });

    const [showDatePicker, setShowDatePicker] = useState(false);
    const [selectedImage, setSelectedImage] = useState<ImagePicker.ImagePickerAsset | null>(null);
    const [showMataAnggaranModal, setShowMataAnggaranModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // Filter Mata Anggaran based on Category
    const filteredMataAnggaran = useMemo(() => {
        if (!mataAnggaran) return [];
        return mataAnggaran.filter((ma: any) => {
            const kodeAkun = ma.akun_aas?.kode_akun;
            if (formData.kategori === 'pengeluaran') {
                // Filter expense accounts (NOT 1.1.1 or 1.1.2)
                return kodeAkun !== '1.1.1' && kodeAkun !== '1.1.2';
            } else {
                // Filter top-up accounts (ONLY 1.1.2) - mirroring PengisianCreatePage logic
                return kodeAkun === '1.1.2';
            }
        }).filter((ma: any) =>
            ma.kode_matanggaran.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (ma.akun_aas?.nama_akun || '').toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [mataAnggaran, formData.kategori, searchQuery]);

    // Reset Mata Anggaran when Category changes
    useEffect(() => {
        setFormData(prev => ({ ...prev, kode_matanggaran: '' }));
    }, [formData.kategori]);

    // Select first option automatically for Pengisian (UX improvement)
    useEffect(() => {
        if (formData.kategori === 'pengisian' && filteredMataAnggaran.length === 1 && !formData.kode_matanggaran) {
            setFormData(prev => ({ ...prev, kode_matanggaran: filteredMataAnggaran[0].kode_matanggaran }));
        }
    }, [formData.kategori, filteredMataAnggaran]);


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
        if (!formData.jumlah || !formData.keterangan || !formData.kode_matanggaran) {
            Alert.alert('Data Tidak Lengkap', 'Mohon lengkapi:\n- Mata Anggaran\n- Jumlah\n- Keterangan');
            return;
        }

        // Validate Bukti Foto for Pengeluaran - OPTIONAL now
        // if (formData.kategori === 'pengeluaran' && !selectedImage) {
        //     Alert.alert('Data Tidak Lengkap', 'Mohon sertakan Bukti Foto untuk transaksi Pengeluaran');
        //     return;
        // }

        try {
            const payload: any = {
                tanggal: formData.tanggal.toISOString().split('T')[0],
                kategori: formData.kategori,
                jumlah: parseInt(formData.jumlah.replace(/\D/g, '')),
                keterangan: formData.keterangan,
                kode_matanggaran: formData.kode_matanggaran,
                cabang_id: user?.cabang?.id || 1,
                unit_id: user?.unit?.id,
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
            Alert.alert('Sukses', 'Transaksi berhasil disimpan', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        } catch (error: any) {
            console.error(error);
            Alert.alert('Error', error?.response?.data?.message || 'Gagal menyimpan transaksi');
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

    const selectedMataAnggaranLabel = useMemo(() => {
        if (!formData.kode_matanggaran || !mataAnggaran) return '';
        const found = mataAnggaran.find((ma: any) => ma.kode_matanggaran === formData.kode_matanggaran);
        return found ? `${found.kode_matanggaran} - ${found.akun_aas?.nama_akun}` : formData.kode_matanggaran;
    }, [formData.kode_matanggaran, mataAnggaran]);

    return (
        <SafeAreaView className="flex-1 bg-white" edges={['top']}>
            <View className="flex-row items-center px-6 py-4 border-b border-gray-100">
                <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4 w-10 h-10 items-center justify-center rounded-full bg-gray-50">
                    <ArrowLeft size={24} color="#374151" />
                </TouchableOpacity>
                <Text className="text-xl font-bold text-gray-900">Catat Transaksi</Text>
            </View>

            <ScrollView className="flex-1 p-6">
                {/* Kategori Switcher */}
                <View className="flex-row bg-gray-100 p-1 rounded-xl mb-6">
                    <TouchableOpacity
                        className={`flex-1 py-3 rounded-lg items-center ${formData.kategori === 'pengeluaran' ? 'bg-white shadow-sm' : ''}`}
                        onPress={() => setFormData({ ...formData, kategori: 'pengeluaran' })}
                    >
                        <Text className={`font-semibold ${formData.kategori === 'pengeluaran' ? 'text-red-600' : 'text-gray-500'}`}>Pengeluaran</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        className={`flex-1 py-3 rounded-lg items-center ${formData.kategori === 'pengisian' ? 'bg-white shadow-sm' : ''}`}
                        onPress={() => setFormData({ ...formData, kategori: 'pengisian' })}
                    >
                        <Text className={`font-semibold ${formData.kategori === 'pengisian' ? 'text-green-600' : 'text-gray-500'}`}>Pengisian</Text>
                    </TouchableOpacity>
                </View>

                {/* Form Fields */}
                <View className="space-y-5">

                    {/* Mata Anggaran Selector */}
                    <View>
                        <Text className="text-gray-700 font-medium mb-2 ml-1">Mata Anggaran <Text className="text-red-500">*</Text></Text>
                        <TouchableOpacity
                            onPress={() => setShowMataAnggaranModal(true)}
                            className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 flex-row justify-between items-center"
                        >
                            <Text className={clsx("flex-1", !formData.kode_matanggaran ? "text-gray-400" : "text-gray-900 font-medium")}>
                                {formData.kode_matanggaran ? selectedMataAnggaranLabel : "- Pilih Mata Anggaran -"}
                            </Text>
                            <ChevronDown size={20} color="#6B7280" />
                        </TouchableOpacity>
                    </View>

                    <View>
                        <Text className="text-gray-700 font-medium mb-2 ml-1">Jumlah (Rp) <Text className="text-red-500">*</Text></Text>
                        <TextInput
                            className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 text-xl font-bold text-gray-900"
                            placeholder="0"
                            keyboardType="numeric"
                            value={formData.jumlah}
                            onChangeText={(text) => setFormData({ ...formData, jumlah: formatInputCurrency(text) })}
                        />
                    </View>

                    <View>
                        <Text className="text-gray-700 font-medium mb-2 ml-1">Tanggal <Text className="text-red-500">*</Text></Text>
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
                                maximumDate={new Date()}
                            />
                        )}
                    </View>

                    <View>
                        <Text className="text-gray-700 font-medium mb-2 ml-1">Keterangan <Text className="text-red-500">*</Text></Text>
                        <TextInput
                            className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 h-24"
                            placeholder=""
                            multiline
                            textAlignVertical="top"
                            value={formData.keterangan}
                            onChangeText={(text) => setFormData({ ...formData, keterangan: text })}
                        />
                    </View>

                    {formData.kategori === 'pengeluaran' && (
                        <View>
                            <Text className="text-gray-700 font-medium mb-2 ml-1">
                                Bukti Foto <Text className="text-gray-400 font-normal italic">(Opsional)</Text>
                            </Text>
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
                    )}
                </View>
            </ScrollView>

            <View className="p-6 border-t border-gray-100 bg-white">
                <TouchableOpacity
                    className={clsx(
                        "w-full bg-blue-600 p-4 rounded-xl items-center shadow-lg shadow-blue-200",
                        (isCreating || !formData.jumlah || !formData.kode_matanggaran) && "opacity-70"
                    )}
                    onPress={handleSubmit}
                    disabled={isCreating}
                >
                    {isCreating ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <Text className="text-white font-bold text-lg">Simpan Transaksi</Text>
                    )}
                </TouchableOpacity>
            </View>

            {/* Mata Anggaran Selection Modal */}
            <Modal
                visible={showMataAnggaranModal}
                animationType="slide"
                presentationStyle="pageSheet"
                onRequestClose={() => setShowMataAnggaranModal(false)}
            >
                <View className="flex-1 bg-white">
                    <View className="px-6 py-4 flex-row items-center border-b border-gray-100">
                        <TouchableOpacity onPress={() => setShowMataAnggaranModal(false)} className="mr-4">
                            <X size={24} color="#374151" />
                        </TouchableOpacity>
                        <Text className="text-lg font-bold text-gray-900">Pilih Mata Anggaran</Text>
                    </View>

                    <View className="p-4 border-b border-gray-100">
                        <View className="bg-gray-100 rounded-xl px-4 py-2 flex-row items-center">
                            <Search size={20} color="#9CA3AF" />
                            <TextInput
                                className="flex-1 ml-2 text-gray-900 h-8"
                                placeholder="Cari kode atau nama akun..."
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                            />
                        </View>
                    </View>

                    {isMataAnggaranLoading ? (
                        <ActivityIndicator size="large" className="mt-8" color="#2563EB" />
                    ) : (
                        <FlatList
                            data={filteredMataAnggaran}
                            keyExtractor={(item: any) => item.id.toString()}
                            contentContainerStyle={{ padding: 16 }}
                            ListEmptyComponent={
                                <View className="items-center py-8">
                                    <Text className="text-gray-500">Tidak ada data akun yang sesuai.</Text>
                                </View>
                            }
                            renderItem={({ item }: { item: any }) => (
                                <TouchableOpacity
                                    className={clsx(
                                        "p-4 border-b border-gray-100 flex-row justify-between items-center",
                                        formData.kode_matanggaran === item.kode_matanggaran && "bg-blue-50"
                                    )}
                                    onPress={() => {
                                        setFormData({ ...formData, kode_matanggaran: item.kode_matanggaran });
                                        setShowMataAnggaranModal(false);
                                    }}
                                >
                                    <View className="flex-1 pr-4">
                                        <Text className="font-bold text-gray-900 text-base">{item.kode_matanggaran}</Text>
                                        <Text className="text-gray-500 mt-1">{item.akun_aas?.nama_akun}</Text>
                                    </View>
                                    {formData.kode_matanggaran === item.kode_matanggaran && (
                                        <Check size={20} color="#2563EB" />
                                    )}
                                </TouchableOpacity>
                            )}
                        />
                    )}
                </View>
            </Modal>
        </SafeAreaView>
    );
}
