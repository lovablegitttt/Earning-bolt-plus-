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
  debugBannerType?: 'RewardedVideo' | 'FullscreenMedia' | 'RewardTask' | 'AdsgramFullscreen' | 'AdsgramInline';
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
const STORAGE_TASK_BLOCK_KEY = 'bolt_adsgram_task_block_id';
const STORAGE_DEBUG_KEY = 'bolt_adsgram_debug_mode';

// User's configured Adsgram block IDs
export const DEFAULT_ADSGRAM_BLOCK_ID = 'int-45220';
export const DEFAULT_ADSGRAM_TASK_BLOCK_ID = 'task-45229';

export const ADSGRAM_BLOCK_PRESETS = [
  { id: 'int-45220', label: 'Video Ads (int-45220)', type: 'video' as const, reward: 0.30 },
  { id: 'task-45229', label: 'Reward Tasks (task-45229)', type: 'task' as const, reward: 0.50 },
];

function getInitialBlockId(): string {
  if (typeof window === 'undefined') return DEFAULT_ADSGRAM_BLOCK_ID;
  const stored = localStorage.getItem(STORAGE_BLOCK_KEY);
  if (!stored || stored === 'int-5441' || stored === '1234') {
    localStorage.setItem(STORAGE_BLOCK_KEY, DEFAULT_ADSGRAM_BLOCK_ID);
    return DEFAULT_ADSGRAM_BLOCK_ID;
  }
  return stored;
}

function getInitialTaskBlockId(): string {
  if (typeof window === 'undefined') return DEFAULT_ADSGRAM_TASK_BLOCK_ID;
  const stored = localStorage.getItem(STORAGE_TASK_BLOCK_KEY);
  if (!stored) {
    localStorage.setItem(STORAGE_TASK_BLOCK_KEY, DEFAULT_ADSGRAM_TASK_BLOCK_ID);
    return DEFAULT_ADSGRAM_TASK_BLOCK_ID;
  }
  return stored;
}

export function formatAdsgramError(err: unknown, blockId?: string): string {
  if (!err) return 'Playback canceled or no inventory';
  if (typeof err === 'string') return err;
  if (err instanceof Error) return err.message;
  if (typeof err === 'object') {
    const record = err as Record<string, unknown>;
    if (record.description && typeof record.description === 'string') {
      return record.description;
    }
    if (record.message && typeof record.message === 'string') {
      return record.message;
    }
    if (record.state && typeof record.state === 'string') {
      return `Adsgram state: ${record.state}`;
    }
    try {
      const json = JSON.stringify(err);
      if (json !== '{}') return json;
    } catch {
      // ignore
    }
  }
  return `No live fill currently on block ${blockId || 'int-45220 / task-45229'}`;
}

export class AdsgramService {
  private static blockId: string = getInitialBlockId();
  private static taskBlockId: string = getInitialTaskBlockId();

  private static debugMode: boolean =
    typeof window !== 'undefined' && localStorage.getItem(STORAGE_DEBUG_KEY) !== null
      ? localStorage.getItem(STORAGE_DEBUG_KEY) === 'true'
      : false;

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

  public static getTaskBlockId(): string {
    return this.taskBlockId;
  }

  public static setTaskBlockId(id: string) {
    this.taskBlockId = id.trim() || DEFAULT_ADSGRAM_TASK_BLOCK_ID;
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_TASK_BLOCK_KEY, this.taskBlockId);
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
    onProgress?: (state: string) => void,
    customBlockId?: string
  ): Promise<{ success: boolean; realAdsgram: boolean; error?: string }> {
    return this.showAdOrTask(customBlockId || this.blockId, onReward, onError, onProgress);
  }

  public static async showRewardTask(
    onReward: () => void,
    onError?: (msg: string) => void,
    onProgress?: (state: string) => void,
    customTaskBlockId?: string
  ): Promise<{ success: boolean; realAdsgram: boolean; error?: string }> {
    return this.showAdOrTask(customTaskBlockId || this.taskBlockId, onReward, onError, onProgress);
  }

  public static async showAdOrTask(
    targetBlockId: string,
    onReward: () => void,
    onError?: (msg: string) => void,
    onProgress?: (state: string) => void
  ): Promise<{ success: boolean; realAdsgram: boolean; error?: string }> {
    if (typeof window === 'undefined') {
      return { success: false, realAdsgram: false, error: 'Window not available' };
    }

    const loaded = await this.ensureScriptLoaded();

    if (window.Adsgram) {
      try {
        const isTaskBlock = targetBlockId.startsWith('task-') || targetBlockId.includes('task');
        const bannerType = isTaskBlock ? ('RewardTask' as const) : ('RewardedVideo' as const);

        this.lastLog = `Requesting Adsgram with blockId: "${targetBlockId}", isTask: ${isTaskBlock}, debug: ${this.debugMode}...`;
        console.log(this.lastLog);

        const controller = window.Adsgram.init({
          blockId: targetBlockId,
          debug: this.debugMode,
          ...(this.debugMode ? { debugBannerType: bannerType } : {}),
        });

        onProgress?.(isTaskBlock ? 'Adsgram task loading...' : 'Adsgram ad loading...');
        const result = await controller.show();
        this.lastLog = `Adsgram result (${targetBlockId}): done=${result.done}, state=${result.state}, desc="${result.description}"`;
        console.log(this.lastLog);

        if (result.done) {
          onReward();
          return { success: true, realAdsgram: true };
        } else {
          const errDesc = result.description || 'Closed or skipped before completion';
          onError?.(errDesc);
          return { success: false, realAdsgram: true, error: errDesc };
        }
      } catch (err: unknown) {
        const errorString = formatAdsgramError(err, targetBlockId);
        this.lastLog = `Adsgram API exception on ${targetBlockId}: ${errorString}`;
        console.warn(this.lastLog);
        onError?.(errorString);
        return { success: false, realAdsgram: true, error: errorString };
      }
    }

    this.lastLog = 'Adsgram SDK script not available on window';
    const msg = 'Adsgram script is initializing, please tap again in a moment.';
    onError?.(msg);
    return { success: false, realAdsgram: false, error: msg };
  }
}

