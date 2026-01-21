import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { LucideIcon, FileX } from 'lucide-react-native';
import { Button } from './Button';

interface EmptyStateProps {
    icon?: LucideIcon;
    title: string;
    description?: string;
    actionLabel?: string;
    onAction?: () => void;
}

export function EmptyState({
    icon: Icon = FileX,
    title,
    description,
    actionLabel,
    onAction,
}: EmptyStateProps) {
    return (
        <View className="items-center justify-center py-12 px-6">
            <View className="w-20 h-20 bg-gray-100 rounded-full items-center justify-center mb-4">
                <Icon size={40} color="#9CA3AF" />
            </View>
            <Text className="text-gray-900 font-bold text-lg text-center mb-2">
                {title}
            </Text>
            {description && (
                <Text className="text-gray-500 text-center mb-6 leading-relaxed">
                    {description}
                </Text>
            )}
            {actionLabel && onAction && (
                <Button variant="primary" size="md" onPress={onAction}>
                    {actionLabel}
                </Button>
            )}
        </View>
    );
}
