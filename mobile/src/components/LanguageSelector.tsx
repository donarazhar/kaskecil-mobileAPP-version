import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, Pressable } from 'react-native';
import { Check, Globe, X } from 'lucide-react-native';
import { useLanguage } from '@/lib/shared/LanguageContext';
import { LANGUAGES, type LanguageCode } from '@/i18n';

interface LanguageSelectorProps {
    /** Style variant */
    variant?: 'button' | 'menu-item';
}

export default function LanguageSelector({ variant = 'button' }: LanguageSelectorProps) {
    const { language, changeLanguage, isChanging, t, languageInfo } = useLanguage();
    const [modalVisible, setModalVisible] = useState(false);

    const handleSelectLanguage = async (code: LanguageCode) => {
        await changeLanguage(code);
        setModalVisible(false);
    };

    // Menu item style (for MenuScreen)
    if (variant === 'menu-item') {
        return (
            <>
                <TouchableOpacity
                    className="flex-row items-center px-4 py-4 bg-white"
                    onPress={() => setModalVisible(true)}
                    activeOpacity={0.7}
                >
                    <View className="w-11 h-11 rounded-2xl items-center justify-center mr-4 bg-purple-100">
                        <Globe size={20} color="#7C3AED" />
                    </View>
                    <View className="flex-1">
                        <Text className="text-base font-semibold text-gray-800">
                            {t('menu.language')}
                        </Text>
                        <Text className="text-xs text-gray-400 mt-0.5">
                            {languageInfo.flag} {languageInfo.nativeName}
                        </Text>
                    </View>
                    <Text className="text-gray-400 text-sm mr-2">{languageInfo.flag}</Text>
                </TouchableOpacity>

                <LanguageModal
                    visible={modalVisible}
                    onClose={() => setModalVisible(false)}
                    currentLanguage={language}
                    onSelect={handleSelectLanguage}
                    isChanging={isChanging}
                    t={t}
                />
            </>
        );
    }

    // Button style (for Settings or standalone)
    return (
        <>
            <TouchableOpacity
                className="flex-row items-center bg-gray-100 px-4 py-3 rounded-xl"
                onPress={() => setModalVisible(true)}
                activeOpacity={0.7}
            >
                <Globe size={18} color="#4B5563" />
                <Text className="text-gray-700 font-medium ml-2">
                    {languageInfo.flag} {languageInfo.nativeName}
                </Text>
            </TouchableOpacity>

            <LanguageModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                currentLanguage={language}
                onSelect={handleSelectLanguage}
                isChanging={isChanging}
                t={t}
            />
        </>
    );
}

interface LanguageModalProps {
    visible: boolean;
    onClose: () => void;
    currentLanguage: LanguageCode;
    onSelect: (code: LanguageCode) => void;
    isChanging: boolean;
    t: (key: string) => string;
}

function LanguageModal({ visible, onClose, currentLanguage, onSelect, isChanging, t }: LanguageModalProps) {
    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <Pressable
                className="flex-1 bg-black/50 justify-end"
                onPress={onClose}
            >
                <Pressable
                    className="bg-white rounded-t-3xl"
                    onPress={e => e.stopPropagation()}
                >
                    {/* Header */}
                    <View className="flex-row items-center justify-between px-5 py-4 border-b border-gray-100">
                        <Text className="text-lg font-bold text-gray-900">
                            {t('menu.language')}
                        </Text>
                        <TouchableOpacity
                            onPress={onClose}
                            className="w-8 h-8 bg-gray-100 rounded-full items-center justify-center"
                        >
                            <X size={18} color="#6B7280" />
                        </TouchableOpacity>
                    </View>

                    {/* Language Options */}
                    <View className="p-4">
                        {LANGUAGES.map((lang) => (
                            <TouchableOpacity
                                key={lang.code}
                                className={`flex-row items-center p-4 rounded-2xl mb-2 ${currentLanguage === lang.code
                                        ? 'bg-blue-50 border-2 border-blue-500'
                                        : 'bg-gray-50 border-2 border-transparent'
                                    }`}
                                onPress={() => onSelect(lang.code)}
                                disabled={isChanging}
                                activeOpacity={0.7}
                            >
                                <Text className="text-3xl mr-4">{lang.flag}</Text>
                                <View className="flex-1">
                                    <Text className={`text-base font-semibold ${currentLanguage === lang.code ? 'text-blue-700' : 'text-gray-800'
                                        }`}>
                                        {lang.nativeName}
                                    </Text>
                                    <Text className="text-sm text-gray-500">{lang.name}</Text>
                                </View>
                                {currentLanguage === lang.code && (
                                    <View className="w-8 h-8 bg-blue-500 rounded-full items-center justify-center">
                                        <Check size={18} color="white" />
                                    </View>
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Note for RTL */}
                    <View className="px-4 pb-8">
                        <Text className="text-xs text-gray-400 text-center">
                            * Perubahan bahasa Arab memerlukan restart aplikasi untuk layout RTL penuh
                        </Text>
                    </View>
                </Pressable>
            </Pressable>
        </Modal>
    );
}
