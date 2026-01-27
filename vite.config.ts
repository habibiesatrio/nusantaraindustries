import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
        // Nambah Proxy buat Comtrade API Loh ya
        proxy: {
          '/comtrade-api': {
            target: 'https://comtradeapi.un.org',
            changeOrigin: true,
            secure: true,
            // Menghapus prefix /comtrade-api saat dikirim ke server UN
            rewrite: (path) => path.replace(/^\/comtrade-api/, ''),
            // Konfigurasi tambahan untuk debugging Enterprise
            configure: (proxy, _options) => {
              proxy.on('error', (err, _req, _res) => {
                console.error('Proxy Error [Comtrade]:', err);
              });
            },
          },
        },
      },
      
      plugins: [react()],
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        },
        extensions: ['.js', '.ts', '.jsx', '.tsx'],
      },
      build: {
        outDir: 'dist',
        sourcemap: mode === 'development',
      }
    };
});
