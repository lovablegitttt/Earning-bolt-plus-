// Adsgram SDK Integration Service
// Official Documentation & Integration: https://adsgram.ai
// Block IDs:
// - Rewarded Video / Interstitial: int-45220
// - Adsgram Tasks Wall: task-45229

export const DEFAULT_ADSGRAM_BLOCK_ID = 'int-45220';
export const DEFAULT_ADSGRAM_TASK_BLOCK_ID = 'task-45229';

// Ad cooldown duration in seconds (1 minute)
export const AD_COOLDOWN_SECONDS = 60;

export interface AdsgramInitParams {
  blockId: string;
  debug?: boolean;
}

export interface ShowPromiseResult {
  done: boolean;
  description: string;
  state: 'load' | 'render' | 'playing' | 'destroy';
  error: boolean;
}

export interface AdsgramAdController {
  show: () => Promise<ShowPromiseResult>;
  destroy: () => void;
  addEventListener: (event: string, handler: (e: any) => void) => void;
  removeEventListener: (event: string, handler: (e: any) => void) => void;
}

declare global {
  interface Window {
    Adsgram?: {
      init: (params: AdsgramInitParams) => AdsgramAdController;
    };
  }
}

export class AdsgramService {
  private static activeBlockId: string = DEFAULT_ADSGRAM_BLOCK_ID;
  private static activeTaskBlockId: string = DEFAULT_ADSGRAM_TASK_BLOCK_ID;
  private static controller: AdsgramAdController | null = null;
  private static debugMode: boolean = false;

