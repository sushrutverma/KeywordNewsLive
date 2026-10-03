import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    'process.env.SITE_URL': JSON.stringify(process.env.SITE_URL || process.env.VITE_SITE_URL || process.env.URL || 'https://keywordnews.netlify.app'),
  },
  server: {
    host: true,
    port: 5173,
  },
  build: {
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('framer-motion')) {
              return 'vendor-framer';
            }
            if (id.includes('lucide-react')) {
              return 'vendor-icons';
            }
            if (id.includes('@supabase')) {
              return 'vendor-supabase';
            }
            if (id.includes('@mozilla/readability') || id.includes('dompurify') || id.includes('rss-parser')) {
              return 'vendor-parsers';
            }
            if (id.includes('react-router') || id.includes('react-query')) {
              return 'vendor-routing-query';
            }
          }
        },
      },
    },
  },
});