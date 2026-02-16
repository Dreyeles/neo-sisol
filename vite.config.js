import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: '0.0.0.0',
    allowedHosts: true, // Permite que Railway acceda al servidor de desarrollo si es necesario
    hmr: {
      clientPort: 443 // Importante para que HMR funcione tras el proxy de Railway
    }
  }
});

