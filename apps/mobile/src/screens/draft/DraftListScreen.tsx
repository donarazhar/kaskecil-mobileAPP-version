import React from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { useDraft } from '@kas-kecil/api-client';
import { Plus, FileText, Clock, CheckCircle, XCircle } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { EmptyState } from '../../components/ui';

export default function DraftListScreen() {
    const navigation = useNavigation<any>();
    const { data, isLoading, refetch } = useDraft();
    const [refreshing, setRefreshing] = React.useState(false);

    const onRefresh = React.useCallback(async () => {
        setRefreshing(true);
        await refetch();
        setRefreshing(false);
    }, []);

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(value);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'approved': return 'bg-green-100 text-green-700';
            case 'rejected': return 'bg-red-100 text-red-700';
            default: return 'bg-yellow-100 text-yellow-700';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'approved': return <CheckCircle size={14} color="#15803D" />;
            case 'rejected': return <XCircle size={14} color="#B91C1C" />;
            default: return <Clock size={14} color="#A16207" />;
        }
    };

    const translateStatus = (status: string) => {
        switch (status) {
            case 'approved': return 'Disetujui';
            case 'rejected': return 'Ditolak';
            default: return 'Menunggu';
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
            <View className="px-6 py-4 bg-white border-b border-gray-100 flex-row justify-between items-center">
                <Text className="text-2xl font-bold text-gray-900">Draft Anggaran</Text>
            </View>

            {isLoading ? (
                <View className="flex-1 justify-center items-center">
                    <Text className="text-gray-500">Memuat data...</Text>
                </View>
            ) : (
                <FlatList
                    data={data?.data}
                    keyExtractor={(item) => String(item.id)}
                    contentContainerStyle={{ padding: 24, paddingBottom: 100 }}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                    }
                    ListEmptyComponent={
                        <EmptyState
                            icon={FileText}
                            title="Belum Ada Draft"
                            description="Buat pengajuan draft baru untuk memulai proses persetujuan."
                            actionLabel="Buat Draft Baru"
                            onAction={() => navigation.navigate('DraftCreate')}
                        />
                    }
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            className="bg-white p-4 rounded-xl border border-gray-100 mb-4 shadow-sm"
                            onPress={() => navigation.navigate('DraftDetail', { id: item.id })}
                        >
                            <View className="flex-row justify-between items-start mb-2">
                                <View className={`px-2 py-1 rounded-full flex-row items-center gap-1 ${getStatusColor(item.status)}`}>
                                    {getStatusIcon(item.status)}
                                    <Text className={`text-xs font-medium capitalize ${getStatusColor(item.status).split(' ')[1]}`}>
                                        {translateStatus(item.status)}
                                    </Text>
                                </View>
                                <Text className="text-xs text-gray-400">{item.tanggal}</Text>
                            </View>

                            <Text className="text-lg font-bold text-gray-900 mb-1">
                                {formatCurrency(item.jumlah)}
                            </Text>
                            <Text className="text-gray-500 text-sm mb-3 line-clamp-2" numberOfLines={2}>
                                {item.keterangan}
                            </Text>
                        </TouchableOpacity>
                    )}
                />
            )}

            <TouchableOpacity
                className="absolute bottom-6 right-6 bg-blue-600 w-14 h-14 rounded-full items-center justify-center shadow-lg"
                onPress={() => navigation.navigate('DraftCreate')}
            >
                <Plus color="white" size={24} />
            </TouchableOpacity>
        </SafeAreaView>
    );
}
