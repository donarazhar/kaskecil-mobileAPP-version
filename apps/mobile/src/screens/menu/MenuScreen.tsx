import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/lib/api-client';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import LanguageSelector from '@/components/LanguageSelector';
import {
    User,
    LogOut,
    Bell,
    FileText,
    Users,
    Building,
    Layers,
    CreditCard,
    ChevronRight,
    Smartphone
} from 'lucide-react-native';

interface MenuItemProps {
    icon: React.ElementType;
    label: string;
    description?: string;
    onPress: () => void;
    danger?: boolean;
    badge?: number;
}

function MenuItem({ icon: Icon, label, description, onPress, danger = false, badge }: MenuItemProps) {
    return (
        <TouchableOpacity
            className={`flex-row items-center px-4 py-4 ${danger ? 'bg-red-50/50' : 'bg-white'}`}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <View className={`w-11 h-11 rounded-2xl items-center justify-center mr-4 ${danger ? 'bg-red-100' : 'bg-gray-100'}`}>
                <Icon size={20} color={danger ? '#EF4444' : '#4B5563'} />
            </View>
            <View className="flex-1">
                <Text className={`text-base font-semibold ${danger ? 'text-red-500' : 'text-gray-800'}`}>
                    {label}
                </Text>
                {description && (
                    <Text className="text-xs text-gray-400 mt-0.5">{description}</Text>
                )}
            </View>
            {badge !== undefined && badge > 0 && (
                <View className="bg-red-500 rounded-full min-w-[22px] h-[22px] items-center justify-center mr-3 px-1.5">
                    <Text className="text-white text-xs font-bold">{badge}</Text>
                </View>
            )}
            <ChevronRight size={18} color={danger ? '#EF4444' : '#D1D5DB'} />
        </TouchableOpacity>
    );
}

function MenuSection({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <View className="mb-6">
            <Text className="px-5 pb-3 text-xs font-bold text-gray-400 uppercase tracking-wider">
                {title}
            </Text>
            <View className="bg-white rounded-3xl mx-4 overflow-hidden border border-gray-100 shadow-sm">
                {children}
            </View>
        </View>
    );
}

