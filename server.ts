import express from 'express';
import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3000;
const isProd = process.env.NODE_ENV === 'production';

app.use(express.json());

// Server-authoritative Global Celebration State
export interface CelebrationActivity {
  id: string;
  type: 'cracker' | 'sweet' | 'wish' | 'diya';
  text: string;
  sender?: string;
  timestamp: number;
}

export interface GlobalCelebrationStats {
  activeUsers: number;
  totalCelebrations: number;
  crackersIgnited: number;
  sweetsShared: number;
  wishesSent: number;
  diyasLit: number;
  recentActivities: CelebrationActivity[];
}

// Starting community baseline reflecting widespread Diwali festivities
const state: GlobalCelebrationStats = {
  activeUsers: 1,
  totalCelebrations: 34820,
  crackersIgnited: 18450,
  sweetsShared: 8930,
  wishesSent: 4210,
  diyasLit: 3230,
  recentActivities: [
    {
      id: 'init_1',
      type: 'cracker',
      text: 'Celebrator ignited Sky Calligraphy ("HAPPY DIWALI TO ALL")!',
      sender: 'Aarav',
      timestamp: Date.now() - 12000
    },
    {
      id: 'init_2',
      type: 'sweet',
      text: 'Priya shared sweet Kaju Katli with everyone!',
      sender: 'Priya',
      timestamp: Date.now() - 35000
    },
    {
      id: 'init_3',
      type: 'cracker',
      text: 'Someone lit a dazzling golden Anar fountain!',
      sender: 'Celebrator',
      timestamp: Date.now() - 72000
    },
    {
      id: 'init_4',
      type: 'wish',
      text: 'Festive blessing: "May the divine light illuminate your world!"',
      sender: 'Shivansh',
      timestamp: Date.now() - 110000
    }
  ]
};

// Server-authoritative Connected User Presence
interface ConnectedUser {
  socketId: string;
  character?: any;
}

const connectedUsers = new Map<WebSocket, ConnectedUser>();

// WebSocket Server attached to /ws
const wss = new WebSocketServer({ noServer: true });

function broadcast(data: object, excludeWs?: WebSocket) {
  const payload = JSON.stringify(data);
  wss.clients.forEach((client) => {
    if (client !== excludeWs && client.readyState === WebSocket.OPEN) {
      client.send(payload);
    }
  });
}

function getEffectiveActiveUsers(): number {
  return Math.max(1, wss.clients.size);
}

// Server upgrade handler
server.on('upgrade', (request, socket, head) => {
  try {
    const url = new URL(request.url || '', `http://${request.headers.host || 'localhost'}`);
    if (url.pathname === '/ws') {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
      });
    } else {
      socket.destroy();
    }
  } catch {
    socket.destroy();
  }
});

