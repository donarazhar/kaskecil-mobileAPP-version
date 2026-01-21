import React, { useEffect, useRef } from 'react';
import { View, Animated, ViewProps, Easing } from 'react-native';
import clsx from 'clsx';

interface SkeletonProps extends ViewProps {
    width?: number | string;
    height?: number;
    borderRadius?: number;
    variant?: 'text' | 'circular' | 'rectangular';
}

export function Skeleton({
    width = '100%',
    height = 20,
    borderRadius = 8,
    variant = 'rectangular',
    className,
    style,
    ...props
}: SkeletonProps) {
    const animatedValue = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.loop(
            Animated.timing(animatedValue, {
                toValue: 1,
                duration: 1200,
                easing: Easing.linear,
                useNativeDriver: true,
            })
        ).start();
    }, [animatedValue]);

    const opacity = animatedValue.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: [0.4, 0.8, 0.4],
    });

    const variantStyles = {
        text: { borderRadius: 4 },
        circular: { borderRadius: typeof height === 'number' ? height / 2 : 50 },
        rectangular: { borderRadius },
    };

    return (
        <Animated.View
            {...props}
            style={[
                {
                    width,
                    height,
                    backgroundColor: '#E5E7EB',
                    opacity,
                    ...variantStyles[variant],
                },
                style,
            ]}
            className={className}
        />
    );
}

interface SkeletonCardProps extends ViewProps { }

export function SkeletonCard({ className, ...props }: SkeletonCardProps) {
    return (
        <View
            {...props}
            className={clsx(
                'bg-white p-4 rounded-2xl border border-gray-100',
                className
            )}
        >
            <View className="flex-row items-center mb-4">
                <Skeleton variant="circular" width={48} height={48} />
                <View className="ml-3 flex-1">
                    <Skeleton width="70%" height={16} style={{ marginBottom: 8 }} />
                    <Skeleton width="40%" height={12} />
                </View>
            </View>
            <Skeleton width="100%" height={14} style={{ marginBottom: 8 }} />
            <Skeleton width="80%" height={14} />
        </View>
    );
}

interface SkeletonListProps {
    count?: number;
}

export function SkeletonList({ count = 3 }: SkeletonListProps) {
    return (
        <View className="gap-4">
            {Array.from({ length: count }).map((_, index) => (
                <SkeletonCard key={index} />
            ))}
        </View>
    );
}
