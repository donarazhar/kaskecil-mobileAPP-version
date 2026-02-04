import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Linking, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useTransaksiDetail, useTransaksi, transaksiService, useDraft, useDraftDetail, draftService } from '@/lib/api-client';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
    ArrowLeft,
    Calendar,
    FileText,
    CreditCard,
    Building,
    User,
    Paperclip,
    Download,
    Edit,
    Trash2,
    CheckCircle
} from 'lucide-react-native';
import clsx from 'clsx';
import { formatDateTime } from '@/lib/shared';

export default function TransaksiDetailScreen() {
    const route = useRoute<any>();
    const navigation = useNavigation<any>();
    const { t } = useTranslation();
    const { id, is_draft } = route.params || {};

    const transactionQuery = useTransaksiDetail(is_draft ? undefined : id); // Only fetch if NOT draft
    const draftQuery = useDraftDetail(is_draft ? id : undefined); // Only fetch if IS draft

    const { data: transaksi, isLoading, error, refetch } = is_draft ? draftQuery : transactionQuery;

    const { remove, isDeleting, cairkan, isCairkanProcessing } = useTransaksi();
    const { remove: removeDraft } = useDraft();
    const [isProcessing, setIsProcessing] = React.useState(false);

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(value);
    };

    const formatDate = (dateString: string) => {
        return formatDateTime(dateString);
    };

    const getKategoriColor = (kategori: string) => {
        switch (kategori) {
            case 'pengeluaran': return 'bg-red-100 text-red-700';
            case 'pembentukan': return 'bg-green-100 text-green-700';
            case 'pengisian': return 'bg-blue-100 text-blue-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const getKategoriLabel = (kategori: string) => {
        return t(`transaction.types.${kategori}`, { defaultValue: kategori });
    };

    const handleDelete = () => {
        Alert.alert(
            t('transaction.delete'),
            t('transaction.deleteConfirm'),
            [
                { text: t('common.cancel'), style: 'cancel' },
                {
                    text: t('common.delete'),
                    style: 'destructive',
                    onPress: async () => {
                        if (!transaksi) return;
                        try {
                            setIsProcessing(true);
                            if (is_draft) {
                                await removeDraft(transaksi.id);
                            } else {
                                await remove(transaksi.id);
                            }
                            Alert.alert(t('common.success'), t('transaction.deleteSuccess'));
                            navigation.goBack();
                        } catch (err) {
                            Alert.alert(t('common.error'), t('transaction.deleteError'));
                            setIsProcessing(false);
                        }
                    }
                }
            ]
        );
    };

    const handleCairkan = () => {
        Alert.alert(
            t('transaction.disburse'),
            t('transaction.disburseConfirm'),
            [
                { text: t('common.cancel'), style: 'cancel' },
                {
                    text: t('transaction.disburseConfirmYes'),
                    onPress: async () => {
                        if (!transaksi) return;
                        try {
                            // Use isProcessing state for local UI feedback if needed, 
                            // but isCairkanProcessing from hook covers the mutation state.
                            // We keep setIsProcessing for simplicity or replace it.
                            setIsProcessing(true);

                            await cairkan(transaksi.id);

                            Alert.alert(t('common.success'), t('transaction.disburseSuccess'), [
                                { text: 'OK', onPress: () => navigation.goBack() }
                            ]);
                        } catch (err: any) {
                            Alert.alert(t('common.error'), err?.response?.data?.message || t('transaction.disburseError'));
                        } finally {
                            setIsProcessing(false);
                        }
                    }
                }
            ]
        );
    };

    if (isLoading) {
        return (
            <SafeAreaView className="flex-1 bg-white justify-center items-center">
                <ActivityIndicator size="large" color="#2563EB" />
                <Text className="text-gray-500 mt-4">{t('transaction.loadingDetail')}</Text>
            </SafeAreaView>
        );
    }

    if (error || !transaksi) {
        return (
            <SafeAreaView className="flex-1 bg-white justify-center items-center p-6">
                <Text className="text-red-500 text-lg font-bold mb-2">{t('common.error')}</Text>
                <Text className="text-gray-500 text-center mb-6">
                    {t('transaction.loadError')}
                </Text>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    className="bg-blue-600 px-6 py-3 rounded-xl"
                >
                    <Text className="text-white font-bold">{t('common.back')}</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            {/* Header */}
            <View className="px-6 py-4 bg-white flex-row items-center border-b border-gray-100">
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    className="mr-4 w-10 h-10 items-center justify-center rounded-full bg-gray-50"
                >
                    <ArrowLeft size={24} color="#1F2937" />
                </TouchableOpacity>
                <Text className="text-xl font-bold text-gray-900">{t('transaction.detail')}</Text>
            </View>

            <ScrollView className="flex-1" contentContainerStyle={{ padding: 24 }}>
                {/* Main Card */}
                <View className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6">
                    <View className="flex-row justify-between items-start mb-4">
                        <View className={clsx("px-3 py-1.5 rounded-full", getKategoriColor(transaksi.kategori))}>
                            <Text className={clsx("text-xs font-bold capitalize", getKategoriColor(transaksi.kategori).split(' ')[1])}>
                                {getKategoriLabel(transaksi.kategori)}
                            </Text>
                        </View>
                        <Text className="text-xs text-gray-400">#{transaksi.id}</Text>
                    </View>

                    <Text className="text-3xl font-bold text-gray-900 mb-1">
                        {formatCurrency(transaksi.jumlah)}
                    </Text>

                    <View className="flex-row items-center mt-2">
                        <Calendar size={16} color="#9CA3AF" />
                        <Text className="text-gray-500 ml-2 text-sm">
                            {formatDate(transaksi.tanggal)}
                        </Text>
                    </View>
                </View>

                {/* Details Section */}
                <View className="space-y-4">
                    <View className="bg-white p-5 rounded-xl border border-gray-100">
                        <View className="flex-row items-center mb-3">
                            <FileText size={18} color="#4B5563" />
                            <Text className="font-bold text-gray-800 ml-2">{t('transaction.description')}</Text>
                        </View>
                        <Text className="text-gray-600 leading-relaxed">
                            {transaksi.keterangan}
                        </Text>
                        {transaksi.no_bukti && (
                            <View className="mt-4 pt-4 border-t border-gray-50">
                                <Text className="text-xs text-gray-400 mb-1">{t('transaction.proofNumber')}</Text>
                                <Text className="text-gray-800 font-medium">{transaksi.no_bukti}</Text>
                            </View>
                        )}
                    </View>

                    <View className="bg-white p-5 rounded-xl border border-gray-100">
                        <View className="flex-row items-center mb-4">
                            <CreditCard size={18} color="#4B5563" />
                            <Text className="font-bold text-gray-800 ml-2">{t('transaction.budget')}</Text>
                        </View>

                        <View className="mb-4">
                            <Text className="text-xs text-gray-400 mb-1">{t('transaction.budgetCode')}</Text>
                            <Text className="text-gray-800 font-medium font-mono bg-gray-50 self-start px-2 py-1 rounded">
                                {transaksi.mata_anggaran?.kode_matanggaran || transaksi.kode_matanggaran || '-'}
                            </Text>
                        </View>

                        <View>
                            <Text className="text-xs text-gray-400 mb-1">{t('transaction.budgetName')}</Text>
                            <Text className="text-gray-800 font-medium">
                                {transaksi.mata_anggaran?.nama_matanggaran || '-'}
                            </Text>
                        </View>
                    </View>



                    {(transaksi.lampiran || transaksi.lampiran2 || transaksi.lampiran3) && (
                        <View className="bg-white p-5 rounded-xl border border-gray-100 pb-2">
                            <View className="flex-row items-center mb-4">
                                <Paperclip size={18} color="#4B5563" />
                                <Text className="font-bold text-gray-800 ml-2">{t('transaction.attachment')}</Text>
                            </View>

                            {[transaksi.lampiran, transaksi.lampiran2, transaksi.lampiran3].map((lampiran, index) => {
                                if (!lampiran) return null;
                                return (
                                    <TouchableOpacity
                                        key={index}
                                        className="flex-row items-center justify-between bg-gray-50 p-3 rounded-lg mb-3 border border-gray-200"
                                        onPress={() => {
                                            if (lampiran.startsWith('http')) {
                                                Linking.openURL(lampiran);
                                            }
                                        }}
                                    >
                                        <View className="flex-row items-center flex-1 mr-2">
                                            <View className="bg-red-100 p-2 rounded mr-3">
                                                <FileText size={16} color="#B91C1C" />
                                            </View>
                                            <Text className="text-gray-700 font-medium text-sm flex-1" numberOfLines={1}>
                                                {t('transaction.attachment')} {index + 1}
                                            </Text>
                                        </View>
                                        <Download size={18} color="#4B5563" />
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    )}
                </View>

                {/* Actions */}
                <View className="mb-8">
                    {/* Cairkan Button - Only for Draft Pengisian */}
                    {transaksi.kategori === 'pengisian' && is_draft && (
                        <TouchableOpacity
                            onPress={handleCairkan}
                            disabled={isProcessing || isCairkanProcessing}
                            className="bg-emerald-600 p-4 rounded-xl flex-row justify-center items-center shadow-sm mb-3"
                        >
                            {isProcessing || isCairkanProcessing ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <>
                                    <CheckCircle size={20} color="white" className="mr-2" />
                                    <Text className="text-white font-bold text-lg ml-2">{t('transaction.disburse')}</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    )}

                    {/* Edit & Delete - Visible if:
                        1. It is NOT 'pengisian' (so it is 'pengeluaran')
                        2. OR it IS 'pengisian' AND it is a DRAFT
                    */}
                    {(transaksi.kategori !== 'pengisian' || is_draft) ? (
                        <>
                            {/* Edit Button */}
                            <TouchableOpacity
                                onPress={() => navigation.navigate(
                                    is_draft ? 'DraftEdit' : 'TransaksiEdit', // Assume DraftEdit exists or fallback to TransaksiEdit if compatible
                                    { id: transaksi.id }
                                )}
                                className="bg-blue-600 p-4 rounded-xl flex-row justify-center items-center shadow-sm mb-3"
                            >
                                <Edit size={20} color="white" className="mr-2" />
                                <Text className="text-white font-bold text-lg ml-2">{t('transaction.edit')}</Text>
                            </TouchableOpacity>

                            {/* Delete Button */}
                            <TouchableOpacity
                                onPress={handleDelete}
                                disabled={isProcessing || isDeleting}
                                className="bg-white border border-red-200 p-4 rounded-xl flex-row justify-center items-center"
                            >
                                {isProcessing || isDeleting ? (
                                    <ActivityIndicator color="#EF4444" />
                                ) : (
                                    <>
                                        <Trash2 size={20} color="#EF4444" className="mr-2" />
                                        <Text className="text-red-600 font-bold text-lg ml-2">{t('transaction.delete')}</Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        </>
                    ) : null}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
