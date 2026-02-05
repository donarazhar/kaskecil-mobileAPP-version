import React, { useEffect, useRef } from "react";
import { View, Text, Animated, ActivityIndicator } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useTranslation } from "react-i18next";

interface SplashScreenProps {
  onFinish: () => void;
}

export default function AnimatedSplashScreen({ onFinish }: SplashScreenProps) {
  const { t } = useTranslation();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Simple fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();

    // Finish splash after 1.5 seconds
    const timer = setTimeout(onFinish, 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View className="flex-1">
      <LinearGradient
        colors={["#0053C5", "#0077E6", "#0099FF"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
      >
        <Animated.View
          style={{
            opacity: fadeAnim,
            alignItems: "center",
          }}
        >
          {/* App Name */}
          <Text className="text-white text-3xl font-bold mb-2">
            {t("common.appName")}
          </Text>
          <Text className="text-white/70 text-sm mb-8">
            {t("common.appTagline")}
          </Text>

          {/* Loading Spinner */}
          <ActivityIndicator size="large" color="white" />
          <Text className="text-white/60 text-sm mt-4">Memuat...</Text>
        </Animated.View>

        {/* Version at bottom */}
        <View className="absolute bottom-10">
          <Text className="text-white/40 text-xs">v1.0.0</Text>
        </View>
      </LinearGradient>
    </View>
  );
}
