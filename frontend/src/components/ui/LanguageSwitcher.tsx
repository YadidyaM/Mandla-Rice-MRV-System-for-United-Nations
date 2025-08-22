/**
 * Language Switcher Component
 */

import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { GlobeAltIcon, CheckIcon } from '@heroicons/react/24/outline';
import { cn } from '@/utils/cn';

const languages = [
  { code: 'hi', name: 'हिंदी', nativeName: 'हिंदी' },
  { code: 'en', name: 'English', nativeName: 'English' },
];

export const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  const changeLanguage = (languageCode: string) => {
    i18n.changeLanguage(languageCode);
    localStorage.setItem('language', languageCode);
    setIsOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 p-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        aria-label="Select language"
      >
        <GlobeAltIcon className="h-5 w-5" />
        <span className="text-sm font-medium hidden sm:block">
          {currentLanguage.nativeName}
        </span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 z-50">
          <div className="py-1">
            {languages.map((language) => (
              <button
                key={language.code}
                onClick={() => changeLanguage(language.code)}
                className={cn(
                  "w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center justify-between",
                  i18n.language === language.code
                    ? "bg-primary-50 dark:bg-primary-900 text-primary-700 dark:text-primary-300"
                    : "text-gray-700 dark:text-gray-300"
                )}
              >
                <div className="flex items-center space-x-3">
                  <span className="font-medium">{language.nativeName}</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {language.name}
                  </span>
                </div>
                {i18n.language === language.code && (
                  <CheckIcon className="h-4 w-4 text-primary-600 dark:text-primary-400" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
