import React from 'react';
import { View, Text, ViewProps } from 'react-native';
import clsx from 'clsx';
import { LucideIcon } from 'lucide-react-native';

interface BadgeProps extends ViewProps {
    variant?: 'success' | 'warning' | 'error' | 'info' | 'default';
    size?: 'sm' | 'md';
    icon?: LucideIcon;
    children: React.ReactNode;
}

const variantStyles = {
    success: {
        container: 'bg-green-100',
        text: 'text-green-700',
        iconColor: '#15803D',
    },
    warning: {
        container: 'bg-yellow-100',
        text: 'text-yellow-700',
        iconColor: '#A16207',
    },
    error: {
        container: 'bg-red-100',
        text: 'text-red-700',
        iconColor: '#B91C1C',
    },
    info: {
        container: 'bg-blue-100',
        text: 'text-blue-700',
        iconColor: '#1D4ED8',
    },
    default: {
        container: 'bg-gray-100',
        text: 'text-gray-700',
        iconColor: '#374151',
    },
};

const sizeStyles = {
    sm: {
        container: 'px-2 py-0.5 rounded',
        text: 'text-xs',
        iconSize: 12,
    },
    md: {
        container: 'px-3 py-1 rounded-full',
        text: 'text-sm',
        iconSize: 14,
    },
};

export function Badge({
    variant = 'default',
    size = 'md',
    icon: Icon,
    children,
    className,
    ...props
}: BadgeProps) {
    const variantStyle = variantStyles[variant];
    const sizeStyle = sizeStyles[size];

    return (
        <View
            {...props}
            className={clsx(
                'flex-row items-center self-start',
                variantStyle.container,
                sizeStyle.container,
                className
            )}
        >
            {Icon && (
                <View className="mr-1">
                    <Icon size={sizeStyle.iconSize} color={variantStyle.iconColor} />
                </View>
            )}
            <Text
                className={clsx(
                    'font-medium',
                    variantStyle.text,
                    sizeStyle.text
                )}
            >
                {children}
            </Text>
        </View>
    );
}
