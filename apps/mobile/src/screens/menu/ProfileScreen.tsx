import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/lib/api-client';
import { ArrowLeft, Mail, Phone, Building, Briefcase, Calendar, Edit2, Shield, MapPin } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function ProfileScreen() {
    const navigation = useNavigation();
    const { t } = useTranslation();
    const { user } = useAuth();

    const ProfileItem = ({ icon: Icon, label, value, iconColor = '#0053C5' }: { icon: React.ElementType; label: string; value: string; iconColor?: string }) => (
        <View className="flex-row items-center py-4 border-b border-gray-50">
            <View className="w-11 h-11 bg-blue-50 rounded-xl items-center justify-center mr-4">
                <Icon size={18} color={iconColor} />
            </View>
            <View className="flex-1">
                <Text className="text-gray-400 text-xs font-medium mb-0.5 uppercase tracking-wide">{label}</Text>
                <Text className="text-gray-900 font-semibold text-base">{value || '-'}</Text>
            </View>
        </View>
    );

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
                <Text className="text-xl font-bold text-gray-900 flex-1">{t('profile.title')}</Text>
                <View className="w-11" />
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Avatar Section with Gradient */}
                <LinearGradient
                    colors={['#0053C5', '#0077E6', '#0099FF']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    className="px-6 pt-8 pb-20 items-center"
                >
                    {/* Avatar with Ring */}
                    <View className="p-1 rounded-[32px] bg-white/20 mb-5">
                        <View className="w-28 h-28 bg-white/30 rounded-3xl items-center justify-center border-4 border-white/50">
                            <Text className="text-5xl font-bold text-white">
                                {user?.nama?.charAt(0).toUpperCase() ?? 'U'}
                            </Text>
                        </View>
                    </View>

                    {/* Name & Email */}
                    <Text className="text-2xl font-bold text-white mb-1">{user?.nama}</Text>
                    <Text className="text-white/70 mb-3">{user?.email}</Text>

                    {/* Role Badge */}
                    <View className="flex-row items-center bg-white/20 px-4 py-2 rounded-full border border-white/30">
                        <Shield size={14} color="white" />
                        <Text className="text-white font-semibold text-sm ml-2">
                            {user?.role?.display_name ?? 'User'}
                        </Text>
                    </View>
                </LinearGradient>

                {/* Profile Details Card - Overlapping */}
                <View className="px-4 -mt-12">
                    <View className="bg-white rounded-3xl px-5 py-2 shadow-lg shadow-gray-200 border border-gray-100">
                        <ProfileItem
                            icon={Mail}
                            label={t('auth.email')}
                            value={user?.email || ''}
                        />
                        <ProfileItem
                            icon={Phone}
                            label={t('profile.phone')}
                            value={user?.telepon || t('common.noData')}
                            iconColor="#10B981"
                        />
                        <ProfileItem
                            icon={Building}
                            label={t('profile.branch')}
                            value={user?.cabang?.nama_cabang || t('common.noData')}
                            iconColor="#F59E0B"
                        />
                        <ProfileItem
                            icon={MapPin}
                            label={t('profile.unit')}
                            value={user?.unit?.nama_unit || t('common.noData')}
                            iconColor="#8B5CF6"
                        />
                        <ProfileItem
                            icon={Briefcase}
                            label={t('profile.role')}
                            value={user?.role?.display_name || 'User'}
                            iconColor="#EF4444"
                        />
                        <View className="flex-row items-center py-4">
                            <View className="w-11 h-11 bg-blue-50 rounded-xl items-center justify-center mr-4">
                                <Calendar size={18} color="#0053C5" />
                            </View>
                            <View className="flex-1">
                                <Text className="text-gray-400 text-xs font-medium mb-0.5 uppercase tracking-wide">{t('profile.joinedSince')}</Text>
                                <Text className="text-gray-900 font-semibold text-base">
                                    {user?.created_at ? new Date(user.created_at).toLocaleDateString('id-ID', {
                                        day: 'numeric',
                                        month: 'long',
                                        year: 'numeric'
                                    }) : '-'}
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Quick Actions */}
                <View className="px-4 mt-6 mb-8">
                    <Text className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-1">{t('profile.quickActions')}</Text>
                    <View className="flex-row gap-3">
                        <TouchableOpacity
                            className="flex-1 bg-white rounded-2xl p-4 items-center border border-gray-100 shadow-sm"
                            activeOpacity={0.7}
                            onPress={() => navigation.navigate('ProfileEdit' as never)}
                        >
                            <View className="w-12 h-12 bg-blue-100 rounded-xl items-center justify-center mb-2">
                                <Edit2 size={20} color="#0053C5" />
                            </View>
                            <Text className="text-gray-700 font-semibold text-sm">{t('profile.editProfile')}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            className="flex-1 bg-white rounded-2xl p-4 items-center border border-gray-100 shadow-sm"
                            activeOpacity={0.7}
                            onPress={() => navigation.navigate('ChangePassword' as never)}
                        >
                            <View className="w-12 h-12 bg-amber-100 rounded-xl items-center justify-center mb-2">
                                <Shield size={20} color="#F59E0B" />
                            </View>
                            <Text className="text-gray-700 font-semibold text-sm">{t('profile.changePassword')}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
