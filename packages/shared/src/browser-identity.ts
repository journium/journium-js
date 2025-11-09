import { generateUuidv7 } from './utils';

export interface BrowserIdentity {
  distinct_id: string;
  $device_id: string;
  $session_id: string;
  session_timestamp: number;
}

export interface UserAgentInfo {
  $raw_user_agent: string;
  $browser: string;
  $os: string;
  $device_type: string;
}

const STORAGE_KEY = '__journium_identity';
const DEFAULT_SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes in ms

export class BrowserIdentityManager {
  private identity: BrowserIdentity | null = null;
  private sessionTimeout: number = DEFAULT_SESSION_TIMEOUT;

  constructor(sessionTimeout?: number) {
    if (sessionTimeout) {
      this.sessionTimeout = sessionTimeout;
    }
    this.loadOrCreateIdentity();
  }

  private loadOrCreateIdentity(): void {
    if (!this.isBrowser()) return;

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsedIdentity = JSON.parse(stored) as BrowserIdentity;
        
        // Check if session is expired
        const now = Date.now();
        const sessionAge = now - parsedIdentity.session_timestamp;
        
        if (sessionAge > this.sessionTimeout) {
          // Session expired, create new session but keep device and distinct IDs
          this.identity = {
            distinct_id: parsedIdentity.distinct_id,
            $device_id: parsedIdentity.$device_id,
            $session_id: generateUuidv7(),
            session_timestamp: now,
          };
        } else {
          // Session still valid
          this.identity = parsedIdentity;
        }
      } else {
        // First time, create all new IDs
        const newId = generateUuidv7();
        this.identity = {
          distinct_id: newId,
          $device_id: newId,
          $session_id: newId,
          session_timestamp: Date.now(),
        };
      }

      // Save to localStorage
      this.saveIdentity();
    } catch (error) {
      console.warn('Journium: Failed to load/create identity:', error);
      // Fallback: create temporary identity without localStorage
      const newId = generateUuidv7();
      this.identity = {
        distinct_id: newId,
        $device_id: newId,
        $session_id: newId,
        session_timestamp: Date.now(),
      };
    }
  }

  private saveIdentity(): void {
    if (!this.isBrowser() || !this.identity) return;

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.identity));
    } catch (error) {
      console.warn('Journium: Failed to save identity to localStorage:', error);
    }
  }

  private isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
  }

  public getIdentity(): BrowserIdentity | null {
    return this.identity;
  }

  public updateSessionTimeout(timeoutMs: number): void {
    this.sessionTimeout = timeoutMs;
  }

  public refreshSession(): void {
    if (!this.identity) return;
    
    this.identity = {
      ...this.identity,
      $session_id: generateUuidv7(),
      session_timestamp: Date.now(),
    };
    
    this.saveIdentity();
  }

  public getUserAgentInfo(): UserAgentInfo {
    if (!this.isBrowser()) {
      return {
        $raw_user_agent: '',
        $browser: 'Unknown',
        $os: 'Unknown',
        $device_type: 'Unknown',
      };
    }

    const userAgent = navigator.userAgent;
    return {
      $raw_user_agent: userAgent,
      $browser: this.parseBrowser(userAgent),
      $os: this.parseOS(userAgent),
      $device_type: this.parseDeviceType(userAgent),
    };
  }

  private parseBrowser(userAgent: string): string {
    if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) return 'Safari';
    if (userAgent.includes('Edg')) return 'Edge';
    if (userAgent.includes('Opera') || userAgent.includes('OPR')) return 'Opera';
    return 'Unknown';
  }

  private parseOS(userAgent: string): string {
    if (userAgent.includes('Windows')) return 'Windows';
    if (userAgent.includes('Macintosh') || userAgent.includes('Mac OS')) return 'Mac OS';
    if (userAgent.includes('Linux')) return 'Linux';
    if (userAgent.includes('Android')) return 'Android';
    if (userAgent.includes('iPhone') || userAgent.includes('iPad')) return 'iOS';
    return 'Unknown';
  }

  private parseDeviceType(userAgent: string): string {
    if (userAgent.includes('Mobile') || userAgent.includes('Android') || userAgent.includes('iPhone')) {
      return 'Mobile';
    }
    if (userAgent.includes('iPad') || userAgent.includes('Tablet')) {
      return 'Tablet';
    }
    return 'Desktop';
  }
}