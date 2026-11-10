import { GlobalCelebrationStats, CelebrationActivity, CharacterData, CrackerType, SweetType } from '../types';

type StatsListener = (stats: GlobalCelebrationStats, latestActivity?: CelebrationActivity) => void;
type UserJoinedListener = (character: CharacterData) => void;
type UserLeftListener = (characterId: string, name: string) => void;
type RemoteCrackerListener = (data: {
  crackerType: CrackerType;
  x: number;
  y: number;
  characterId?: string;
  igniterName?: string;
}) => void;
type RemoteSweetListener = (data: {
  sweetType: SweetType;
  characterId?: string;
  sharerName?: string;
}) => void;

class RealtimeCelebrationService {
  private socket: WebSocket | null = null;
  private statsListeners: Set<StatsListener> = new Set();
  private userJoinedListeners: Set<UserJoinedListener> = new Set();
  private userLeftListeners: Set<UserLeftListener> = new Set();
  private remoteCrackerListeners: Set<RemoteCrackerListener> = new Set();
  private remoteSweetListeners: Set<RemoteSweetListener> = new Set();

  private reconnectTimer: NodeJS.Timeout | null = null;
  private isConnecting = false;
  private myCharacter: CharacterData | null = null;
  private pendingJoinCharacter: CharacterData | null = null;

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

  public subscribe(listener: StatsListener): () => void {
    this.statsListeners.add(listener);
    // Immediately emit current known state
    listener(this.state);
    return () => {
      this.statsListeners.delete(listener);
    };
  }

  public onUserJoined(listener: UserJoinedListener): () => void {
    this.userJoinedListeners.add(listener);
    return () => {
      this.userJoinedListeners.delete(listener);
    };
  }

  public onUserLeft(listener: UserLeftListener): () => void {
    this.userLeftListeners.add(listener);
    return () => {
      this.userLeftListeners.delete(listener);
    };
  }

  public onRemoteCracker(listener: RemoteCrackerListener): () => void {
    this.remoteCrackerListeners.add(listener);
    return () => {
      this.remoteCrackerListeners.delete(listener);
    };
  }

  public onRemoteSweet(listener: RemoteSweetListener): () => void {
    this.remoteSweetListeners.add(listener);
    return () => {
      this.remoteSweetListeners.delete(listener);
    };
  }

  private notify(latestActivity?: CelebrationActivity) {
    this.statsListeners.forEach((fn) => fn({ ...this.state }, latestActivity));
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

        // If user joined while reconnecting or connecting, send join payload now
        if (this.pendingJoinCharacter || this.myCharacter) {
          const charToJoin = this.pendingJoinCharacter || this.myCharacter;
          if (charToJoin) {
            this.sendSocketMessage({
              type: 'presence:join',
              character: charToJoin
            });
            this.pendingJoinCharacter = null;
          }
        }
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

            // If there are existing online characters, inform joined listeners
            if (Array.isArray(msg.connectedCharacters)) {
              msg.connectedCharacters.forEach((char: CharacterData) => {
                if (char && char.id && char.id !== this.myCharacter?.id) {
                  this.userJoinedListeners.forEach((fn) => fn(char));
                }
              });
            }
          } else if (msg.type === 'presence:update') {
            this.state.activeUsers = msg.activeUsers;
            this.notify();
          } else if (msg.type === 'user:joined' && msg.character) {
            if (msg.stats) {
              this.state = { ...this.state, ...msg.stats };
            }
            if (msg.activity) {
              const exists = this.state.recentActivities.some((a) => a.id === msg.activity.id);
              if (!exists) {
                this.state.recentActivities = [msg.activity, ...this.state.recentActivities.slice(0, 24)];
              }
              this.notify(msg.activity);
            }
            // Notify user joined listeners so the person appears in the arena!
            this.userJoinedListeners.forEach((fn) => fn(msg.character));
          } else if (msg.type === 'user:left' && msg.characterId) {
            this.userLeftListeners.forEach((fn) => fn(msg.characterId, msg.name || 'Friend'));
          } else if (msg.type === 'cracker:remote_ignited') {
            if (msg.stats) this.state = { ...this.state, ...msg.stats };
            if (msg.activity) {
              const exists = this.state.recentActivities.some((a) => a.id === msg.activity.id);
              if (!exists) {
                this.state.recentActivities = [msg.activity, ...this.state.recentActivities.slice(0, 24)];
              }
              this.notify(msg.activity);
            }
            this.remoteCrackerListeners.forEach((fn) =>
              fn({
                crackerType: msg.crackerType,
                x: msg.x,
                y: msg.y,
                characterId: msg.characterId,
                igniterName: msg.igniterName
              })
            );
          } else if (msg.type === 'sweet:remote_shared') {
            if (msg.stats) this.state = { ...this.state, ...msg.stats };
            if (msg.activity) {
              const exists = this.state.recentActivities.some((a) => a.id === msg.activity.id);
              if (!exists) {
                this.state.recentActivities = [msg.activity, ...this.state.recentActivities.slice(0, 24)];
              }
              this.notify(msg.activity);
            }
            this.remoteSweetListeners.forEach((fn) =>
              fn({
                sweetType: msg.sweetType,
                characterId: msg.characterId,
                sharerName: msg.sharerName
              })
            );
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
    }, 3000);
  }

  private sendSocketMessage(msg: object) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(msg));
      return true;
    }
    return false;
  }

  /**
   * Announce joining the live arena with a Character
   */
  public joinPresence(character: CharacterData) {
    this.myCharacter = character;
    const sent = this.sendSocketMessage({
      type: 'presence:join',
      character
    });

    if (!sent) {
      this.pendingJoinCharacter = character;
    }
  }

  /**
   * Broadcast cracker ignition so other participants see the visual and hear audio
   */
  public broadcastCrackerIgnition(
    crackerType: CrackerType,
    x: number,
    y: number,
    characterId?: string,
    igniterName?: string
  ) {
    this.sendSocketMessage({
      type: 'cracker:ignite',
      crackerType,
      x,
      y,
      characterId,
      igniterName: igniterName || 'Celebrator',
      detail: `${igniterName || 'Celebrator'} ignited ${crackerType}!`
    });
  }

  /**
   * Broadcast sweet sharing so all participants' companions cheer
   */
  public broadcastSweetShare(sweetType: SweetType, characterId?: string, sharerName?: string) {
    this.sendSocketMessage({
      type: 'sweet:share',
      sweetType,
      characterId,
      sharerName: sharerName || 'Celebrator',
      detail: `${sharerName || 'Celebrator'} shared Diwali sweets with everyone!`
    });
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
    const sent = this.sendSocketMessage({
      type: 'celebration:action',
      actionType,
      sender,
      detail
    });

    if (!sent) {
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
