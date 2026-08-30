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
