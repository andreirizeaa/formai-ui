import React, { createContext, useContext, useState, ReactNode } from 'react';
import i18n from '../utils/i18n';

interface LanguageContextType {
  currentLanguage: string;
  setLanguage: (languageCode: string) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: ReactNode;
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [currentLanguage, setCurrentLanguage] = useState(i18n.locale);

  const setLanguage = (languageCode: string) => {
    i18n.locale = languageCode;
    setCurrentLanguage(languageCode);
  };

  return (
    <LanguageContext.Provider value={{ currentLanguage, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
} 