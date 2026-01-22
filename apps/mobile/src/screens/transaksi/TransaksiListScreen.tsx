import React from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, ActivityIndicator, Modal, ScrollView } from 'react-native';
import { useTransaksi, useDraft } from '@/lib/api-client';
import { formatCurrency, formatDate } from '@/lib/shared';
import { Plus, Search, ArrowUpRight, ArrowDownLeft, Calendar, Wallet, CheckCircle, Clock, ChevronDown, X, Filter, TrendingDown, TrendingUp } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { EmptyState, SkeletonList } from '../../components/ui';
import { LinearGradient } from 'expo-linear-gradient';

const FilterSelect = ({
    label,
    value,
    options,
    onSelect
}: {
    label: string;
    value: string | number;
    options: { label: string; value: string | number }[];
    onSelect: (value: any) => void;
}) => {
    const [modalVisible, setModalVisible] = React.useState(false);
    const selectedLabel = options.find(o => o.value === value)?.label || label;

    return (
        <View className="flex-1">
            <TouchableOpacity
                onPress={() => setModalVisible(true)}
                className="bg-white border border-gray-200 rounded-xl px-4 py-3 flex-row justify-between items-center shadow-sm"
            >
                <View>
                    <Text className="text-[10px] text-gray-400 uppercase font-semibold mb-0.5">{label}</Text>
                    <Text className="text-gray-800 font-bold">{selectedLabel}</Text>
                </View>
                <View className="w-8 h-8 bg-gray-100 rounded-lg items-center justify-center">
                    <ChevronDown size={16} color="#6B7280" />
                </View>
            </TouchableOpacity>

            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <TouchableOpacity
                    activeOpacity={1}
                    onPress={() => setModalVisible(false)}
                    className="flex-1 justify-end bg-black/50"
                >
                    <View className="bg-white rounded-t-3xl max-h-[60%] overflow-hidden">
                        <View className="flex-row justify-between items-center p-5 border-b border-gray-100">
                            <Text className="text-lg font-bold text-gray-900">Pilih {label}</Text>
                            <TouchableOpacity
                                onPress={() => setModalVisible(false)}
                                className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center"
                            >
                                <X size={20} color="#6B7280" />
                            </TouchableOpacity>
                        </View>
                        <ScrollView contentContainerStyle={{ padding: 16 }}>
                            {options.map((option) => (
                                <TouchableOpacity
                                    key={option.value}
                                    onPress={() => {
                                        onSelect(option.value);
                                        setModalVisible(false);
                                    }}
                                    className={`p-4 rounded-2xl mb-2 flex-row justify-between items-center ${option.value === value ? 'bg-blue-50 border-2 border-blue-200' : 'bg-gray-50 border-2 border-transparent'}`}
                                >
                                    <Text className={`text-base ${option.value === value ? 'text-blue-600 font-bold' : 'text-gray-700 font-medium'}`}>
                                        {option.label}
                                    </Text>
                                    {option.value === value && (
                                        <View className="w-6 h-6 bg-blue-600 rounded-full items-center justify-center">
                                            <CheckCircle size={14} color="white" />
                                        </View>
                                    )}
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </TouchableOpacity>
            </Modal>
        </View>
    );
};

export default function TransaksiListScreen() {
    const navigation = useNavigation<any>();
    const [searchQuery, setSearchQuery] = React.useState('');
    const [category, setCategory] = React.useState<'pengeluaran' | 'pengisian'>('pengeluaran');

    // Get current date for initial state
    const currentDate = React.useMemo(() => new Date(), []);
    const [selectedMonth, setSelectedMonth] = React.useState(() => currentDate.getMonth() + 1);
    const [selectedYear, setSelectedYear] = React.useState(() => currentDate.getFullYear());

    // Calculate date range for filter
    const dateRange = React.useMemo(() => {
        const from = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-01`;
        const lastDay = new Date(selectedYear, selectedMonth, 0).getDate();
        const to = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${lastDay}`;
        return { from, to };
    }, [selectedMonth, selectedYear]);

    const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useTransaksi({
        kategori: category,
        search: searchQuery,
        from: category === 'pengeluaran' ? dateRange.from : undefined,
        to: category === 'pengeluaran' ? dateRange.to : undefined,
    });

    const { data: draftData, isLoading: isDraftLoading } = useDraft({
        kategori: 'pengisian',
        status: 'draft',
        search: searchQuery
    });

    // Flatten pages into a single array
    const allTransactions = React.useMemo(() => {
        const realTransactions = (data?.pages.flatMap(page => page?.data || []) || []).filter(item => item !== null && item !== undefined);

        // If category is pengisian, merge with drafts
        if (category === 'pengisian') {
            const drafts = (draftData?.data || []).map((d: any) => ({ ...d, is_draft: true }));
            return [...drafts, ...realTransactions];
        }

        return realTransactions;
    }, [data, draftData, category]);

    const filteredData = React.useMemo(() => {
        return allTransactions.filter((item: any) =>
            item && item.keterangan && item.keterangan.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [allTransactions, searchQuery]);

    // Group transactions by date
    const groupedData = React.useMemo(() => {
        if (!filteredData.length) return [];

        const groups: any = {};
        filteredData.forEach((item: any) => {
            const date = item.tanggal;
            if (!groups[date]) {
                groups[date] = [];
            }
            groups[date].push(item);
        });

        return Object.keys(groups).sort((a, b) => new Date(b).getTime() - new Date(a).getTime()).map(date => ({
            title: formatDate(date, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
            data: groups[date]
        }));
    }, [filteredData]);

    const handleLoadMore = () => {
        if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
            {/* Header */}
            <View className="bg-white border-b border-gray-100">
                <View className="px-5 pt-4 pb-4">
                    <View className="flex-row justify-between items-center mb-5">
                        <View>
                            <Text className="text-2xl font-bold text-gray-900">Riwayat</Text>
                            <Text className="text-gray-500 text-sm">Transaksi Kas Kecil</Text>
                        </View>
                        <View className="flex-row items-center gap-2">
                            <View className={`px-3 py-1.5 rounded-full ${category === 'pengeluaran' ? 'bg-red-100' : 'bg-emerald-100'}`}>
                                {category === 'pengeluaran' ? (
                                    <TrendingDown size={16} color="#EF4444" />
                                ) : (
                                    <TrendingUp size={16} color="#10B981" />
                                )}
                            </View>
                        </View>
                    </View>

                    {/* Tabs */}
                    <View className="flex-row bg-gray-100 p-1.5 rounded-2xl mb-4">
                        <TouchableOpacity
                            className={`flex-1 py-3 rounded-xl items-center flex-row justify-center ${category === 'pengeluaran' ? 'bg-white shadow-sm' : ''}`}
                            onPress={() => setCategory('pengeluaran')}
                            activeOpacity={0.8}
                        >
                            <ArrowDownLeft size={16} color={category === 'pengeluaran' ? '#EF4444' : '#9CA3AF'} />
                            <Text className={`font-bold ml-2 ${category === 'pengeluaran' ? 'text-red-600' : 'text-gray-400'}`}>Pengeluaran</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            className={`flex-1 py-3 rounded-xl items-center flex-row justify-center ${category === 'pengisian' ? 'bg-white shadow-sm' : ''}`}
                            onPress={() => setCategory('pengisian')}
                            activeOpacity={0.8}
                        >
                            <ArrowUpRight size={16} color={category === 'pengisian' ? '#10B981' : '#9CA3AF'} />
                            <Text className={`font-bold ml-2 ${category === 'pengisian' ? 'text-emerald-600' : 'text-gray-400'}`}>Pengisian</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Search Bar */}
                    <View className="flex-row items-center bg-gray-100 rounded-2xl px-4 py-1">
                        <View className="w-10 h-10 items-center justify-center">
                            <Search size={20} color="#9CA3AF" />
                        </View>
                        <TextInput
                            className="flex-1 text-gray-900 py-3 text-base"
                            placeholder={`Cari ${category}...`}
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            placeholderTextColor="#9CA3AF"
                        />
                        {searchQuery.length > 0 && (
                            <TouchableOpacity onPress={() => setSearchQuery('')}>
                                <X size={18} color="#9CA3AF" />
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* Date Filter (Only for Pengeluaran) */}
                    {category === 'pengeluaran' && (
                        <View className="flex-row items-center justify-between mt-4 gap-3">
                            <FilterSelect
                                label="Bulan"
                                value={selectedMonth}
                                options={[
                                    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
                                    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
                                ].map((label, index) => ({
                                    label,
                                    value: index + 1
                                }))}
                                onSelect={setSelectedMonth}
                            />

                            <FilterSelect
                                label="Tahun"
                                value={selectedYear}
                                options={Array.from({ length: 5 }, (_, i) => {
                                    const year = new Date().getFullYear() - i;
                                    return { label: String(year), value: year };
                                })}
                                onSelect={setSelectedYear}
                            />
                        </View>
                    )}
                </View>
            </View>

            {/* Transaction List */}
            {isLoading ? (
                <View className="flex-1 p-6">
                    <SkeletonList count={4} />
                </View>
            ) : (
                <FlatList
                    data={groupedData}
                    keyExtractor={(item) => item.title}
                    contentContainerStyle={{ padding: 20, paddingBottom: 120 }}
                    onEndReached={handleLoadMore}
                    onEndReachedThreshold={0.5}
                    showsVerticalScrollIndicator={false}
                    ListFooterComponent={
                        isFetchingNextPage ? (
                            <View className="py-4">
                                <ActivityIndicator size="small" color="#2563EB" />
                            </View>
                        ) : null
                    }
                    ListEmptyComponent={
                        <View className="flex-1 items-center justify-center pt-16">
                            <View className="w-20 h-20 bg-gray-100 rounded-3xl items-center justify-center mb-4">
                                <Wallet size={40} color="#D1D5DB" />
                            </View>
                            <Text className="text-xl font-bold text-gray-900 mb-2">Belum Ada Transaksi</Text>
                            <Text className="text-gray-500 text-center mb-6 px-8">Transaksi kas akan muncul di sini setelah Anda mencatat.</Text>
                            <TouchableOpacity
                                className="bg-blue-600 px-6 py-3 rounded-xl flex-row items-center"
                                onPress={() => navigation.navigate('TransaksiCreate')}
                            >
                                <Plus size={18} color="white" />
                                <Text className="text-white font-bold ml-2">Catat Transaksi</Text>
                            </TouchableOpacity>
                        </View>
                    }
                    renderItem={({ item }) => (
                        <View className="mb-5">
                            {/* Date Header */}
                            <View className="flex-row items-center mb-3 px-1">
                                <View className="w-8 h-8 bg-gray-200 rounded-lg items-center justify-center mr-3">
                                    <Calendar size={14} color="#6B7280" />
                                </View>
                                <Text className="text-gray-600 font-bold text-sm">{item.title}</Text>
                            </View>

                            {/* Transaction Cards */}
                            <View className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100">
                                {item.data.map((trx: any, index: number) => (
                                    <TouchableOpacity
                                        key={`${trx.is_draft ? 'draft' : 'real'}-${trx.id}`}
                                        className={`flex-row items-center p-4 ${index !== 0 ? 'border-t border-gray-50' : ''}`}
                                        onPress={() => navigation.navigate('TransaksiDetail', { id: trx.id, is_draft: trx.is_draft })}
                                        activeOpacity={0.7}
                                    >
                                        {/* Icon */}
                                        <View className={`w-12 h-12 rounded-2xl items-center justify-center mr-4 ${['pembentukan', 'pengisian'].includes(trx.kategori) ? 'bg-emerald-100' : 'bg-red-100'
                                            }`}>
                                            {['pembentukan', 'pengisian'].includes(trx.kategori) ? (
                                                <ArrowUpRight size={22} color="#10B981" />
                                            ) : (
                                                <ArrowDownLeft size={22} color="#EF4444" />
                                            )}
                                        </View>

                                        {/* Content */}
                                        <View className="flex-1">
                                            <Text className="font-bold text-gray-900 mb-1" numberOfLines={1}>
                                                {trx.keterangan}
                                            </Text>
                                            <Text className="text-xs text-gray-400">
                                                {trx.cabang?.nama || trx.kategori} • {trx.mata_anggaran?.akun_aas?.nama_akun || '-'}
                                            </Text>
                                            {category === 'pengisian' && (
                                                <View className={`self-start px-2.5 py-1 rounded-full mt-2 flex-row items-center ${trx.is_draft ? 'bg-amber-100' : 'bg-emerald-100'}`}>
                                                    {trx.is_draft ? <Clock size={10} color="#B45309" /> : <CheckCircle size={10} color="#059669" />}
                                                    <Text className={`text-[10px] ml-1 font-bold ${trx.is_draft ? 'text-amber-700' : 'text-emerald-700'}`}>
                                                        {trx.is_draft ? 'Belum Cair' : 'Sudah Cair'}
                                                    </Text>
                                                </View>
                                            )}
                                        </View>

                                        {/* Amount */}
                                        <View className="items-end">
                                            <Text className={`font-bold text-base ${['pembentukan', 'pengisian'].includes(trx.kategori) ? 'text-emerald-600' : 'text-red-600'
                                                }`}>
                                                {['pembentukan', 'pengisian'].includes(trx.kategori) ? '+' : '-'}{formatCurrency(trx.jumlah)}
                                            </Text>
                                        </View>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    )}
                />
            )}

            {/* FAB */}
            <TouchableOpacity
                className="absolute bottom-6 right-6 overflow-hidden rounded-full shadow-xl"
                onPress={() => navigation.navigate('TransaksiCreate')}
                activeOpacity={0.9}
            >
                <LinearGradient
                    colors={['#2563EB', '#1D4ED8']}
                    className="w-16 h-16 items-center justify-center"
                >
                    <Plus size={28} color="white" />
                </LinearGradient>
            </TouchableOpacity>
        </SafeAreaView>
    );
}