wss.on('connection', (ws: WebSocket) => {
  const socketId = `sock_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
  connectedUsers.set(ws, { socketId });
  state.activeUsers = getEffectiveActiveUsers();

  // Collect all currently active characters joined by other online users
  const activeCharacters = Array.from(connectedUsers.values())
    .map((u) => u.character)
    .filter(Boolean);

  // Send initial full state and current active online characters
  ws.send(
    JSON.stringify({
      type: 'init',
      data: state,
      connectedCharacters: activeCharacters
    })
  );

  // Broadcast presence update to everyone
  broadcast({
    type: 'presence:update',
    activeUsers: state.activeUsers
  });

  ws.on('message', (message: string) => {
    try {
      const parsed = JSON.parse(message.toString());

      // 1. User joins via invite link or custom character creation
      if (parsed.type === 'presence:join' && parsed.character) {
        const user = connectedUsers.get(ws);
        if (user) {
          user.character = parsed.character;
        }

        const newActivity: CelebrationActivity = {
          id: `join_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
          type: 'wish',
          text: `✨ ${parsed.character.name} stepped into the Diwali celebration arena!`,
          sender: parsed.character.name,
          timestamp: Date.now()
        };

        state.recentActivities.unshift(newActivity);
        if (state.recentActivities.length > 25) {
          state.recentActivities.pop();
        }

        // Broadcast to ALL other clients so the new person appears in their arena immediately!
        broadcast({
          type: 'user:joined',
          character: parsed.character,
          activity: newActivity,
          stats: {
            totalCelebrations: state.totalCelebrations,
            crackersIgnited: state.crackersIgnited,
            sweetsShared: state.sweetsShared,
            wishesSent: state.wishesSent,
            diyasLit: state.diyasLit
          }
        }, ws);

        console.log(`[Diwali Celebration] User joined arena: ${parsed.character.name} (${parsed.character.id})`);
      }

      // 2. Character updated (name or avatar change)
      else if (parsed.type === 'presence:update_character' && parsed.character) {
        const user = connectedUsers.get(ws);
        if (user) {
          user.character = parsed.character;
        }
        broadcast({
          type: 'user:updated',
          character: parsed.character
        }, ws);
      }

      // 3. Remote cracker ignition broadcast
      else if (parsed.type === 'cracker:ignite') {
        state.totalCelebrations += 1;
        state.crackersIgnited += 1;

        const newActivity: CelebrationActivity = {
          id: `cracker_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
          type: 'cracker',
          text: parsed.detail || `${parsed.igniterName || 'Someone'} ignited ${parsed.crackerType}!`,
          sender: parsed.igniterName || 'Celebrator',
          timestamp: Date.now()
        };

        state.recentActivities.unshift(newActivity);
        if (state.recentActivities.length > 25) state.recentActivities.pop();

        // Broadcast to other clients so they witness the fireworks in real time!
        broadcast({
          type: 'cracker:remote_ignited',
          crackerType: parsed.crackerType,
          x: parsed.x,
          y: parsed.y,
          characterId: parsed.characterId,
          igniterName: parsed.igniterName,
          activity: newActivity,
          stats: {
            totalCelebrations: state.totalCelebrations,
            crackersIgnited: state.crackersIgnited,
            sweetsShared: state.sweetsShared,
            wishesSent: state.wishesSent,
            diyasLit: state.diyasLit
          }
        }, ws);
      }

      // 4. Remote sweet sharing broadcast
      else if (parsed.type === 'sweet:share') {
        state.totalCelebrations += 1;
        state.sweetsShared += 1;

        const newActivity: CelebrationActivity = {
          id: `sweet_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
          type: 'sweet',
          text: parsed.detail || `${parsed.sharerName || 'Someone'} distributed sweet treats!`,
          sender: parsed.sharerName || 'Celebrator',
          timestamp: Date.now()
        };

        state.recentActivities.unshift(newActivity);
        if (state.recentActivities.length > 25) state.recentActivities.pop();

        broadcast({
          type: 'sweet:remote_shared',
          sweetType: parsed.sweetType,
          characterId: parsed.characterId,
          sharerName: parsed.sharerName,
          activity: newActivity,
          stats: {
            totalCelebrations: state.totalCelebrations,
            crackersIgnited: state.crackersIgnited,
            sweetsShared: state.sweetsShared,
            wishesSent: state.wishesSent,
            diyasLit: state.diyasLit
          }
        }, ws);
      }

      // 5. Celebration action report (general)
      else if (parsed.type === 'celebration:action') {
        const actionType = parsed.actionType as 'cracker' | 'sweet' | 'wish' | 'diya';
        const sender = parsed.sender || 'Celebrator';
        const detail = parsed.detail || '';

        state.totalCelebrations += 1;

        if (actionType === 'cracker') state.crackersIgnited += 1;
        else if (actionType === 'sweet') state.sweetsShared += 1;
        else if (actionType === 'wish') state.wishesSent += 1;
        else if (actionType === 'diya') state.diyasLit += 1;

        const newActivity: CelebrationActivity = {
          id: `act_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
          type: actionType,
          text: detail || `${sender} celebrated with ${actionType}!`,
          sender,
          timestamp: Date.now()
        };

        state.recentActivities.unshift(newActivity);
        if (state.recentActivities.length > 25) {
          state.recentActivities.pop();
        }

        // Broadcast to all connected clients
        broadcast({
          type: 'celebration:event',
          activity: newActivity,
          stats: {
            totalCelebrations: state.totalCelebrations,
            crackersIgnited: state.crackersIgnited,
            sweetsShared: state.sweetsShared,
            wishesSent: state.wishesSent,
            diyasLit: state.diyasLit
          }
        });
      }
    } catch {
      // Ignore malformed payloads
    }
  });

  ws.on('close', () => {
    const user = connectedUsers.get(ws);
    if (user && user.character) {
      console.log(`[Diwali Celebration] User left arena: ${user.character.name}`);
      broadcast({
        type: 'user:left',
        characterId: user.character.id,
        name: user.character.name
      }, ws);
    }
    connectedUsers.delete(ws);
    state.activeUsers = getEffectiveActiveUsers();
    broadcast({
      type: 'presence:update',
      activeUsers: state.activeUsers
    });
  });
});

// REST API endpoints
app.get('/api/celebration-stats', (_req, res) => {
  res.json({
    ...state,
    activeUsers: getEffectiveActiveUsers()
  });
});

app.post('/api/celebrate', (req, res) => {
  const { actionType, sender, detail } = req.body;
  if (!actionType) {
    res.status(400).json({ error: 'actionType is required' });
    return;
  }

  state.totalCelebrations += 1;
  if (actionType === 'cracker') state.crackersIgnited += 1;
  else if (actionType === 'sweet') state.sweetsShared += 1;
  else if (actionType === 'wish') state.wishesSent += 1;
  else if (actionType === 'diya') state.diyasLit += 1;

  const newActivity: CelebrationActivity = {
    id: `act_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    type: actionType,
    text: detail || `${sender || 'Celebrator'} celebrated with ${actionType}!`,
    sender: sender || 'Celebrator',
    timestamp: Date.now()
  };

  state.recentActivities.unshift(newActivity);
  if (state.recentActivities.length > 25) {
    state.recentActivities.pop();
  }

  broadcast({
    type: 'celebration:event',
    activity: newActivity,
    stats: {
      totalCelebrations: state.totalCelebrations,
      crackersIgnited: state.crackersIgnited,
      sweetsShared: state.sweetsShared,
      wishesSent: state.wishesSent,
      diyasLit: state.diyasLit
    }
  });

  res.json({ success: true, stats: state });
});

// Vite Middleware for Dev / Static serving for Prod
async function startServer() {
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  server.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`[Diwali Celebration] Server listening on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[Diwali Celebration] Failed to start server:', err);
  process.exit(1);
});
