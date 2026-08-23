import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': 'http://127.0.0.1:4002',
      '/policy': 'http://127.0.0.1:4002',
      '/escalation': 'http://127.0.0.1:4002',
      '/resource': 'http://127.0.0.1:4002',
      '/health': 'http://127.0.0.1:4002'
    }
  }
});
