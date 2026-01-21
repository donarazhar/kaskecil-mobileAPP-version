import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, Dimensions, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

interface SplashScreenProps {
    onFinish: () => void;
}

export default function AnimatedSplashScreen({ onFinish }: SplashScreenProps) {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.8)).current;
    const progressAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Run all animations in parallel for smooth loading
        Animated.parallel([
            // Fade in
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
            }),
            // Scale up
            Animated.spring(scaleAnim, {
                toValue: 1,
                friction: 8,
                tension: 60,
                useNativeDriver: true,
            }),
            // Progress bar fills slowly
            Animated.timing(progressAnim, {
                toValue: 1,
                duration: 4000,
                useNativeDriver: false,
            }),
        ]).start(() => {
            // Delay before transitioning to main app
            setTimeout(onFinish, 500);
        });
    }, []);

    const progressWidth = progressAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0%', '100%'],
    });

    return (
        <View className="flex-1">
            <LinearGradient
                colors={['#0053C5', '#0077E6', '#0099FF']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
            >
                {/* Logo & Text Container */}
                <Animated.View
                    style={{
                        opacity: fadeAnim,
                        transform: [{ scale: scaleAnim }],
                        alignItems: 'center',
                    }}
                >
                    {/* Logo Image */}
                    <Image
                        source={require('../../assets/logo.png')}
                        className="w-32 h-32 mb-5"
                        resizeMode="contain"
                    />

                    {/* App Name */}
                    <Text className="text-white text-3xl font-bold mb-1">Kas Kecil</Text>
                    <Text className="text-white/70 text-sm mb-6">Sistem Pengelolaan Kas Modern</Text>

                    {/* Progress Bar */}
                    <View style={{ width: 160 }}>
                        <View className="h-1 bg-white/20 rounded-full overflow-hidden">
                            <Animated.View
                                className="h-full bg-white rounded-full"
                                style={{ width: progressWidth }}
                            />
                        </View>
                    </View>
                </Animated.View>

                {/* Version at bottom */}
                <View className="absolute bottom-10">
                    <Text className="text-white/40 text-xs">v1.0.0</Text>
                </View>
            </LinearGradient>
        </View>
    );
}
