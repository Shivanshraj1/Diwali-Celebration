import { GlobalCelebrationStats, CelebrationActivity } from '../types';

type Listener = (stats: GlobalCelebrationStats, latestActivity?: CelebrationActivity) => void;

class RealtimeCelebrationService {
  private socket: WebSocket | null = null;
  private listeners: Set<Listener> = new Set();
  private reconnectTimer: NodeJS.Timeout | null = null;
  private isConnecting = false;
  private state: GlobalCelebrationStats = {
    activeUsers: 1,
    totalCelebrations: 34820,
    crackersIgnited: 18450,
    sweetsShared: 8930,
    wishesSent: 4210,
    diyasLit: 3230,
    recentActivities: []
  };

  constructor() {
    this.fetchInitialStats();
    this.connect();
  }

  public getState(): GlobalCelebrationStats {
    return this.state;
  }

  public subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    // Immediately emit current known state
    listener(this.state);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(latestActivity?: CelebrationActivity) {
    this.listeners.forEach((fn) => fn({ ...this.state }, latestActivity));
  }

  private async fetchInitialStats() {
    try {
      const res = await fetch('/api/celebration-stats');
      if (res.ok) {
        const data = await res.json();
        this.state = {
          ...this.state,
          ...data,
          recentActivities: data.recentActivities || this.state.recentActivities
        };
        this.notify();
      }
    } catch {
      // Backend may still be initializing
    }
  }

  private connect() {
    if (this.socket && (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING)) {
      return;
    }

    if (this.isConnecting) return;
    this.isConnecting = true;

    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws`;

      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        this.isConnecting = false;
        this.socket = ws;
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);

          if (msg.type === 'init' && msg.data) {
            this.state = {
              ...this.state,
              ...msg.data
            };
            this.notify();
          } else if (msg.type === 'presence:update') {
            this.state.activeUsers = msg.activeUsers;
            this.notify();
          } else if (msg.type === 'celebration:event') {
            const { activity, stats } = msg;
            if (stats) {
              this.state = {
                ...this.state,
                ...stats
              };
            }
            if (activity) {
              // Guard against duplicates
              const exists = this.state.recentActivities.some((a) => a.id === activity.id);
              if (!exists) {
                this.state.recentActivities = [activity, ...this.state.recentActivities.slice(0, 24)];
              }
            }
            this.notify(activity);
          }
        } catch {
          // Ignore JSON errors
        }
      };

      ws.onclose = () => {
        this.isConnecting = false;
        this.socket = null;
        this.scheduleReconnect();
      };

      ws.onerror = () => {
        this.isConnecting = false;
        try {
          ws.close();
        } catch {}
      };
    } catch {
      this.isConnecting = false;
      this.scheduleReconnect();
    }
  }

  private scheduleReconnect() {
    if (this.reconnectTimer) return;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.fetchInitialStats();
      this.connect();
    }, 3500);
  }

  public reportAction(actionType: 'cracker' | 'sweet' | 'wish' | 'diya', detail: string, sender = 'You') {
    // 1. Optimistic local update
    this.state.totalCelebrations += 1;
    if (actionType === 'cracker') this.state.crackersIgnited += 1;
    else if (actionType === 'sweet') this.state.sweetsShared += 1;
    else if (actionType === 'wish') this.state.wishesSent += 1;
    else if (actionType === 'diya') this.state.diyasLit += 1;

    const localActivity: CelebrationActivity = {
      id: `local_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      type: actionType,
      text: detail,
      sender,
      timestamp: Date.now()
    };
    this.state.recentActivities = [localActivity, ...this.state.recentActivities.slice(0, 24)];
    this.notify(localActivity);

    // 2. Broadcast via WebSocket if open
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(
        JSON.stringify({
          type: 'celebration:action',
          actionType,
          sender,
          detail
        })
      );
    } else {
      // 3. Fallback via HTTP REST
      fetch('/api/celebrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actionType, sender, detail })
      }).catch(() => {});
    }
  }
}

export const realtimeCelebration = new RealtimeCelebrationService();
