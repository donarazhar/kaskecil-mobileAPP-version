import React from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, Bell, CheckCircle, AlertCircle, Info, Trash2, CheckCheck } from 'lucide-react-native';
import { EmptyState } from '../../components/ui';

// Mock notifications data - replace with actual API later
const mockNotifications = [
    {
        id: '1',
        type: 'approval',
        title: 'Draft Disetujui',
        message: 'Draft pengajuan #123 telah disetujui oleh Admin.',
        time: '5 menit lalu',
        read: false,
    },
    {
        id: '2',
        type: 'rejection',
        title: 'Draft Ditolak',
        message: 'Draft pengajuan #120 ditolak. Alasan: Dokumen tidak lengkap.',
        time: '1 jam lalu',
        read: false,
    },
    {
        id: '3',
        type: 'info',
        title: 'Pengisian Kas Baru',
        message: 'Kas cabang telah diisi kembali sebesar Rp 5.000.000.',
        time: '2 jam lalu',
        read: true,
    },
];

const getNotificationIcon = (type: string) => {
    switch (type) {
        case 'approval':
            return { icon: CheckCircle, color: '#10B981', bg: 'bg-emerald-100' };
        case 'rejection':
            return { icon: AlertCircle, color: '#EF4444', bg: 'bg-red-100' };
        default:
            return { icon: Info, color: '#3B82F6', bg: 'bg-blue-100' };
    }
};

export default function NotificationsScreen() {
    const navigation = useNavigation();
    const [notifications, setNotifications] = React.useState(mockNotifications);

    const markAsRead = (id: string) => {
        setNotifications(prev =>
            prev.map(n => n.id === id ? { ...n, read: true } : n)
        );
    };

    const deleteNotification = (id: string) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    const renderNotification = ({ item, index }: { item: typeof mockNotifications[0]; index: number }) => {
        const { icon: Icon, color, bg } = getNotificationIcon(item.type);

        return (
            <TouchableOpacity
                className={`mx-4 mb-3 p-4 rounded-2xl border ${!item.read ? 'bg-blue-50/80 border-blue-100' : 'bg-white border-gray-100'}`}
                onPress={() => markAsRead(item.id)}
                activeOpacity={0.7}
            >
                <View className="flex-row">
                    <View className={`w-12 h-12 ${bg} rounded-2xl items-center justify-center mr-4`}>
                        <Icon size={22} color={color} />
                    </View>
                    <View className="flex-1">
                        <View className="flex-row items-center justify-between mb-1">
                            <Text className="font-bold text-gray-900 text-base">{item.title}</Text>
                            {!item.read && (
                                <View className="w-2.5 h-2.5 bg-blue-500 rounded-full" />
                            )}
                        </View>
                        <Text className="text-gray-600 text-sm mb-2" numberOfLines={2}>
                            {item.message}
                        </Text>
                        <View className="flex-row items-center justify-between">
                            <Text className="text-gray-400 text-xs font-medium">{item.time}</Text>
                            <TouchableOpacity
                                className="w-8 h-8 bg-gray-100 rounded-lg items-center justify-center"
                                onPress={() => deleteNotification(item.id)}
                            >
                                <Trash2 size={14} color="#9CA3AF" />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
            {/* Header */}
            <View className="px-4 py-3 bg-white flex-row items-center border-b border-gray-100">
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    className="mr-3 w-11 h-11 items-center justify-center rounded-xl bg-gray-100"
                    activeOpacity={0.7}
                >
                    <ArrowLeft size={22} color="#374151" />
                </TouchableOpacity>
                <View className="flex-1">
                    <Text className="text-xl font-bold text-gray-900">Notifikasi</Text>
                    {unreadCount > 0 && (
                        <Text className="text-gray-500 text-xs">{unreadCount} belum dibaca</Text>
                    )}
                </View>
                {notifications.some(n => !n.read) && (
                    <TouchableOpacity
                        onPress={() => setNotifications(prev => prev.map(n => ({ ...n, read: true })))}
                        className="flex-row items-center bg-blue-50 px-3 py-2 rounded-xl"
                        activeOpacity={0.7}
                    >
                        <CheckCheck size={16} color="#2563EB" />
                        <Text className="text-blue-600 font-semibold text-sm ml-1.5">Baca Semua</Text>
                    </TouchableOpacity>
                )}
            </View>

            <FlatList
                data={notifications}
                keyExtractor={(item) => item.id}
                renderItem={renderNotification}
                contentContainerStyle={{ flexGrow: 1, paddingTop: 16, paddingBottom: 24 }}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <View className="flex-1 items-center justify-center px-8">
                        <View className="w-20 h-20 bg-gray-100 rounded-3xl items-center justify-center mb-4">
                            <Bell size={40} color="#D1D5DB" />
                        </View>
                        <Text className="text-xl font-bold text-gray-900 mb-2 text-center">Tidak Ada Notifikasi</Text>
                        <Text className="text-gray-500 text-center text-sm">
                            Anda akan menerima notifikasi saat ada update pada pengajuan atau transaksi Anda.
                        </Text>
                    </View>
                }
            />
        </SafeAreaView>
    );
}
