import React from 'react';
import { View, Text, TextInput, TextInputProps } from 'react-native';
import clsx from 'clsx';
import { LucideIcon } from 'lucide-react-native';

interface InputProps extends TextInputProps {
    label?: string;
    error?: string;
    hint?: string;
    leftIcon?: LucideIcon;
    rightIcon?: LucideIcon;
    onRightIconPress?: () => void;
}

export function Input({
    label,
    error,
    hint,
    leftIcon: LeftIcon,
    rightIcon: RightIcon,
    onRightIconPress,
    className,
    editable = true,
    ...props
}: InputProps) {
    const isDisabled = !editable;

    return (
        <View className="w-full">
            {label && (
                <Text className="text-gray-700 font-medium mb-2 ml-1">
                    {label}
                </Text>
            )}
            <View
                className={clsx(
                    'flex-row items-center rounded-xl px-4 py-3',
                    'border',
                    error
                        ? 'border-red-500 bg-red-50'
                        : 'border-gray-200 bg-gray-50',
                    isDisabled && 'opacity-60'
                )}
            >
                {LeftIcon && (
                    <LeftIcon
                        size={20}
                        color={error ? '#EF4444' : '#9CA3AF'}
                        style={{ marginRight: 12 }}
                    />
                )}
                <TextInput
                    {...props}
                    editable={editable}
                    className={clsx('flex-1 text-gray-900', className)}
                    placeholderTextColor="#9CA3AF"
                />
                {RightIcon && (
                    <RightIcon
                        size={20}
                        color="#6B7280"
                        onPress={onRightIconPress}
                        style={{ marginLeft: 12 }}
                    />
                )}
            </View>
            {error && (
                <Text className="text-red-500 text-sm mt-1 ml-1">{error}</Text>
            )}
            {hint && !error && (
                <Text className="text-gray-400 text-sm mt-1 ml-1">{hint}</Text>
            )}
        </View>
    );
}
