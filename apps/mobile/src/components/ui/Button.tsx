import React from 'react';
import {
    TouchableOpacity,
    Text,
    ActivityIndicator,
    View,
    TouchableOpacityProps
} from 'react-native';
import clsx from 'clsx';
import { LucideIcon } from 'lucide-react-native';

interface ButtonProps extends TouchableOpacityProps {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    loading?: boolean;
    disabled?: boolean;
    leftIcon?: LucideIcon;
    rightIcon?: LucideIcon;
    children: React.ReactNode;
}

const variantStyles = {
    primary: {
        container: 'bg-blue-600 shadow-lg shadow-blue-200',
        text: 'text-white',
        iconColor: '#ffffff',
    },
    secondary: {
        container: 'bg-gray-100',
        text: 'text-gray-900',
        iconColor: '#1F2937',
    },
    outline: {
        container: 'bg-transparent border-2 border-blue-600',
        text: 'text-blue-600',
        iconColor: '#2563EB',
    },
    ghost: {
        container: 'bg-transparent',
        text: 'text-gray-700',
        iconColor: '#374151',
    },
    danger: {
        container: 'bg-red-500 shadow-lg shadow-red-200',
        text: 'text-white',
        iconColor: '#ffffff',
    },
};

const sizeStyles = {
    sm: {
        container: 'px-4 py-2 rounded-lg',
        text: 'text-sm',
        iconSize: 16,
    },
    md: {
        container: 'px-6 py-3 rounded-xl',
        text: 'text-base',
        iconSize: 20,
    },
    lg: {
        container: 'px-8 py-4 rounded-xl',
        text: 'text-lg',
        iconSize: 24,
    },
};

export function Button({
    variant = 'primary',
    size = 'md',
    loading = false,
    disabled = false,
    leftIcon: LeftIcon,
    rightIcon: RightIcon,
    children,
    className,
    ...props
}: ButtonProps) {
    const variantStyle = variantStyles[variant];
    const sizeStyle = sizeStyles[size];

    return (
        <TouchableOpacity
            {...props}
            disabled={disabled || loading}
            className={clsx(
                'flex-row items-center justify-center',
                variantStyle.container,
                sizeStyle.container,
                (disabled || loading) && 'opacity-50',
                className
            )}
        >
            {loading ? (
                <ActivityIndicator
                    color={variantStyle.iconColor}
                    size={size === 'sm' ? 'small' : 'small'}
                />
            ) : (
                <>
                    {LeftIcon && (
                        <View className="mr-2">
                            <LeftIcon
                                size={sizeStyle.iconSize}
                                color={variantStyle.iconColor}
                            />
                        </View>
                    )}
                    <Text
                        className={clsx(
                            'font-bold',
                            variantStyle.text,
                            sizeStyle.text
                        )}
                    >
                        {children}
                    </Text>
                    {RightIcon && (
                        <View className="ml-2">
                            <RightIcon
                                size={sizeStyle.iconSize}
                                color={variantStyle.iconColor}
                            />
                        </View>
                    )}
                </>
            )}
        </TouchableOpacity>
    );
}
