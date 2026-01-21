/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./src/**/*.{js,jsx,ts,tsx}"],
    theme: {
        extend: {
            colors: {
                // Primary brand colors
                primary: {
                    50: '#EFF6FF',
                    100: '#DBEAFE',
                    200: '#BFDBFE',
                    300: '#93C5FD',
                    400: '#60A5FA',
                    500: '#3B82F6',
                    600: '#2563EB',
                    700: '#1D4ED8',
                    800: '#1E40AF',
                    900: '#1E3A8A',
                },
                // Secondary colors
                secondary: {
                    50: '#F8FAFC',
                    100: '#F1F5F9',
                    200: '#E2E8F0',
                    300: '#CBD5E1',
                    400: '#94A3B8',
                    500: '#64748B',
                    600: '#475569',
                    700: '#334155',
                    800: '#1E293B',
                    900: '#0F172A',
                },
                // Accent colors
                accent: {
                    orange: '#F59E0B',
                    teal: '#14B8A6',
                    purple: '#8B5CF6',
                    pink: '#EC4899',
                },
                // Status colors
                success: {
                    light: '#D1FAE5',
                    DEFAULT: '#10B981',
                    dark: '#059669',
                },
                warning: {
                    light: '#FEF3C7',
                    DEFAULT: '#F59E0B',
                    dark: '#D97706',
                },
                error: {
                    light: '#FEE2E2',
                    DEFAULT: '#EF4444',
                    dark: '#DC2626',
                },
            },
            fontFamily: {
                sans: ['System', '-apple-system', 'BlinkMacSystemFont', 'Roboto', 'sans-serif'],
            },
            borderRadius: {
                '2xl': '16px',
                '3xl': '24px',
                '4xl': '32px',
            },
            boxShadow: {
                'soft': '0 2px 8px rgba(0, 0, 0, 0.04)',
                'medium': '0 4px 12px rgba(0, 0, 0, 0.08)',
                'card': '0 2px 16px rgba(0, 0, 0, 0.06)',
            },
        },
    },
    plugins: [],
}
