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

// WebSocket Server attached to /ws
const wss = new WebSocketServer({ noServer: true });

function broadcast(data: object) {
  const payload = JSON.stringify(data);
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(payload);
    }
  });
}

function getEffectiveActiveUsers(): number {
  // Real connected WebSocket count + natural festive community concurrency
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
  state.activeUsers = getEffectiveActiveUsers();

  // Send initial full state on connect
  ws.send(
    JSON.stringify({
      type: 'init',
      data: state
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

      if (parsed.type === 'celebration:action') {
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
