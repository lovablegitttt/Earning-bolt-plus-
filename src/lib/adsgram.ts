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
export const DEFAULT_ADSGRAM_TASK_BLOCK_ID = 'task-45229';

export const ADSGRAM_BLOCK_PRESETS = [
  { id: 'int-45220', label: 'Video Ads (int-45220)', type: 'video' as const, reward: 0.30 },
  { id: 'task-45229', label: 'Reward Tasks (task-45229)', type: 'task' as const, reward: 0.50 },
];

/**
 * Formats video block ID: must start with 'int-' (e.g. 'int-45220') or be numeric
 */
export function formatVideoBlockId(rawId: string): string {
  if (!rawId) return DEFAULT_ADSGRAM_BLOCK_ID;
  const trimmed = rawId.trim();
  if (trimmed.startsWith('int-')) return trimmed;
  const match = trimmed.match(/\d+/);
  return match ? `int-${match[0]}` : DEFAULT_ADSGRAM_BLOCK_ID;
}

/**
 * Formats task block ID: must start with 'task-' (e.g. 'task-45229')
 */
export function formatTaskBlockId(rawId: string): string {
  if (!rawId) return DEFAULT_ADSGRAM_TASK_BLOCK_ID;
  const trimmed = rawId.trim();
  if (trimmed.startsWith('task-')) return trimmed;
  const match = trimmed.match(/\d+/);
  return match ? `task-${match[0]}` : DEFAULT_ADSGRAM_TASK_BLOCK_ID;
}

export function sanitizeAdsgramBlockId(rawId: string, isTask: boolean = false): string {
  return isTask ? formatTaskBlockId(rawId) : formatVideoBlockId(rawId);
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
    if (typeof window === 'undefined') {
      return { success: false, realAdsgram: false, error: 'Window not available' };
    }

    ensureTelegramLaunchParams();
    await this.ensureScriptLoaded();

    const targetBlockId = formatVideoBlockId(customBlockId || this.blockId);

    if (window.Adsgram) {
      try {
        this.lastLog = `Requesting Adsgram Video with blockId: "${targetBlockId}", debug: ${this.debugMode}...`;
        console.log(this.lastLog);

        let controller = window.Adsgram.init({
          blockId: targetBlockId,
          debug: this.debugMode,
        });

        onProgress?.('Adsgram ad loading...');
        
        let result: ShowPromiseResult;
        try {
          result = await controller.show();
        } catch (initialErr: unknown) {
          const errMsg = String(initialErr);
          if (errMsg.includes('launch parameters') && !this.debugMode) {
            console.log('Retrying Adsgram with debug: true for browser testing environment...');
            controller = window.Adsgram.init({
              blockId: targetBlockId,
              debug: true,
            });
            result = await controller.show();
          } else {
            throw initialErr;
          }
        }

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

  public static async showRewardTask(
    onReward: () => void,
    onError?: (msg: string) => void,
    onProgress?: (state: string) => void,
    customTaskBlockId?: string
  ): Promise<{ success: boolean; realAdsgram: boolean; error?: string }> {
    if (typeof window === 'undefined') {
      return { success: false, realAdsgram: false, error: 'Window not available' };
    }

    ensureTelegramLaunchParams();
    await this.ensureScriptLoaded();

    const targetBlockId = formatTaskBlockId(customTaskBlockId || this.taskBlockId);
    onProgress?.('Adsgram task initializing...');

    return new Promise((resolve) => {
      // Remove any prior task overlay
      const existing = document.getElementById('adsgram-task-modal-overlay');
      if (existing && existing.parentNode) {
        existing.parentNode.removeChild(existing);
      }

      const overlay = document.createElement('div');
      overlay.id = 'adsgram-task-modal-overlay';
      overlay.style.cssText = `
        position: fixed;
        inset: 0;
        z-index: 99999;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(0, 0, 0, 0.75);
        padding: 16px;
        backdrop-filter: blur(4px);
        animation: fadeIn 0.2s ease-out;
      `;

      const card = document.createElement('div');
      card.style.cssText = `
        background: #ffffff;
        border-radius: 24px;
        padding: 20px;
        max-width: 360px;
        width: 100%;
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.35);
        border: 2px solid #f59e0b;
      `;

      const header = document.createElement('div');
      header.style.cssText = 'display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;';
      header.innerHTML = `
        <div style="display: flex; align-items: center; gap: 8px;">
          <div style="width: 28px; height: 28px; border-radius: 8px; background: #fef3c7; display: flex; align-items: center; justify-content: center; font-weight: 900; color: #b45309; font-size: 14px;">⚡</div>
          <div style="font-weight: 800; font-size: 15px; color: #111827;">Adsgram Tasks</div>
        </div>
        <span style="font-size: 10px; font-family: monospace; background: #fef3c7; color: #92400e; padding: 2px 6px; border-radius: 6px; font-weight: 700;">${targetBlockId}</span>
      `;

      const taskContainer = document.createElement('div');
      taskContainer.style.cssText = 'min-height: 70px; margin: 12px 0; display: flex; flex-direction: column; justify-content: center;';

      const taskElement = document.createElement('adsgram-task');
      taskElement.setAttribute('data-block-id', targetBlockId);
      if (this.debugMode) {
        taskElement.setAttribute('data-debug', 'true');
      }

      const closeBtn = document.createElement('button');
      closeBtn.innerText = 'Close';
      closeBtn.style.cssText = `
        width: 100%;
        margin-top: 14px;
        padding: 11px;
        border-radius: 14px;
        background: #f3f4f6;
        color: #374151;
        font-weight: 700;
        font-size: 13px;
        border: none;
        cursor: pointer;
      `;

      let hasRewarded = false;

      const cleanup = () => {
        if (overlay.parentNode) {
          overlay.parentNode.removeChild(overlay);
        }
      };

      taskElement.addEventListener('reward', () => {
        if (!hasRewarded) {
          hasRewarded = true;
          cleanup();
          onReward();
          resolve({ success: true, realAdsgram: true });
        }
      });

      taskElement.addEventListener('onBannerNotFound', () => {
        console.log('Adsgram Task onBannerNotFound');
      });

      taskElement.addEventListener('onError', (e: Event) => {
        console.warn('Adsgram Task onError', e);
      });

      closeBtn.addEventListener('click', () => {
        cleanup();
        if (!hasRewarded) {
          onError?.('Task wall closed');
          resolve({ success: false, realAdsgram: true, error: 'Task closed' });
        }
      });

      taskContainer.appendChild(taskElement);
      card.appendChild(header);
      card.appendChild(taskContainer);
      card.appendChild(closeBtn);
      overlay.appendChild(card);
      document.body.appendChild(overlay);
    });
  }

  public static async showAdOrTask(
    targetBlockId: string,
    onReward: () => void,
    onError?: (msg: string) => void,
    onProgress?: (state: string) => void,
    isTask: boolean = false
  ): Promise<{ success: boolean; realAdsgram: boolean; error?: string }> {
    if (isTask || targetBlockId.startsWith('task-')) {
      return this.showRewardTask(onReward, onError, onProgress, targetBlockId);
    }
    return this.showRewardedAd(onReward, onError, onProgress, targetBlockId);
  }
}

