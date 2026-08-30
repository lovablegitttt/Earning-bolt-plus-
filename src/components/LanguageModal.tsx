import React from 'react';
import { Globe, Check, X } from 'lucide-react';
import { triggerHaptic } from '../lib/telegram';

interface LanguageModalProps {
  isOpen: boolean;
  currentLanguage: string;
  onSelectLanguage: (lang: string) => void;
  onClose: () => void;
}

const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'ru', name: 'Русский (Russian)', flag: '🇷🇺' },
  { code: 'es', name: 'Español (Spanish)', flag: '🇪🇸' },
  { code: 'uz', name: 'Oʻzbek (Uzbek)', flag: '🇺🇿' },
  { code: 'hi', name: 'हिन्दी (Hindi)', flag: '🇮🇳' },
  { code: 'id', name: 'Bahasa Indonesia', flag: '🇮🇩' },
  { code: 'ar', name: 'العربية (Arabic)', flag: '🇸🇦' },
];

export const LanguageModal: React.FC<LanguageModalProps> = ({
  isOpen,
  currentLanguage,
  onSelectLanguage,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm rounded-3xl bg-white border border-neutral-200 shadow-2xl p-5 text-neutral-900">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-100 mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <Globe className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-neutral-900 leading-tight">
                Select Language
              </h3>
              <p className="text-[10px] text-neutral-500">Choose your preferred language</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center text-neutral-500"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
          {LANGUAGES.map((lang) => {
            const isSelected = currentLanguage === lang.name || currentLanguage === lang.name.split(' ')[0];
            return (
              <button
                key={lang.code}
                onClick={() => {
                  triggerHaptic('light');
                  onSelectLanguage(lang.name.split(' ')[0]);
                  onClose();
                }}
                className={`w-full flex items-center justify-between p-3 rounded-2xl border text-xs font-semibold transition-all ${
                  isSelected
                    ? 'border-amber-400 bg-amber-50/60 text-amber-900'
                    : 'border-neutral-100 bg-neutral-50/50 hover:bg-neutral-100 text-neutral-700'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-base">{lang.flag}</span>
                  <span>{lang.name}</span>
                </div>
                {isSelected && <Check className="w-4 h-4 text-amber-600 font-bold" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
