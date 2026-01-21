import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { BottomTabParamList, DraftStackParamList, MenuStackParamList, TransaksiStackParamList } from './types';
import { Home, Wallet, FileText, PieChart, Menu } from 'lucide-react-native';
import { View, Platform } from 'react-native';

// Screens
import DashboardScreen from '../screens/dashboard/DashboardScreen';
import TransaksiListScreen from '../screens/transaksi/TransaksiListScreen';
import TransaksiCreateScreen from '../screens/transaksi/TransaksiCreateScreen';
import TransaksiDetailScreen from '../screens/transaksi/TransaksiDetailScreen';
import TransaksiEditScreen from '../screens/transaksi/TransaksiEditScreen';
import DraftListScreen from '../screens/draft/DraftListScreen';
import DraftCreateScreen from '../screens/draft/DraftCreateScreen';
import DraftDetailScreen from '../screens/draft/DraftDetailScreen';
import DraftEditScreen from '../screens/draft/DraftEditScreen';
import LaporanScreen from '../screens/laporan/LaporanScreen';
import MenuScreen from '../screens/menu/MenuScreen';
import ProfileScreen from '../screens/menu/ProfileScreen';
import NotificationsScreen from '../screens/menu/NotificationsScreen';

import ProfileEditScreen from '../screens/menu/ProfileEditScreen';
import ChangePasswordScreen from '../screens/menu/ChangePasswordScreen';

const Tab = createBottomTabNavigator<BottomTabParamList>();
const TransaksiStack = createNativeStackNavigator<TransaksiStackParamList>();
const DraftStack = createNativeStackNavigator<DraftStackParamList>();
const MenuStack = createNativeStackNavigator<MenuStackParamList>();

function TransaksiNavigator() {
    return (
        <TransaksiStack.Navigator screenOptions={{ headerShown: false }}>
            <TransaksiStack.Screen name="TransaksiList" component={TransaksiListScreen} />
            <TransaksiStack.Screen name="TransaksiCreate" component={TransaksiCreateScreen} />
            <TransaksiStack.Screen name="TransaksiDetail" component={TransaksiDetailScreen} />
            <TransaksiStack.Screen name="TransaksiEdit" component={TransaksiEditScreen} />
            <TransaksiStack.Screen name="DraftEdit" component={DraftEditScreen} />
        </TransaksiStack.Navigator>
    );
}

function DraftNavigator() {
    return (
        <DraftStack.Navigator screenOptions={{ headerShown: false }}>
            <DraftStack.Screen name="DraftList" component={DraftListScreen} />
            <DraftStack.Screen name="DraftCreate" component={DraftCreateScreen} />
            <DraftStack.Screen name="DraftDetail" component={DraftDetailScreen} />
        </DraftStack.Navigator>
    );
}

function MenuNavigator() {
    return (
        <MenuStack.Navigator screenOptions={{ headerShown: false }}>
            <MenuStack.Screen name="Menu" component={MenuScreen} />
            <MenuStack.Screen name="Profile" component={ProfileScreen} />
            <MenuStack.Screen name="ProfileEdit" component={ProfileEditScreen} />
            <MenuStack.Screen name="ChangePassword" component={ChangePasswordScreen} />
            <MenuStack.Screen name="Notifications" component={NotificationsScreen} />
        </MenuStack.Navigator>
    );
}

export default function BottomTabNavigator() {
    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: '#2563EB',
                tabBarInactiveTintColor: '#9CA3AF',
                tabBarStyle: {
                    backgroundColor: '#FFFFFF',
                    borderTopWidth: 0,
                    elevation: 20,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: -4 },
                    shadowOpacity: 0.08,
                    shadowRadius: 12,
                    height: Platform.OS === 'ios' ? 88 : 70,
                    paddingTop: 8,
                    paddingBottom: Platform.OS === 'ios' ? 28 : 12,
                },
                tabBarLabelStyle: {
                    fontSize: 11,
                    fontWeight: '600',
                },
            }}
        >
            <Tab.Screen
                name="Dashboard"
                component={DashboardScreen}
                options={{
                    tabBarIcon: ({ color, size, focused }) => (
                        <View className={`p-1.5 rounded-xl ${focused ? 'bg-blue-100' : ''}`}>
                            <Home color={color} size={22} />
                        </View>
                    ),
                    tabBarLabel: 'Beranda',
                }}
            />
            <Tab.Screen
                name="Transaksi"
                component={TransaksiNavigator}
                options={{
                    tabBarIcon: ({ color, size, focused }) => (
                        <View className={`p-1.5 rounded-xl ${focused ? 'bg-blue-100' : ''}`}>
                            <Wallet color={color} size={22} />
                        </View>
                    ),
                    tabBarLabel: 'Transaksi',
                }}
            />

            <Tab.Screen
                name="Laporan"
                component={LaporanScreen}
                options={{
                    tabBarIcon: ({ color, size, focused }) => (
                        <View className={`p-1.5 rounded-xl ${focused ? 'bg-blue-100' : ''}`}>
                            <PieChart color={color} size={22} />
                        </View>
                    ),
                    tabBarLabel: 'Laporan',
                }}
            />
            <Tab.Screen
                name="MenuTab"
                component={MenuNavigator}
                options={{
                    tabBarIcon: ({ color, size, focused }) => (
                        <View className={`p-1.5 rounded-xl ${focused ? 'bg-blue-100' : ''}`}>
                            <Menu color={color} size={22} />
                        </View>
                    ),
                    tabBarLabel: 'Menu',
                }}
            />
        </Tab.Navigator>
    );
}
