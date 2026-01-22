import { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, ActivityIndicator, SafeAreaView, KeyboardAvoidingView, Platform, Linking, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '@/lib/api-client';
import { Eye, EyeOff, Lock, Mail, ArrowRight } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function LoginScreen() {
    const navigation = useNavigation<any>();
    const { login, isLoading } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleLogin = async () => {
        if (!email || !password) {
            alert('Mohon isi email dan password');
            return;
        }
        try {
            await login({ email, password });
        } catch (error: any) {
            console.error(error);
            alert(error.response?.data?.message || 'Login gagal');
        }
    };

    return (
        <View className="flex-1 bg-white">
            {/* Gradient Header */}
            <LinearGradient
                colors={['#0053C5', '#0077E6', '#0099FF']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="pt-16 pb-12 px-8 rounded-b-[40px]"
            >
                <View className="items-center">
                    {/* App Logo */}
                    <Image
                        source={require('../../../assets/logo.png')}
                        className="w-24 h-24 mb-4"
                        resizeMode="contain"
                    />
                    <Text className="text-white text-3xl font-bold mb-1">Kas Kecil</Text>
                    <Text className="text-white/80 text-sm">Sistem Pengelolaan Kas Modern</Text>
                </View>
            </LinearGradient>

            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                className="flex-1 px-6 pt-8"
            >
                {/* Welcome Text */}
                <View className="mb-8">
                    <Text className="text-2xl font-bold text-gray-900 mb-1">Selamat Datang! 👋</Text>
                    <Text className="text-gray-500">Masuk untuk mengelola kas Anda</Text>
                </View>

                {/* Form Fields */}
                <View className="space-y-5">
                    {/* Email Field */}
                    <View>
                        <Text className="text-gray-700 font-semibold mb-2 ml-1">Email</Text>
                        <View className="flex-row items-center bg-gray-50 border-2 border-gray-100 rounded-2xl px-4 py-3.5 focus:border-blue-500">
                            <View className="w-10 h-10 bg-blue-100 rounded-xl items-center justify-center">
                                <Mail size={18} color="#0053C5" />
                            </View>
                            <TextInput
                                className="flex-1 ml-3 text-gray-900 text-base"
                                placeholder="nama@perusahaan.com"
                                value={email}
                                onChangeText={setEmail}
                                autoCapitalize="none"
                                keyboardType="email-address"
                                placeholderTextColor="#9CA3AF"
                            />
                        </View>
                    </View>

                    {/* Password Field */}
                    <View>
                        <Text className="text-gray-700 font-semibold mb-2 ml-1">Password</Text>
                        <View className="flex-row items-center bg-gray-50 border-2 border-gray-100 rounded-2xl px-4 py-3.5">
                            <View className="w-10 h-10 bg-blue-100 rounded-xl items-center justify-center">
                                <Lock size={18} color="#0053C5" />
                            </View>
                            <TextInput
                                className="flex-1 ml-3 text-gray-900 text-base"
                                placeholder="••••••••"
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry={!showPassword}
                                placeholderTextColor="#9CA3AF"
                            />
                            <TouchableOpacity
                                onPress={() => setShowPassword(!showPassword)}
                                className="w-10 h-10 items-center justify-center"
                            >
                                {showPassword ? (
                                    <EyeOff size={20} color="#6B7280" />
                                ) : (
                                    <Eye size={20} color="#6B7280" />
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Login Button */}
                    <TouchableOpacity
                        className={`overflow-hidden rounded-2xl mt-4 ${isLoading ? 'opacity-70' : ''}`}
                        onPress={handleLogin}
                        disabled={isLoading}
                        activeOpacity={0.8}
                    >
                        <LinearGradient
                            colors={['#0053C5', '#0077E6']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            className="p-4 flex-row justify-center items-center"
                        >
                            {isLoading ? (
                                <>
                                    <ActivityIndicator color="white" className="mr-2" />
                                    <Text className="text-white font-bold text-lg">Sedang masuk...</Text>
                                </>
                            ) : (
                                <>
                                    <Text className="text-white font-bold text-lg mr-2">Masuk</Text>
                                    <View className="w-8 h-8 bg-white/20 rounded-full items-center justify-center">
                                        <ArrowRight size={18} color="white" />
                                    </View>
                                </>
                            )}
                        </LinearGradient>
                    </TouchableOpacity>
                </View>

                {/* Contact Admin */}
                <View className="mt-auto pb-8">
                    <View className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                        <Text className="text-gray-500 text-center text-sm mb-3">
                            Belum punya akun? Hubungi Administrator
                        </Text>
                        <View className="flex-row justify-center space-x-4">
                            <TouchableOpacity
                                onPress={() => Linking.openURL('mailto:donarazhar@al-azhar.or.id')}
                                className="flex-row items-center bg-blue-50 px-4 py-2 rounded-xl"
                            >
                                <Mail size={16} color="#0053C5" />
                                <Text className="text-[#0053C5] font-medium ml-2 text-sm">Email</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => Linking.openURL('https://wa.me/6288214740182')}
                                className="flex-row items-center bg-green-50 px-4 py-2 rounded-xl"
                            >
                                <Text className="text-green-600 font-medium text-sm">WhatsApp</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </View>
    );
}
