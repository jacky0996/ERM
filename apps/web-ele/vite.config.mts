import { defineConfig } from '@vben/vite-config';
import { loadEnv } from 'vite';

import ElementPlus from 'unplugin-element-plus/vite';

export default defineConfig(async ({ mode }) => {
  // 動態載應當前環境檔
  const env = loadEnv(mode, process.cwd());

  // 強制讀取 Proxy 設定 (無值即報錯終止)
  const apiTarget = env.VITE_PROXY_API_TARGET;
  const ssoTarget = env.VITE_PROXY_SSO_TARGET;

  if (!apiTarget || !ssoTarget) {
    throw new Error(`[ViteConfig] 關鍵環境變數缺失：請在 .env.${mode} 中設定 VITE_PROXY_API_TARGET 與 VITE_PROXY_SSO_TARGET。系統拒絕啟動。`);
  }

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
            target: ssoTarget,
            ws: true,
          },
          '/api/edm': {
            changeOrigin: true,
            rewrite: (path) => path.replace(/^\/api\/edm/, '/api/edm'),
            target: apiTarget,
            ws: true,
          },
          '/api': {
            changeOrigin: true,
            rewrite: (path) => path.replace(/^\/api/, ''),
            target: `${apiTarget}/api`,
            ws: true,
          },
        },
      },
    },
  };
});
