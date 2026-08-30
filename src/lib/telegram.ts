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
    try {
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
    } catch {
      // ignore if window.Telegram is read-only
    }
  } else if (window.Telegram?.WebApp) {
    // Note: window.Telegram.WebApp.initData is a read-only getter in Telegram's real SDK (telegram-web-app.js)
    // Never do direct assignment like window.Telegram.WebApp.initData = ... as it throws "Attempted to assign to readonly property"
    try {
      const tgWebApp = window.Telegram.WebApp;
      if (!tgWebApp.initData) {
        Object.defineProperty(tgWebApp, 'initData', {
          value: fallbackInitData,
          writable: true,
          configurable: true,
        });
      }
      if (!tgWebApp.initDataUnsafe?.user) {
        Object.defineProperty(tgWebApp, 'initDataUnsafe', {
          value: {
            query_id: 'AAHpxf9kAgAAAGnG_2R_mock',
            user: defaultUser,
            auth_date: String(authDate),
            hash: '73b88fd889f029348b6d85915d31cbfae56314f7b2c589a19c72e27c13a0c5c3',
          },
          writable: true,
          configurable: true,
        });
      }
    } catch {
      // ignore if getters cannot be overridden
    }
  }

  // Also set in sessionStorage so Adsgram SDK can read launch parameters from any known storage provider
  try {
    const rawData = window.Telegram?.WebApp?.initData || fallbackInitData;
    const launchObj = {
      tgWebAppData: rawData,
      tgWebAppPlatform: window.Telegram?.WebApp?.platform || 'ios',
      tgWebAppVersion: window.Telegram?.WebApp?.version || '7.10',
      tgWebAppThemeParams: JSON.stringify({ bg_color: '#f6f7f9' }),
    };
    const jsonStr = JSON.stringify(launchObj);
    sessionStorage.setItem('__telegram__initParams', jsonStr);
    sessionStorage.setItem('telegram-apps/launch-params', jsonStr);
    sessionStorage.setItem('adsgram/launch-params', jsonStr);
    sessionStorage.setItem('tma.js/launch-params', jsonStr);
    sessionStorage.setItem('tapps/launchParams', jsonStr);
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
