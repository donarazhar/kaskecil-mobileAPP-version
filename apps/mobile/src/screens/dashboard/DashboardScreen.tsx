import React, { useMemo } from 'react';
import { View, Text, ScrollView, RefreshControl, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useDashboard, useAuth, useTransaksi } from '@/lib/api-client';
import { formatCurrency } from '@/lib/shared';
import { ArrowUpRight, ArrowDownLeft, Plus, Wallet, Bell, TrendingDown, TrendingUp, Clock, BarChart3, ChevronRight, CreditCard } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';

export default function DashboardScreen() {
    const navigation = useNavigation<any>();
    const { user } = useAuth();
    const { summary, refetch: refetchDashboard, isLoading: isDashboardLoading } = useDashboard();

    // Separate hooks for different transaction lists
    const { data: pengeluaranData, isLoading: isPengeluaranLoading, refetch: refetchPengeluaran } = useTransaksi({
        page: 1,
        per_page: 5,
        kategori: 'pengeluaran',
        unit_id: user?.unit?.id
    });

    const { data: pengisianData, isLoading: isPengisianLoading, refetch: refetchPengisian } = useTransaksi({
        page: 1,
        per_page: 5,
        kategori: 'pengisian',
        unit_id: user?.unit?.id
    });

    const [refreshing, setRefreshing] = React.useState(false);

    const onRefresh = React.useCallback(async () => {
        setRefreshing(true);
        await Promise.all([
            refetchDashboard(),
            refetchPengeluaran(),
            refetchPengisian()
        ]);
        setRefreshing(false);
    }, []);

    // Calculate Usage Percentage
    const usagePercentage = summary ? Math.min(((summary.total_pengeluaran || 0) / (summary.plafon || 1)) * 100, 100) : 0;

    // Stats Configuration
    const statsData = [
        {
            title: 'Pembentukan',
            value: summary?.plafon || 0,
            icon: Wallet,
            gradient: ['#3B82F6', '#1D4ED8'],
        },
        {
            title: 'Pengeluaran',
            value: summary?.total_pengeluaran || 0,
            icon: TrendingDown,
            gradient: ['#EF4444', '#DC2626'],
        },
        {
            title: 'Saldo Berjalan',
            value: summary?.sisa_kas || 0,
            icon: TrendingUp,
            gradient: ['#10B981', '#059669'],
        },
        {
            title: 'Belum Cair',
            value: summary?.total_draft_pengisian || 0,
            icon: Clock,
            gradient: ['#F59E0B', '#D97706'],
        },
    ];

    // Categories for chart
    const categoryData = [
        { label: 'ATK', value: summary?.total_pengeluaran ? summary.total_pengeluaran * 0.35 : 0, color: '#3B82F6' },
        { label: 'Transport', value: summary?.total_pengeluaran ? summary.total_pengeluaran * 0.25 : 0, color: '#10B981' },
        { label: 'Konsumsi', value: summary?.total_pengeluaran ? summary.total_pengeluaran * 0.20 : 0, color: '#F59E0B' },
        { label: 'Lainnya', value: summary?.total_pengeluaran ? summary.total_pengeluaran * 0.20 : 0, color: '#8B5CF6' },
    ];
    const maxChartValue = Math.max(...categoryData.map(d => d.value), 1);

    return (
        <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
            <ScrollView
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#0053C5" />
                }
                contentContainerStyle={{ paddingBottom: 100 }}
                showsVerticalScrollIndicator={false}
            >
                {/* Header with Gradient */}
                <LinearGradient
                    colors={['#0053C5', '#0077E6', '#0099FF']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    className="px-6 pt-4 pb-24 rounded-b-[32px]"
                >
                    <View className="flex-row justify-between items-center">
                        <View className="flex-1">
                            <Text className="text-white/70 text-sm font-medium">Selamat Datang,</Text>
                            <Text className="text-white text-xl font-bold" numberOfLines={1}>{user?.nama}</Text>
                            <View className="flex-row items-center mt-1">
                                <View className="w-2 h-2 bg-green-400 rounded-full mr-2" />
                                <Text className="text-white/70 text-xs">{user?.unit?.nama || user?.cabang?.nama_cabang || 'Kas Kecil'}</Text>
                            </View>
                        </View>
                        <TouchableOpacity
                            className="w-12 h-12 bg-white/20 rounded-2xl items-center justify-center"
                            onPress={() => navigation.navigate('Notifications')}
                        >
                            <Bell size={22} color="white" />
                            <View className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full items-center justify-center border-2 border-white">
                                <Text className="text-white text-[10px] font-bold">3</Text>
                            </View>
                        </TouchableOpacity>
                    </View>

                    {/* Balance Card */}
                    <View className="mt-6 bg-white/15 rounded-3xl p-5 border border-white/20">
                        <View className="flex-row justify-between items-start">
                            <View>
                                <Text className="text-white/70 text-sm">Saldo Tersedia</Text>
                                <Text className="text-white text-3xl font-bold mt-1">
                                    {isDashboardLoading ? '...' : formatCurrency(summary?.sisa_kas || 0)}
                                </Text>
                            </View>
                            <View className="w-14 h-14 bg-white/20 rounded-2xl items-center justify-center">
                                <CreditCard size={28} color="white" />
                            </View>
                        </View>

                        {/* Usage Progress */}
                        <View className="mt-4">
                            <View className="flex-row justify-between mb-2">
                                <Text className="text-white/70 text-xs">Penggunaan Plafon</Text>
                                <Text className="text-white font-semibold text-xs">{usagePercentage.toFixed(0)}%</Text>
                            </View>
                            <View className="h-2 bg-white/20 rounded-full overflow-hidden">
                                <View
                                    className={`h-full rounded-full ${usagePercentage > 80 ? 'bg-red-400' : usagePercentage > 50 ? 'bg-amber-400' : 'bg-green-400'}`}
                                    style={{ width: `${usagePercentage}%` }}
                                />
                            </View>
                        </View>
                    </View>
                </LinearGradient>

                {/* Stats Cards - Overlapping */}
                <View className="px-4 -mt-12">
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ paddingHorizontal: 4 }}
                    >
                        {statsData.map((stat, index) => (
                            <View key={index} className="w-36 bg-white p-4 rounded-2xl shadow-lg shadow-gray-200 mr-3 border border-gray-100">
                                <LinearGradient
                                    colors={stat.gradient as [string, string]}
                                    className="w-10 h-10 rounded-xl items-center justify-center mb-3"
                                >
                                    <stat.icon size={20} color="white" />
                                </LinearGradient>
                                <Text className="text-gray-500 text-xs font-medium mb-1">{stat.title}</Text>
                                <Text className="text-gray-900 font-bold text-base" numberOfLines={1} adjustsFontSizeToFit>
                                    {isDashboardLoading ? '...' : formatCurrency(stat.value)}
                                </Text>
                            </View>
                        ))}
                    </ScrollView>
                </View>

                {/* Quick Actions */}
                <View className="px-6 mt-8">
                    <View className="flex-row gap-3">
                        <TouchableOpacity
                            className="flex-1 bg-blue-600 rounded-2xl p-4 flex-row items-center justify-center"
                            onPress={() => navigation.navigate('Transaksi', { screen: 'TransaksiCreate' })}
                            activeOpacity={0.8}
                        >
                            <Plus size={20} color="white" />
                            <Text className="text-white font-bold ml-2">Pengeluaran</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            className="flex-1 bg-emerald-600 rounded-2xl p-4 flex-row items-center justify-center"
                            onPress={() => navigation.navigate('Transaksi', { screen: 'TransaksiCreate' })}
                            activeOpacity={0.8}
                        >
                            <Plus size={20} color="white" />
                            <Text className="text-white font-bold ml-2">Pengisian</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Chart Section */}
                <View className="px-6 mt-8">
                    <View className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100">
                        <View className="flex-row items-center justify-between mb-5">
                            <View className="flex-row items-center gap-2">
                                <View className="w-10 h-10 bg-blue-100 rounded-xl items-center justify-center">
                                    <BarChart3 size={20} color="#3B82F6" />
                                </View>
                                <Text className="text-lg font-bold text-gray-900">Per Kategori</Text>
                            </View>
                        </View>

                        {isDashboardLoading ? (
                            <ActivityIndicator color="#3B82F6" />
                        ) : (
                            <View className="space-y-4">
                                {categoryData.map((item, idx) => (
                                    <View key={idx} className="mb-3">
                                        <View className="flex-row justify-between mb-2">
                                            <View className="flex-row items-center">
                                                <View className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: item.color }} />
                                                <Text className="text-sm text-gray-600 font-medium">{item.label}</Text>
                                            </View>
                                            <Text className="text-sm font-bold text-gray-900">{formatCurrency(item.value)}</Text>
                                        </View>
                                        <View className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                            <View
                                                className="h-full rounded-full"
                                                style={{ width: `${(item.value / maxChartValue) * 100}%`, backgroundColor: item.color }}
                                            />
                                        </View>
                                    </View>
                                ))}
                            </View>
                        )}
                    </View>
                </View>

                {/* Recent Pengeluaran */}
                <View className="px-6 mt-8">
                    <View className="flex-row justify-between items-center mb-4">
                        <View className="flex-row items-center gap-3">
                            <View className="w-10 h-10 bg-red-100 rounded-xl items-center justify-center">
                                <TrendingDown size={20} color="#EF4444" />
                            </View>
                            <Text className="text-gray-900 font-bold text-lg">Pengeluaran Terbaru</Text>
                        </View>
                        <TouchableOpacity
                            onPress={() => navigation.navigate('Transaksi')}
                            className="flex-row items-center"
                        >
                            <Text className="text-blue-600 font-semibold text-sm mr-1">Lihat Semua</Text>
                            <ChevronRight size={16} color="#2563EB" />
                        </TouchableOpacity>
                    </View>

                    {isPengeluaranLoading ? (
                        <ActivityIndicator color="#EF4444" />
                    ) : (pengeluaranData?.pages?.[0]?.data?.length || 0) === 0 ? (
                        <View className="bg-white p-8 rounded-2xl items-center border-2 border-dashed border-gray-200">
                            <TrendingDown size={32} color="#D1D5DB" />
                            <Text className="text-gray-400 text-sm mt-2">Belum ada pengeluaran</Text>
                        </View>
                    ) : (
                        <View className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100">
                            {pengeluaranData?.pages?.[0]?.data?.slice(0, 4).map((item: any, index: number) => (
                                <TouchableOpacity
                                    key={item.id}
                                    className={`flex-row items-center p-4 ${index !== 0 ? 'border-t border-gray-50' : ''}`}
                                    onPress={() => navigation.navigate('TransaksiDetail', { id: item.id })}
                                    activeOpacity={0.7}
                                >
                                    <View className="w-10 h-10 bg-red-50 rounded-xl items-center justify-center mr-3">
                                        <ArrowDownLeft size={18} color="#EF4444" />
                                    </View>
                                    <View className="flex-1">
                                        <Text className="font-semibold text-gray-900 text-sm mb-0.5" numberOfLines={1}>
                                            {item.keterangan}
                                        </Text>
                                        <Text className="text-gray-400 text-xs">
                                            {new Date(item.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                                        </Text>
                                    </View>
                                    <Text className="font-bold text-red-600 text-sm">
                                        -{formatCurrency(item.jumlah)}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}
                </View>

                {/* Recent Pengisian */}
                <View className="px-6 mt-8">
                    <View className="flex-row justify-between items-center mb-4">
                        <View className="flex-row items-center gap-3">
                            <View className="w-10 h-10 bg-emerald-100 rounded-xl items-center justify-center">
                                <Wallet size={20} color="#10B981" />
                            </View>
                            <Text className="text-gray-900 font-bold text-lg">Riwayat Pengisian</Text>
                        </View>
                        <TouchableOpacity
                            onPress={() => navigation.navigate('Transaksi')}
                            className="flex-row items-center"
                        >
                            <Text className="text-blue-600 font-semibold text-sm mr-1">Lihat Semua</Text>
                            <ChevronRight size={16} color="#2563EB" />
                        </TouchableOpacity>
                    </View>

                    {isPengisianLoading ? (
                        <ActivityIndicator color="#10B981" />
                    ) : (pengisianData?.pages?.[0]?.data?.length || 0) === 0 ? (
                        <View className="bg-white p-8 rounded-2xl items-center border-2 border-dashed border-gray-200">
                            <Wallet size={32} color="#D1D5DB" />
                            <Text className="text-gray-400 text-sm mt-2">Belum ada pengisian</Text>
                        </View>
                    ) : (
                        <View className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100">
                            {pengisianData?.pages?.[0]?.data?.slice(0, 4).map((item: any, index: number) => (
                                <TouchableOpacity
                                    key={item.id}
                                    className={`flex-row items-center p-4 ${index !== 0 ? 'border-t border-gray-50' : ''}`}
                                    onPress={() => navigation.navigate('TransaksiDetail', { id: item.id })}
                                    activeOpacity={0.7}
                                >
                                    <View className="w-10 h-10 bg-emerald-50 rounded-xl items-center justify-center mr-3">
                                        <ArrowUpRight size={18} color="#10B981" />
                                    </View>
                                    <View className="flex-1">
                                        <Text className="font-semibold text-gray-900 text-sm mb-0.5" numberOfLines={1}>
                                            {item.keterangan}
                                        </Text>
                                        <Text className="text-gray-400 text-xs">
                                            {new Date(item.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                                        </Text>
                                    </View>
                                    <Text className="font-bold text-emerald-600 text-sm">
                                        +{formatCurrency(item.jumlah)}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
