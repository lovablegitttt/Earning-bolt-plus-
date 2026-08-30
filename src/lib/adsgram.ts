import { ensureTelegramLaunchParams } from './telegram';

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
export const DEFAULT_ADSGRAM_TASK_BLOCK_ID = '45229';

export const ADSGRAM_BLOCK_PRESETS = [
  { id: 'int-45220', label: 'Video Ads (int-45220)', type: 'video' as const, reward: 0.30 },
  { id: '45229', label: 'Tasks (45229)', type: 'task' as const, reward: 0.50 },
];

/**
 * Sanitizes any block ID into what Adsgram's SDK strictly requires:
 * Must be pure numeric string (e.g. "45229") or start with "int-" followed by digits (e.g. "int-45220")
 */
export function sanitizeAdsgramBlockId(rawId: string): string {
  if (!rawId) return DEFAULT_ADSGRAM_BLOCK_ID;
  const trimmed = rawId.trim();

  // Valid int-XXXX format
  if (/^int-\d+$/.test(trimmed)) {
    return trimmed;
  }

  // Pure numeric string e.g. "45229"
  if (/^\d+$/.test(trimmed)) {
    return trimmed;
  }

  // If passed with prefix like task-45229 or banner-45229, extract the digits
  const match = trimmed.match(/\d+/);
  if (match) {
    return match[0];
  }

  return DEFAULT_ADSGRAM_BLOCK_ID;
}

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
  let message = '';
  if (typeof err === 'string') {
    message = err;
  } else if (err instanceof Error) {
    message = err.message;
  } else if (typeof err === 'object') {
    const record = err as Record<string, unknown>;
    if (record.description && typeof record.description === 'string') {
      message = record.description;
    } else if (record.message && typeof record.message === 'string') {
      message = record.message;
    } else if (record.state && typeof record.state === 'string') {
      message = `Adsgram state: ${record.state}`;
    } else {
      try {
        const json = JSON.stringify(err);
        if (json !== '{}') message = json;
      } catch {
        // ignore
      }
    }
  }

  if (!message) {
    message = `No live fill currently on block ${blockId || 'int-45220 / 45229'}`;
  }

  if (message.toLowerCase().includes('launch parameters') || message.toLowerCase().includes('telegram environment')) {
    return 'Please open via Telegram Bot (@Boltearningbdngbot) or enable Test Mode to view ads.';
  }

  return message;
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

    ensureTelegramLaunchParams();
    await this.ensureScriptLoaded();

    if (window.Adsgram) {
      const sanitizedBlock = sanitizeAdsgramBlockId(targetBlockId);
      const isTaskBlock = targetBlockId.startsWith('task-') || targetBlockId.includes('task') || sanitizedBlock === '45229';

      try {
        this.lastLog = `Requesting Adsgram with blockId: "${sanitizedBlock}" (original: "${targetBlockId}"), debug: ${this.debugMode}...`;
        console.log(this.lastLog);

        let controller = window.Adsgram.init({
          blockId: sanitizedBlock,
          debug: this.debugMode,
        });

        onProgress?.(isTaskBlock ? 'Adsgram task loading...' : 'Adsgram ad loading...');
        
        let result: ShowPromiseResult;
        try {
          result = await controller.show();
        } catch (initialErr: unknown) {
          const errMsg = String(initialErr);
          // If launch params missing outside of Telegram environment, retry with debug mode enabled
          if (errMsg.includes('launch parameters') && !this.debugMode) {
            console.log('Retrying Adsgram with debug: true for browser testing environment...');
            controller = window.Adsgram.init({
              blockId: sanitizedBlock,
              debug: true,
            });
            result = await controller.show();
          } else {
            throw initialErr;
          }
        }

        this.lastLog = `Adsgram result (${sanitizedBlock}): done=${result.done}, state=${result.state}, desc="${result.description}"`;
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

