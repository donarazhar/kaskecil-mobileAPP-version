import React from 'react';
import { View, ViewProps } from 'react-native';
import clsx from 'clsx';

interface CardProps extends ViewProps {
    variant?: 'default' | 'elevated' | 'outlined';
    padding?: 'none' | 'sm' | 'md' | 'lg';
    children: React.ReactNode;
}

const variantStyles = {
    default: 'bg-white rounded-2xl shadow-sm border border-gray-100',
    elevated: 'bg-white rounded-2xl shadow-lg',
    outlined: 'bg-white rounded-2xl border-2 border-gray-200',
};

const paddingStyles = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
};

export function Card({
    variant = 'default',
    padding = 'md',
    children,
    className,
    ...props
}: CardProps) {
    return (
        <View
            {...props}
            className={clsx(
                variantStyles[variant],
                paddingStyles[padding],
                className
            )}
        >
            {children}
        </View>
    );
}

interface CardHeaderProps extends ViewProps {
    children: React.ReactNode;
}

export function CardHeader({ children, className, ...props }: CardHeaderProps) {
    return (
        <View
            {...props}
            className={clsx('pb-4 border-b border-gray-100 mb-4', className)}
        >
            {children}
        </View>
    );
}

interface CardFooterProps extends ViewProps {
    children: React.ReactNode;
}

export function CardFooter({ children, className, ...props }: CardFooterProps) {
    return (
        <View
            {...props}
            className={clsx('pt-4 border-t border-gray-100 mt-4', className)}
        >
            {children}
        </View>
    );
}
