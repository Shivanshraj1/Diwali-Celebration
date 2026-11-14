import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig, type Plugin } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Ensures builds succeed even if firebase-applet-config.json is omitted
 * from version control (e.g. during Vercel builds where env vars are used).
 */
function fallbackFirebaseConfigPlugin(): Plugin {
  const virtualId = '\0virtual:firebase-applet-config';
  return {
    name: 'fallback-firebase-config',
    resolveId(id: string) {
      if (id.includes('firebase-applet-config.json')) {
        const localPath = path.resolve(__dirname, 'firebase-applet-config.json');
        if (!fs.existsSync(localPath)) {
          return virtualId;
        }
      }
      return null;
    },
    load(id: string) {
      if (id === virtualId) {
        return 'export default {};';
      }
      return null;
    },
  };
}

export default defineConfig(() => {
  return {
    base: '/',
    plugins: [fallbackFirebaseConfigPlugin(), react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
