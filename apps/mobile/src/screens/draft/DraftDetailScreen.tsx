import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Linking, Alert, Modal, TextInput } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useDraftDetail, useDraft } from '@/lib/api-client';
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
    CheckCircle,
    XCircle,
    Clock
} from 'lucide-react-native';
import clsx from 'clsx';
import { formatDateTime, formatCurrency } from '@/lib/shared';

export default function DraftDetailScreen() {
    const route = useRoute<any>();
    const navigation = useNavigation();
    const { t } = useTranslation();
    const { id } = route.params || {};

    const { data: draft, isLoading, error } = useDraftDetail(id);
    const { approve, reject, isApproving, isRejecting } = useDraft();

    // Modal state for rejection
    const [rejectModalVisible, setRejectModalVisible] = useState(false);
    const [rejectReason, setRejectReason] = useState('');

    const formatDate = (dateString: string) => formatDateTime(dateString);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'approved': return 'bg-green-100 text-green-700';
            case 'rejected': return 'bg-red-100 text-red-700';
            default: return 'bg-yellow-100 text-yellow-700';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'approved': return <CheckCircle size={16} color="#15803D" />;
            case 'rejected': return <XCircle size={16} color="#B91C1C" />;
            default: return <Clock size={16} color="#A16207" />;
        }
    };

    const handleApprove = () => {
        Alert.alert(
            t('common.confirm'),
            t('draft.approveConfirm'),
            [
                { text: t('common.cancel'), style: "cancel" },
                {
                    text: t('draft.approve'),
                    onPress: async () => {
                        try {
                            await approve({ id });
                            Alert.alert(t('common.success'), t('draft.approved'));
                            navigation.goBack();
                        } catch (err: any) {
                            Alert.alert(t('common.error'), err.message || t('draft.approveError'));
                        }
                    }
                }
            ]
        );
    };

    const handleReject = async () => {
        if (!rejectReason.trim()) {
            Alert.alert(t('common.error'), t('draft.rejectReasonReq'));
            return;
        }

        try {
            await reject({ id, data: { catatan: rejectReason } });
            setRejectModalVisible(false);
            Alert.alert(t('common.success'), t('draft.rejected'));
            navigation.goBack();
        } catch (err: any) {
            Alert.alert(t('common.error'), err.message || t('draft.rejectError'));
        }
    };

    if (isLoading) {
        return (
            <SafeAreaView className="flex-1 bg-white justify-center items-center">
                <ActivityIndicator size="large" color="#2563EB" />
                <Text className="text-gray-500 mt-4">{t('draft.loadingDetail')}</Text>
            </SafeAreaView>
        );
    }

    if (error || !draft) {
        return (
            <SafeAreaView className="flex-1 bg-white justify-center items-center p-6">
                <Text className="text-red-500 text-lg font-bold mb-2">{t('common.error')}</Text>
                <Text className="text-gray-500 text-center mb-6">
                    {t('draft.loadError')}
                </Text>
                <TouchableOpacity onPress={() => navigation.goBack()} className="bg-blue-600 px-6 py-3 rounded-xl">
                    <Text className="text-white font-bold">{t('common.back')}</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            {/* Header */}
            <View className="px-6 py-4 bg-white flex-row items-center border-b border-gray-100">
                <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4 w-10 h-10 items-center justify-center rounded-full bg-gray-50">
                    <ArrowLeft size={24} color="#1F2937" />
                </TouchableOpacity>
                <Text className="text-xl font-bold text-gray-900">{t('draft.detail')}</Text>
            </View>

            <ScrollView className="flex-1" contentContainerStyle={{ padding: 24, paddingBottom: 100 }}>
                {/* Status Badge */}
                <View className="items-start mb-4">
                    <View className={clsx("px-3 py-1.5 rounded-full flex-row items-center gap-2", getStatusColor(draft.status))}>
                        {getStatusIcon(draft.status)}
                        <Text className={clsx("text-sm font-bold capitalize", getStatusColor(draft.status).split(' ')[1])}>
                            {draft.status === 'pending' ? t('draft.pending') : t(`draft.${draft.status}`)}
                        </Text>
                    </View>
                </View>

                {/* Main Card */}
                <View className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6">
                    <View className="flex-row justify-between items-start mb-2">
                        <Text className="text-gray-500 text-sm">{t('draft.totalAmount')}</Text>
                        <Text className="text-xs text-gray-400">#{draft.id}</Text>
                    </View>

                    <Text className="text-3xl font-bold text-gray-900 mb-2">
                        {formatCurrency(draft.jumlah)}
                    </Text>

                    <View className="flex-row items-center mt-1">
                        <Calendar size={16} color="#9CA3AF" />
                        <Text className="text-gray-500 ml-2 text-sm">
                            {formatDate(draft.tanggal)}
                        </Text>
                    </View>
                </View>

                {/* Rejection Note if Rejected */}
                {draft.status === 'rejected' && draft.catatan_approval && (
                    <View className="bg-red-50 p-5 rounded-xl border border-red-100 mb-6">
                        <Text className="font-bold text-red-800 mb-1">{t('draft.rejectionReason')}:</Text>
                        <Text className="text-red-700">{draft.catatan_approval}</Text>
                    </View>
                )}

                {/* Details Section */}
                <View className="space-y-4">
                    <View className="bg-white p-5 rounded-xl border border-gray-100">
                        <View className="flex-row items-center mb-3">
                            <FileText size={18} color="#4B5563" />
                            <Text className="font-bold text-gray-800 ml-2">{t('transaction.description')}</Text>
                        </View>
                        <Text className="text-gray-600 leading-relaxed">
                            {draft.keterangan}
                        </Text>
                    </View>

                    <View className="bg-white p-5 rounded-xl border border-gray-100">
                        <View className="flex-row items-center mb-4">
                            <CreditCard size={18} color="#4B5563" />
                            <Text className="font-bold text-gray-800 ml-2">{t('transaction.budget')}</Text>
                        </View>
                        <View className="mb-4">
                            <Text className="text-xs text-gray-400 mb-1">{t('transaction.budgetCode')}</Text>
                            <Text className="text-gray-800 font-medium font-mono bg-gray-50 self-start px-2 py-1 rounded">
                                {draft.mata_anggaran?.kode_matanggaran || draft.kode_matanggaran || '-'}
                            </Text>
                        </View>
                        <View>
                            <Text className="text-xs text-gray-400 mb-1">{t('transaction.budgetName')}</Text>
                            <Text className="text-gray-800 font-medium">
                                {draft.mata_anggaran?.nama_matanggaran || '-'}
                            </Text>
                        </View>
                    </View>

                    <View className="bg-white p-5 rounded-xl border border-gray-100">
                        <View className="flex-row items-center mb-4">
                            <Building size={18} color="#4B5563" />
                            <Text className="font-bold text-gray-800 ml-2">{t('draft.unitBranch')}</Text>
                        </View>
                        <View className="mb-4">
                            <Text className="text-xs text-gray-400 mb-1">{t('profile.branch')}</Text>
                            <Text className="text-gray-800 font-medium">
                                {draft.cabang?.nama_cabang || '-'}
                            </Text>
                        </View>
                        <View>
                            <Text className="text-xs text-gray-400 mb-1">{t('profile.unit')}</Text>
                            <Text className="text-gray-800 font-medium">
                                {draft.unit?.nama_unit || '-'}
                            </Text>
                        </View>
                    </View>

                    <View className="bg-white p-5 rounded-xl border border-gray-100">
                        <View className="flex-row items-center mb-4">
                            <User size={18} color="#4B5563" />
                            <Text className="font-bold text-gray-800 ml-2">{t('draft.submittedBy')}</Text>
                        </View>
                        <View className="flex-row items-center">
                            <View className="w-10 h-10 bg-blue-100 rounded-full items-center justify-center mr-3">
                                <Text className="text-blue-600 font-bold text-lg">
                                    {draft.user?.nama?.charAt(0) || 'U'}
                                </Text>
                            </View>
                            <View>
                                <Text className="text-gray-800 font-medium">
                                    {draft.user?.nama || 'Unknown User'}
                                </Text>
                                <Text className="text-xs text-gray-400">
                                    {draft.user?.email || ''}
                                </Text>
                            </View>
                        </View>
                    </View>

                    {/* Attachments */}
                    {(draft.lampiran || draft.lampiran2 || draft.lampiran3) && (
                        <View className="bg-white p-5 rounded-xl border border-gray-100 pb-2">
                            <View className="flex-row items-center mb-4">
                                <Paperclip size={18} color="#4B5563" />
                                <Text className="font-bold text-gray-800 ml-2">{t('transaction.attachment')}</Text>
                            </View>
                            {[draft.lampiran, draft.lampiran2, draft.lampiran3].map((lampiran, index) => {
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
            </ScrollView>

            {/* Approval Action Buttons - Only show if status is pending */}
            {draft.status === 'pending' && (
                <View className="p-4 bg-white border-t border-gray-100 flex-row gap-3">
                    <TouchableOpacity
                        className="flex-1 bg-red-50 py-3 rounded-xl items-center border border-red-100"
                        onPress={() => setRejectModalVisible(true)}
                        disabled={isRejecting || isApproving}
                    >
                        {isRejecting ? (
                            <ActivityIndicator color="#B91C1C" />
                        ) : (
                            <Text className="text-red-700 font-bold">{t('draft.reject')}</Text>
                        )}
                    </TouchableOpacity>
                    <TouchableOpacity
                        className="flex-1 bg-green-600 py-3 rounded-xl items-center shadow-sm"
                        onPress={handleApprove}
                        disabled={isRejecting || isApproving}
                    >
                        {isApproving ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <Text className="text-white font-bold">{t('draft.approve')}</Text>
                        )}
                    </TouchableOpacity>
                </View>
            )}

            {/* Reject Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={rejectModalVisible}
                onRequestClose={() => setRejectModalVisible(false)}
            >
                <View className="flex-1 justify-end bg-black/50">
                    <View className="bg-white rounded-t-3xl p-6">
                        <View className="flex-row justify-between items-center mb-4">
                            <Text className="text-xl font-bold text-gray-900">{t('draft.reject')}</Text>
                            <TouchableOpacity onPress={() => setRejectModalVisible(false)}>
                                <XCircle size={24} color="#9CA3AF" />
                            </TouchableOpacity>
                        </View>

                        <Text className="text-gray-600 mb-2">{t('draft.rejectionReason')}</Text>
                        <TextInput
                            className="bg-gray-50 border border-gray-200 rounded-xl p-4 min-h-[100px] text-gray-900 mb-6"
                            placeholder={t('draft.rejectPlaceholder')}
                            multiline
                            textAlignVertical="top"
                            value={rejectReason}
                            onChangeText={setRejectReason}
                        />

                        <TouchableOpacity
                            className="w-full bg-red-600 py-4 rounded-xl items-center"
                            onPress={handleReject}
                            disabled={isRejecting}
                        >
                            {isRejecting ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <Text className="text-white font-bold text-lg">{t('draft.rejectConfirm')}</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}
