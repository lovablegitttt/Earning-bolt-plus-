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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm rounded-3xl ios-glass border border-white/80 shadow-[0_20px_50px_rgba(0,0,0,0.15)] p-5 text-neutral-900">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-100 mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Globe className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-neutral-900 leading-tight">
                Select Language
              </h3>
              <p className="text-[10px] text-neutral-500 font-medium">Choose your preferred language</p>
            </div>
          </div>
          <button
            onClick={() => {
              triggerHaptic('light');
              onClose();
            }}
            className="w-7 h-7 rounded-full bg-neutral-100/80 hover:bg-neutral-200 flex items-center justify-center text-neutral-500 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
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
                    ? 'border-blue-500 bg-blue-50/70 text-blue-900 shadow-2xs'
                    : 'border-neutral-100 bg-white/70 hover:bg-white text-neutral-700'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-base">{lang.flag}</span>
                  <span>{lang.name}</span>
                </div>
                {isSelected && <Check className="w-4 h-4 text-blue-600 font-bold" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
