import { defineConfig } from '@vben/vite-config';

import ElementPlus from 'unplugin-element-plus/vite';

export default defineConfig(async () => {
  return {
    application: {},
    vite: {
      plugins: [
        ElementPlus({
          format: 'esm',
        }),
      ],
      server: {
        proxy: {
          // SSO 驗證專用轉發 (本地模擬 UAT)
          '/api-sso': {
            changeOrigin: true,
            rewrite: (path) => path.replace(/^\/api-sso/, '/api'),
            target: 'https://uathws.hwacom.com',
            ws: true,
          },
          '/api/edm': {
            changeOrigin: true,
            rewrite: (path) => path.replace(/^\/api\/edm/, '/api/edm'),
            target: 'http://uatedmapi.hwacom.com',
            ws: true,
          },
          '/api': {
            changeOrigin: true,
            rewrite: (path) => path.replace(/^\/api/, ''),
            target: 'http://uatedmapi.hwacom.com/api',
            ws: true,
          },
        },
      },
    },
  };
});
