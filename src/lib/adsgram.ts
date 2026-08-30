export interface ShowPromiseResult {
  done: boolean;
  description: string;
  state: 'load' | 'render' | 'playing' | 'destroy';
  error: boolean;
}

export interface AdsgramController {
  show: () => Promise<ShowPromiseResult>;
  addEventListener?: (event: string, callback: (data: unknown) => void) => void;
}

export interface AdsgramInitParams {
  blockId: string;
  debug?: boolean;
  debugBannerType?: 'FullscreenMedia' | 'Rewarded';
  val?: string;
}

declare global {
  interface Window {
    Adsgram?: {
      init: (params: AdsgramInitParams) => AdsgramController;
    };
  }
}

const STORAGE_BLOCK_KEY = 'bolt_adsgram_block_id';
const STORAGE_DEBUG_KEY = 'bolt_adsgram_debug_mode';

// Standard Adsgram test block ID or customizable publisher ID
export const DEFAULT_ADSGRAM_BLOCK_ID = 'int-5441';

export class AdsgramService {
  private static blockId: string =
    (typeof window !== 'undefined' && localStorage.getItem(STORAGE_BLOCK_KEY)) ||
    DEFAULT_ADSGRAM_BLOCK_ID;

  private static debugMode: boolean =
    typeof window !== 'undefined'
      ? localStorage.getItem(STORAGE_DEBUG_KEY) !== 'false'
      : true;

  private static controller: AdsgramController | null = null;
  private static lastLog: string = 'Adsgram SDK initialized';

  public static getBlockId(): string {
    return this.blockId;
  }

  public static setBlockId(id: string) {
    this.blockId = id.trim() || DEFAULT_ADSGRAM_BLOCK_ID;
    this.controller = null;
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_BLOCK_KEY, this.blockId);
    }
  }

  public static isDebugMode(): boolean {
    return this.debugMode;
  }

  public static setDebugMode(debug: boolean) {
    this.debugMode = debug;
    this.controller = null;
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_DEBUG_KEY, String(debug));
    }
  }

  public static getLastLog(): string {
    return this.lastLog;
  }

  public static isAdsgramAvailable(): boolean {
    return typeof window !== 'undefined' && Boolean(window.Adsgram);
  }

  public static ensureScriptLoaded(): Promise<boolean> {
    if (typeof window === 'undefined') return Promise.resolve(false);
    if (window.Adsgram) return Promise.resolve(true);

    return new Promise((resolve) => {
      const existingScript = document.querySelector('script[src*="adsgram.ai"]');
      if (existingScript) {
        existingScript.addEventListener('load', () => resolve(Boolean(window.Adsgram)));
        existingScript.addEventListener('error', () => resolve(false));
        // Check if already loaded
        if (window.Adsgram) return resolve(true);
      }

      const script = document.createElement('script');
      script.src = 'https://sad.adsgram.ai/js/sad.min.js';
      script.async = true;
      script.onload = () => resolve(Boolean(window.Adsgram));
      script.onerror = () => resolve(false);
      document.head.appendChild(script);
    });
  }

  public static async showRewardedAd(
    onReward: () => void,
    onError?: (msg: string) => void,
    onProgress?: (state: string) => void
  ): Promise<{ success: boolean; realAdsgram: boolean; error?: string }> {
    if (typeof window === 'undefined') {
      return { success: false, realAdsgram: false, error: 'Window not available' };
    }

    await this.ensureScriptLoaded();

    if (window.Adsgram) {
      try {
        this.lastLog = `Requesting Adsgram with blockId: "${this.blockId}", debug: ${this.debugMode}...`;
        console.log(this.lastLog);

        const controller = window.Adsgram.init({
          blockId: this.blockId,
          debug: this.debugMode,
          debugBannerType: 'Rewarded',
        });

        onProgress?.('Adsgram ad loading...');
        const result = await controller.show();
        this.lastLog = `Adsgram result: done=${result.done}, state=${result.state}, desc="${result.description}"`;
        console.log(this.lastLog);

        if (result.done) {
          onReward();
          return { success: true, realAdsgram: true };
        } else {
          const errDesc = result.description || 'Ad skipped or closed before completion';
          onError?.(errDesc);
          return { success: false, realAdsgram: true, error: errDesc };
        }
      } catch (err: unknown) {
        const errorString = err instanceof Error ? err.message : String(err);
        this.lastLog = `Adsgram API exception: ${errorString}`;
        console.warn(this.lastLog);
        onError?.(errorString);
        return { success: false, realAdsgram: true, error: errorString };
      }
    }

    this.lastLog = 'Adsgram SDK script not available on window';
    return { success: false, realAdsgram: false, error: 'Adsgram script not loaded' };
  }
}