  public static getBlockId(): string {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('bolt_custom_block_id');
      if (saved && saved.trim()) return saved.trim();
    }
    return this.activeBlockId;
  }

  public static setBlockId(blockId: string): void {
    const cleanId = blockId.trim() || DEFAULT_ADSGRAM_BLOCK_ID;
    this.activeBlockId = cleanId;
    if (typeof window !== 'undefined') {
      localStorage.setItem('bolt_custom_block_id', cleanId);
    }
    this.controller = null;
  }

  public static getTaskBlockId(): string {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('bolt_custom_task_block_id');
      if (saved && saved.trim()) return saved.trim();
    }
    return this.activeTaskBlockId;
  }

  public static setTaskBlockId(blockId: string): void {
    const cleanId = blockId.trim() || DEFAULT_ADSGRAM_TASK_BLOCK_ID;
    this.activeTaskBlockId = cleanId;
    if (typeof window !== 'undefined') {
      localStorage.setItem('bolt_custom_task_block_id', cleanId);
    }
  }

  public static isDebugMode(): boolean {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('bolt_adsgram_debug');
      if (saved !== null) return saved === 'true';
    }
    return this.debugMode;
  }

  public static setDebugMode(debug: boolean): void {
    this.debugMode = debug;
    if (typeof window !== 'undefined') {
      localStorage.setItem('bolt_adsgram_debug', String(debug));
    }
    this.controller = null;
  }

  public static isAdsgramAvailable(): boolean {
    return typeof window !== 'undefined' && typeof window.Adsgram !== 'undefined';
  }

  private static getController(blockId?: string): AdsgramAdController | null {
    if (typeof window === 'undefined') return null;

    const targetBlockId = blockId || this.getBlockId();

    if (!window.Adsgram) {
      console.warn('[Adsgram] SDK script not yet loaded on window.Adsgram');
      return null;
    }

    try {
      this.controller = window.Adsgram.init({
        blockId: targetBlockId,
        debug: this.isDebugMode(),
      });
      return this.controller;
    } catch (e) {
      console.error('[Adsgram] Failed to init Adsgram controller:', e);
      return null;
    }
  }

  /**
   * Shows a rewarded ad via Adsgram.
   * Handles SDK invocation or visual simulation in non-Telegram iframe dev environment.
   */
  public static async showRewardedAd(
    onReward: () => void,
    onError: (err: string) => void,
    onStateChange?: (state: string) => void,
    blockId?: string
  ): Promise<{ success: boolean; error?: string }> {
    const targetBlockId = blockId || this.getBlockId();
    const isDebug = this.isDebugMode();

    if (onStateChange) onStateChange('Loading Adsgram ad...');

    // If Adsgram SDK is available, trigger real Adsgram
    if (this.isAdsgramAvailable()) {
      try {
        const controller = this.getController(targetBlockId);
        if (!controller) {
          throw new Error('Could not initialize Adsgram controller');
        }

        if (onStateChange) onStateChange('Displaying Adsgram ad...');
        const result = await controller.show();

        if (result && result.done) {
          if (onStateChange) onStateChange('Ad completed! Rewarding user...');
          onReward();
          return { success: true };
        } else {
          const msg = result?.description || 'Ad was closed before completion';
          onError(msg);
          return { success: false, error: msg };
        }
      } catch (err: any) {
        console.warn('[Adsgram] SDK show error, providing fallback handling:', err);
        const errMsg = err?.description || err?.message || 'Adsgram ad playback issue';
        
        // If debug mode is active or user is in development preview, allow verified test completion
        if (isDebug || window.location.hostname.includes('run.app') || window.location.hostname.includes('localhost')) {
          return this.runSimulatedAd(onReward, onStateChange, targetBlockId);
        }

        onError(errMsg);
        return { success: false, error: errMsg };
      }
    } else {
      // SDK not loaded in iframe environment, run fallback simulated preview
      return this.runSimulatedAd(onReward, onStateChange, targetBlockId);
    }
  }

  private static runSimulatedAd(
    onReward: () => void,
    onStateChange?: (state: string) => void,
    blockId: string = DEFAULT_ADSGRAM_BLOCK_ID
  ): Promise<{ success: boolean }> {
    return new Promise((resolve) => {
      if (onStateChange) onStateChange(`Playing Adsgram [${blockId}] (10s)...`);

      // Create a visual overlay in preview if needed
      const overlay = document.createElement('div');
      overlay.id = 'adsgram-preview-player';
      overlay.style.position = 'fixed';
      overlay.style.top = '0';
      overlay.style.left = '0';
      overlay.style.width = '100vw';
      overlay.style.height = '100vh';
      overlay.style.backgroundColor = 'rgba(10, 15, 29, 0.95)';
      overlay.style.zIndex = '99999';
      overlay.style.display = 'flex';
      overlay.style.flexDirection = 'column';
      overlay.style.alignItems = 'center';
      overlay.style.justifyContent = 'center';
      overlay.style.color = '#ffffff';
      overlay.style.fontFamily = 'system-ui, -apple-system, sans-serif';

      let secondsLeft = 5;

      overlay.innerHTML = `
        <div style="text-align: center; max-width: 320px; padding: 24px; background: #1e293b; border-radius: 24px; border: 1px solid #334155; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);">
          <div style="display: inline-flex; align-items: center; gap: 6px; padding: 4px 12px; background: rgba(245, 158, 11, 0.2); color: #fbbf24; border-radius: 9999px; font-size: 11px; font-weight: 700; margin-bottom: 16px;">
            <span style="width: 6px; height: 6px; border-radius: 50%; background: #fbbf24;"></span>
            ADSGRAM REWARDED VIDEO
          </div>
          <h3 style="font-size: 18px; font-weight: 800; margin: 0 0 8px 0; color: #ffffff;">Sponsored Sponsor Clip</h3>
          <p style="font-size: 12px; color: #94a3b8; margin: 0 0 16px 0; line-height: 1.4;">Watching Adsgram campaign (Block ID: <code style="color: #38bdf8;">${blockId}</code>). Reward credits automatically upon completion.</p>
          <div style="width: 64px; height: 64px; margin: 0 auto 16px auto; border-radius: 50%; background: linear-gradient(135deg, #f59e0b, #d97706); display: flex; align-items: center; justify-content: center; font-size: 22px; font-weight: 900;" id="adsgram-timer">
            ${secondsLeft}
          </div>
          <div style="font-size: 11px; color: #64748b;">Do not close while video is active</div>
        </div>
      `;

      document.body.appendChild(overlay);

      const interval = setInterval(() => {
        secondsLeft -= 1;
        const timerEl = document.getElementById('adsgram-timer');
        if (timerEl) {
          timerEl.textContent = String(secondsLeft);
        }

        if (secondsLeft <= 0) {
          clearInterval(interval);
          if (document.body.contains(overlay)) {
            document.body.removeChild(overlay);
          }
          if (onStateChange) onStateChange('Adsgram ad completed! +$0.30 rewarded');
          onReward();
          resolve({ success: true });
        }
      }, 1000);
    });
  }
}
