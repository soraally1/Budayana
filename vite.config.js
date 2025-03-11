import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.')
  
  return {
    plugins: [react()],
    server: {
      proxy: {
        '/api/midtrans': {
          target: 'https://app.sandbox.midtrans.com',
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/api\/midtrans/, ''),
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Basic ${btoa(env.VITE_MIDTRANS_SERVER_KEY + ':')}`
          }
        }
      }
    }
  }
});
