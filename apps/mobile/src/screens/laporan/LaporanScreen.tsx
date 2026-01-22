import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View, Text, ScrollView, TouchableOpacity, Alert, Linking, Platform, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { getApiConfig } from '@/lib/api-client';
import { LinearGradient } from 'expo-linear-gradient';
import {
    FileText,
    Printer,
    Calendar,
    CalendarCheck,
    ArrowRight,
    Info,
    Download,
    ChevronDown,
    X
} from 'lucide-react-native';

export default function LaporanScreen() {
    const navigation = useNavigation<any>();
    const { t } = useTranslation();
    const [tanggalAwal, setTanggalAwal] = useState<Date | null>(null);
    const [tanggalAkhir, setTanggalAkhir] = useState<Date | null>(null);
    const [showDatePickerAwal, setShowDatePickerAwal] = useState(false);
    const [showDatePickerAkhir, setShowDatePickerAkhir] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const formatDate = (date: Date | null) => {
        if (!date) return t('report.selectDate');
        return date.toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    const formatDateForApi = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const handlePrint = async () => {
        if (!tanggalAwal || !tanggalAkhir) {
            Alert.alert(t('common.attention'), t('report.dateRequired'));
            return;
        }

        if (tanggalAwal > tanggalAkhir) {
            Alert.alert(t('common.attention'), t('report.dateInvalid'));
            return;
        }

        setIsLoading(true);

        try {
            const { apiUrl, getToken } = getApiConfig();
            const token = getToken();
            const url = `${apiUrl}/laporan/cetaklaporan?tanggalawal=${formatDateForApi(tanggalAwal)}&tanggalakhir=${formatDateForApi(tanggalAkhir)}&token=${token}`;

            const supported = await Linking.canOpenURL(url);
            if (supported) {
                await Linking.openURL(url);
            } else {
                Alert.alert(t('common.error'), t('report.errorOpen'));
            }
        } catch (error) {
            console.error(error);
            Alert.alert(t('common.error'), t('report.errorGeneral'));
        } finally {
            setIsLoading(false);
        }
    };

    const onChangeDateAwal = (event: any, selectedDate?: Date) => {
        setShowDatePickerAwal(false);
        if (selectedDate) {
            setTanggalAwal(selectedDate);
        }
    };

    const onChangeDateAkhir = (event: any, selectedDate?: Date) => {
        setShowDatePickerAkhir(false);
        if (selectedDate) {
            setTanggalAkhir(selectedDate);
        }
    };

    // Quick period buttons
    const setQuickPeriod = (type: 'this_month' | 'last_month' | 'this_year') => {
        const now = new Date();
        let start: Date, end: Date;

        switch (type) {
            case 'this_month':
                start = new Date(now.getFullYear(), now.getMonth(), 1);
                end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
                break;
            case 'last_month':
                start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                end = new Date(now.getFullYear(), now.getMonth(), 0);
                break;
            case 'this_year':
                start = new Date(now.getFullYear(), 0, 1);
                end = new Date(now.getFullYear(), 11, 31);
                break;
        }

        setTanggalAwal(start);
        setTanggalAkhir(end);
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
            {/* Header */}
            <LinearGradient
                colors={['#0053C5', '#0077E6', '#0099FF']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="px-6 pt-4 pb-8"
            >
                <View className="flex-row items-center gap-3 mb-2">
                    <View className="w-12 h-12 bg-white/20 rounded-2xl items-center justify-center">
                        <FileText size={24} color="white" />
                    </View>
                    <View>
                        <Text className="text-2xl font-bold text-white">{t('report.title')}</Text>
                        <Text className="text-white/70 text-sm">{t('report.subtitle')}</Text>
                    </View>
                </View>
            </LinearGradient>

            <ScrollView className="flex-1" contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
                {/* Info Banner */}
                <View className="bg-blue-50 p-4 rounded-2xl border border-blue-100 mb-6 flex-row">
                    <View className="w-10 h-10 bg-blue-100 rounded-xl items-center justify-center mr-3">
                        <Info size={20} color="#2563EB" />
                    </View>
                    <View className="flex-1">
                        <Text className="text-blue-800 font-bold mb-1">{t('report.guideTitle')}</Text>
                        <Text className="text-blue-700 text-sm leading-5">
                            {t('report.guideContent')}
                        </Text>
                    </View>
                </View>

                {/* Quick Period Buttons */}
                <Text className="text-gray-500 font-semibold text-sm mb-3 px-1">{t('report.quickPeriod')}</Text>
                <View className="flex-row gap-2 mb-6">
                    <TouchableOpacity
                        className="flex-1 bg-white py-3 rounded-xl border border-gray-200 items-center"
                        onPress={() => setQuickPeriod('this_month')}
                        activeOpacity={0.7}
                    >
                        <Text className="text-gray-700 font-semibold text-sm">{t('report.thisMonth')}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        className="flex-1 bg-white py-3 rounded-xl border border-gray-200 items-center"
                        onPress={() => setQuickPeriod('last_month')}
                        activeOpacity={0.7}
                    >
                        <Text className="text-gray-700 font-semibold text-sm">{t('report.lastMonth')}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        className="flex-1 bg-white py-3 rounded-xl border border-gray-200 items-center"
                        onPress={() => setQuickPeriod('this_year')}
                        activeOpacity={0.7}
                    >
                        <Text className="text-gray-700 font-semibold text-sm">{t('report.thisYear')}</Text>
                    </TouchableOpacity>
                </View>

                {/* Date Range Card */}
                <View className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm mb-6">
                    <Text className="text-gray-900 font-bold text-lg mb-4">{t('report.periodTitle')}</Text>

                    {/* Tanggal Awal */}
                    <TouchableOpacity
                        className="bg-gray-50 p-4 rounded-2xl border border-gray-100 mb-3 flex-row items-center"
                        onPress={() => setShowDatePickerAwal(true)}
                        activeOpacity={0.7}
                    >
                        <View className="w-11 h-11 bg-blue-100 rounded-xl items-center justify-center mr-3">
                            <Calendar size={20} color="#2563EB" />
                        </View>
                        <View className="flex-1">
                            <Text className="text-gray-400 text-xs font-medium mb-0.5">{t('report.startDate')}</Text>
                            <Text className={`font-semibold text-base ${tanggalAwal ? 'text-gray-900' : 'text-gray-400'}`}>
                                {formatDate(tanggalAwal)}
                            </Text>
                        </View>
                        <ChevronDown size={18} color="#9CA3AF" />
                    </TouchableOpacity>

                    {/* Arrow */}
                    <View className="items-center py-2">
                        <View className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center">
                            <ArrowRight size={18} color="#6B7280" style={{ transform: [{ rotate: '90deg' }] }} />
                        </View>
                    </View>

                    {/* Tanggal Akhir */}
                    <TouchableOpacity
                        className="bg-gray-50 p-4 rounded-2xl border border-gray-100 mt-3 flex-row items-center"
                        onPress={() => setShowDatePickerAkhir(true)}
                        activeOpacity={0.7}
                    >
                        <View className="w-11 h-11 bg-emerald-100 rounded-xl items-center justify-center mr-3">
                            <CalendarCheck size={20} color="#059669" />
                        </View>
                        <View className="flex-1">
                            <Text className="text-gray-400 text-xs font-medium mb-0.5">{t('report.endDate')}</Text>
                            <Text className={`font-semibold text-base ${tanggalAkhir ? 'text-gray-900' : 'text-gray-400'}`}>
                                {formatDate(tanggalAkhir)}
                            </Text>
                        </View>
                        <ChevronDown size={18} color="#9CA3AF" />
                    </TouchableOpacity>
                </View>

                {/* Print Button */}
                <TouchableOpacity
                    onPress={handlePrint}
                    disabled={isLoading}
                    activeOpacity={0.8}
                >
                    <LinearGradient
                        colors={['#0053C5', '#0077E6']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        className="p-4 rounded-2xl flex-row items-center justify-center"
                    >
                        <View className="w-10 h-10 bg-white/20 rounded-xl items-center justify-center mr-3">
                            <Printer size={22} color="white" />
                        </View>
                        <Text className="text-white font-bold text-lg">
                            {isLoading ? t('report.processing') : t('report.printPdf')}
                        </Text>
                    </LinearGradient>
                </TouchableOpacity>

                {/* Additional Info */}
                <View className="mt-6 bg-amber-50 p-4 rounded-2xl border border-amber-100">
                    <Text className="text-amber-800 font-bold mb-1">💡 {t('report.tipsTitle')}</Text>
                    <Text className="text-amber-700 text-sm leading-5">
                        {t('report.tipsContent')}
                    </Text>
                </View>
            </ScrollView>

            {/* Date Pickers */}
            {showDatePickerAwal && (
                <DateTimePicker
                    value={tanggalAwal || new Date()}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={onChangeDateAwal}
                    maximumDate={new Date()}
                />
            )}

            {showDatePickerAkhir && (
                <DateTimePicker
                    value={tanggalAkhir || new Date()}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={onChangeDateAkhir}
                    maximumDate={new Date()}
                />
            )}
        </SafeAreaView>
    );
}