export default function MenuScreen() {
    const navigation = useNavigation<any>();
    const { t } = useTranslation();
    const { user, logout } = useAuth();

    const handleLogout = () => {
        Alert.alert(
            t('menu.logoutTitle'),
            t('menu.logoutConfirm'),
            [
                { text: t('common.cancel'), style: 'cancel' },
                {
                    text: t('menu.logout'),
                    style: 'destructive',
                    onPress: () => logout()
                },
            ]
        );
    };

    const isAdmin = ['admin', 'super_admin'].includes(user?.role?.name as string);

    return (
        <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Profile Card with Gradient */}
                <View className="px-4 pt-4 pb-2">
                    <TouchableOpacity
                        onPress={() => navigation.navigate('Profile')}
                        activeOpacity={0.9}
                    >
                        <LinearGradient
                            colors={['#0053C5', '#0077E6', '#0099FF']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            className="p-5 rounded-3xl"
                        >
                            <View className="flex-row items-center">
                                {/* Avatar */}
                                <View className="w-16 h-16 bg-white/20 rounded-2xl items-center justify-center border-2 border-white/30">
                                    <Text className="text-2xl font-bold text-white">
                                        {user?.nama?.charAt(0).toUpperCase() ?? 'U'}
                                    </Text>
                                </View>

                                {/* User Info */}
                                <View className="ml-4 flex-1">
                                    <Text className="text-xl font-bold text-white" numberOfLines={1}>{user?.nama}</Text>
                                    <Text className="text-white/70 text-sm" numberOfLines={1}>{user?.email}</Text>
                                    <View className="bg-white/20 self-start px-3 py-1 rounded-full mt-2 border border-white/20">
                                        <Text className="text-xs text-white font-semibold">
                                            {user?.role?.display_name ?? 'User'}
                                        </Text>
                                    </View>
                                </View>

                                {/* Arrow */}
                                <View className="w-10 h-10 bg-white/20 rounded-xl items-center justify-center">
                                    <ChevronRight size={20} color="white" />
                                </View>
                            </View>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>

                <View className="h-4" />

                {/* Account Section */}
                <MenuSection title={t('menu.myAccount')}>
                    <MenuItem
                        icon={User}
                        label={t('menu.profile')}
                        description={t('menu.profileDesc')}
                        onPress={() => navigation.navigate('Profile')}
                    />
                    <View className="h-px bg-gray-100 mx-4" />
                    <MenuItem
                        icon={Bell}
                        label={t('menu.notifications')}
                        description={t('menu.notificationsDesc')}
                        onPress={() => navigation.navigate('Notifications')}
                        badge={3}
                    />
                    <View className="h-px bg-gray-100 mx-4" />
                    {/* Language Selector */}
                    <LanguageSelector variant="menu-item" />
                </MenuSection>

                {/* Admin Section */}
                {isAdmin && (
                    <MenuSection title={t('menu.adminPanel')}>
                        <MenuItem
                            icon={Users}
                            label={t('menu.manageUsers')}
                            description={t('menu.manageUsersDesc')}
                            onPress={() => Alert.alert(t('common.comingSoon'), t('menu.manageUsersDesc'))}
                        />
                        <View className="h-px bg-gray-100 mx-4" />
                        <MenuItem
                            icon={Building}
                            label={t('menu.masterBranch')}
                            description={t('menu.masterBranchDesc')}
                            onPress={() => Alert.alert(t('common.comingSoon'), t('menu.masterBranchDesc'))}
                        />
                        <View className="h-px bg-gray-100 mx-4" />
                        <MenuItem
                            icon={Layers}
                            label={t('menu.masterUnit')}
                            description={t('menu.masterUnitDesc')}
                            onPress={() => Alert.alert(t('common.comingSoon'), t('menu.masterUnitDesc'))}
                        />
                        <View className="h-px bg-gray-100 mx-4" />
                        <MenuItem
                            icon={CreditCard}
                            label={t('menu.budgetItem')}
                            description={t('menu.budgetItemDesc')}
                            onPress={() => Alert.alert(t('common.comingSoon'), t('menu.budgetItemDesc'))}
                        />
                    </MenuSection>
                )}

                {/* Support Section */}
                <MenuSection title={t('menu.helpInfo')}>
                    <MenuItem
                        icon={Smartphone}
                        label={t('menu.aboutApp')}
                        description={t('menu.aboutAppDesc')}
                        onPress={() => Alert.alert(t('common.appName'), `${t('common.version')} 4.0\n\n${t('common.appTagline')}`)}
                    />
                </MenuSection>

                {/* Logout */}
                <View className="mx-4 mb-6">
                    <TouchableOpacity
                        className="flex-row items-center justify-center py-4 bg-red-50 rounded-2xl border border-red-100"
                        onPress={handleLogout}
                        activeOpacity={0.8}
                    >
                        <View className="w-10 h-10 bg-red-100 rounded-xl items-center justify-center mr-3">
                            <LogOut size={20} color="#EF4444" />
                        </View>
                        <Text className="text-red-500 font-bold text-base">{t('menu.logout')}</Text>
                    </TouchableOpacity>
                </View>

                {/* Version Info */}
                <View className="items-center pb-8">
                    <View className="flex-row items-center mb-2">
                        <View className="w-8 h-8 bg-blue-100 rounded-lg items-center justify-center mr-2">
                            <Text className="text-blue-600 font-bold text-xs">KK</Text>
                        </View>
                        <Text className="text-gray-400 font-medium">{t('common.appName')}</Text>
                    </View>
                    <Text className="text-gray-300 text-xs">v4.0 • © 2026</Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
