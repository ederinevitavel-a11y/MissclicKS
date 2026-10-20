import path from 'path';
import fs from 'fs';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');

    // Parse local .env file so local values override container system environment variables
    let localEnv: Record<string, string> = {};
    try {
      if (fs.existsSync('.env')) {
        const content = fs.readFileSync('.env', 'utf-8');
        content.split('\n').forEach(line => {
          const trimmed = line.trim();
          if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
            const idx = trimmed.indexOf('=');
            localEnv[trimmed.slice(0, idx).trim()] = trimmed.slice(idx + 1).trim();
          }
        });
      }
    } catch (e) {
      console.warn('Could not read .env file', e);
    }

    const supabaseUrl = localEnv.VITE_SUPABASE_URL || env.VITE_SUPABASE_URL;
    const supabaseAnonKey = localEnv.VITE_SUPABASE_ANON_KEY || env.VITE_SUPABASE_ANON_KEY;

    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react(), tailwindcss()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(supabaseUrl),
        'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(supabaseAnonKey),
      },
      resolve: {
        dedupe: ['react', 'react-dom'],
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      optimizeDeps: {
        include: ['react', 'react-dom', 'motion/react', 'lucide-react']
      }
    };
});
