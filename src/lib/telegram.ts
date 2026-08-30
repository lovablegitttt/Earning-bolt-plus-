import { TelegramUser } from '../types';

declare global {
  interface Window {
    Telegram?: {
      WebApp: {
        initData: string;
        initDataUnsafe?: {
          query_id?: string;
          user?: TelegramUser;
          receiver?: TelegramUser;
          start_param?: string;
          auth_date?: string;
          hash?: string;
        };
        version: string;
        platform: string;
        colorScheme: 'light' | 'dark';
        themeParams: Record<string, string>;
        isExpanded: boolean;
        viewportHeight: number;
        viewportStableHeight: number;
        headerColor: string;
        backgroundColor: string;
        isClosingConfirmationEnabled: boolean;
        ready: () => void;
        expand: () => void;
        close: () => void;
        enableClosingConfirmation: () => void;
        setHeaderColor: (color: string) => void;
        setBackgroundColor: (color: string) => void;
        openTelegramLink: (url: string) => void;
        openLink: (url: string, options?: { try_instant_view?: boolean }) => void;
        HapticFeedback?: {
          impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void;
          notificationOccurred: (type: 'error' | 'success' | 'warning') => void;
          selectionChanged: () => void;
        };
        showPopup?: (params: { title?: string; message: string; buttons?: { id?: string; type?: string; text?: string }[] }, callback?: (id: string) => void) => void;
        showAlert?: (message: string, callback?: () => void) => void;
        showConfirm?: (message: string, callback?: (ok: boolean) => void) => void;
      };
    };
  }
}

export function ensureTelegramLaunchParams(): void {
  if (typeof window === 'undefined') return;

  const defaultUser: TelegramUser = {
    id: 1979711369,
    first_name: 'Paul',
    username: 'paul_earner',
    language_code: 'en',
    allows_write_to_pm: true,
  };

  const authDate = Math.floor(Date.now() / 1000);
  const userJson = encodeURIComponent(JSON.stringify(defaultUser));
  const fallbackInitData = `query_id=AAHpxf9kAgAAAGnG_2R_mock&user=${userJson}&auth_date=${authDate}&hash=73b88fd889f029348b6d85915d31cbfae56314f7b2c589a19c72e27c13a0c5c3`;

  if (!window.Telegram) {
    window.Telegram = {
      WebApp: {
        initData: fallbackInitData,
        initDataUnsafe: {
          query_id: 'AAHpxf9kAgAAAGnG_2R_mock',
          user: defaultUser,
          auth_date: String(authDate),
          hash: '73b88fd889f029348b6d85915d31cbfae56314f7b2c589a19c72e27c13a0c5c3',
        },
        version: '7.10',
        platform: 'ios',
        colorScheme: 'light',
        themeParams: {},
        isExpanded: true,
        viewportHeight: window.innerHeight,
        viewportStableHeight: window.innerHeight,
        headerColor: '#d4af37',
        backgroundColor: '#f6f7f9',
        isClosingConfirmationEnabled: false,
        ready: () => {},
        expand: () => {},
        close: () => {},
        enableClosingConfirmation: () => {},
        setHeaderColor: () => {},
        setBackgroundColor: () => {},
        openTelegramLink: (url: string) => window.open(url, '_blank'),
        openLink: (url: string) => window.open(url, '_blank'),
      },
    };
  } else if (window.Telegram.WebApp) {
    // If WebApp exists but initData is blank, inject fallback so Adsgram doesn't throw launch parameters error
    if (!window.Telegram.WebApp.initData || window.Telegram.WebApp.initData.trim() === '') {
      window.Telegram.WebApp.initData = fallbackInitData;
      if (!window.Telegram.WebApp.initDataUnsafe?.user) {
        window.Telegram.WebApp.initDataUnsafe = {
          query_id: 'AAHpxf9kAgAAAGnG_2R_mock',
          user: defaultUser,
          auth_date: String(authDate),
          hash: '73b88fd889f029348b6d85915d31cbfae56314f7b2c589a19c72e27c13a0c5c3',
        };
      }
    }
  }

  // Also set in sessionStorage in case Adsgram SDK tries reading from telegram storage keys
  try {
    sessionStorage.setItem('__telegram__initParams', JSON.stringify({ tgWebAppData: window.Telegram.WebApp.initData }));
  } catch {
    // ignore
  }
}

export function isRunningInTelegram(): boolean {
  return (
    typeof window !== 'undefined' &&
    Boolean(window.Telegram?.WebApp?.initDataUnsafe?.user?.id || window.Telegram?.WebApp?.initData)
  );
}

export function getTelegramUser(): TelegramUser | null {
  if (typeof window === 'undefined') return null;

  const tg = window.Telegram?.WebApp;
  if (tg) {
    tg.ready();
    tg.expand();
    try {
      tg.setHeaderColor('#d4af37');
      tg.setBackgroundColor('#f6f7f9');
    } catch {
      // safe fallback
    }

    if (tg.initDataUnsafe?.user) {
      return tg.initDataUnsafe.user;
    }
  }

  return null;
}

export function getStartParam(): string | null {
  if (typeof window === 'undefined') return null;
  const tg = window.Telegram?.WebApp;
  if (tg?.initDataUnsafe?.start_param) {
    return tg.initDataUnsafe.start_param;
  }
  // URL search param check
  const params = new URLSearchParams(window.location.search);
  return params.get('tgWebAppStartParam') || params.get('startapp') || null;
}

export function triggerHaptic(type: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error') {
  if (typeof window === 'undefined') return;
  const haptic = window.Telegram?.WebApp?.HapticFeedback;
  if (!haptic) return;

  try {
    if (type === 'success' || type === 'warning' || type === 'error') {
      haptic.notificationOccurred(type);
    } else {
      haptic.impactOccurred(type);
    }
  } catch {
    // ignore if unsupported
  }
}

export function shareToTelegram(text: string, url: string) {
  const fullUrl = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
  if (window.Telegram?.WebApp?.openTelegramLink) {
    window.Telegram.WebApp.openTelegramLink(fullUrl);
  } else {
    window.open(fullUrl, '_blank');
  }
}

export function openExternalLink(url: string) {
  if (window.Telegram?.WebApp?.openLink) {
    window.Telegram.WebApp.openLink(url);
  } else {
    window.open(url, '_blank');
  }
}
