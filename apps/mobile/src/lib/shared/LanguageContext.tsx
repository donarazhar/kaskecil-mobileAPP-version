import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import {
    loadSavedLanguage,
    changeLanguage as i18nChangeLanguage,
    getCurrentLanguage,
    LANGUAGES,
    type LanguageCode
} from '@/i18n';

interface LanguageContextType {
    language: LanguageCode;
    languageInfo: typeof LANGUAGES[number];
    changeLanguage: (code: LanguageCode) => Promise<void>;
    isChanging: boolean;
    t: (key: string, options?: object) => string;
    languages: typeof LANGUAGES;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
    children: ReactNode;
}

export function LanguageProvider({ children }: LanguageProviderProps) {
    const { t, i18n } = useTranslation();
    const [language, setLanguage] = useState<LanguageCode>('id');
    const [isChanging, setIsChanging] = useState(false);

    // Load saved language on mount
    useEffect(() => {
        const initLanguage = async () => {
            const savedLang = await loadSavedLanguage();
            if (savedLang !== language) {
                await i18n.changeLanguage(savedLang);
                setLanguage(savedLang);
            }
        };
        initLanguage();
    }, []);

    const changeLanguage = useCallback(async (code: LanguageCode) => {
        if (code === language || isChanging) return;

        setIsChanging(true);
        try {
            await i18nChangeLanguage(code);
            setLanguage(code);
        } catch (error) {
            console.error('Failed to change language:', error);
        } finally {
            setIsChanging(false);
        }
    }, [language, isChanging]);

    const value: LanguageContextType = {
        language,
        languageInfo: getCurrentLanguage(),
        changeLanguage,
        isChanging,
        t,
        languages: LANGUAGES,
    };

    return (
        <LanguageContext.Provider value={value}>
            {children}
        </LanguageContext.Provider>
    );
}

/**
 * Hook to access language context
 * @returns LanguageContextType
 */
export function useLanguage(): LanguageContextType {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
}

export default LanguageContext;
