/**
 * 該檔案可自行根據業務邏輯進行調整
 */
import type { RequestClientOptions } from '@vben/request';

import { useAppConfig } from '@vben/hooks';
import { preferences } from '@vben/preferences';
import {
  authenticateResponseInterceptor,
  defaultResponseInterceptor,
  errorMessageResponseInterceptor,
  RequestClient,
} from '@vben/request';
import { useAccessStore } from '@vben/stores';

import { ElMessage } from 'element-plus';

import { useAuthStore } from '#/store';

import { refreshTokenApi } from './core';

const { apiURL: originalApiURL } = useAppConfig(import.meta.env, import.meta.env.PROD);

// --- [API 分流設定] ---
// 1. 一般業務網址：UAT/正式環境強制走相對路徑 /api/ (隱藏實體 IP)
const apiURL = import.meta.env.DEV ? originalApiURL : '/api/';

// 2. SSO 核心驗證網址：直接從環境變數讀取 (核心系統位址)
const ssoApiURL = (import.meta.env.VITE_SSO_VERIFY_URL as string) || apiURL;

interface AdditionalOptions {
  skipAuthenticate?: boolean;
}

function createRequestClient(
  baseURL: string,
  options?: RequestClientOptions & AdditionalOptions,
) {
  const client = new RequestClient({
    ...options,
    baseURL,
  });

  /**
   * 重新認證 (401 攔截)
   */
  async function doReAuthenticate() {
    console.warn('Access token or refresh token is invalid or expired. ');
    const accessStore = useAccessStore();
    const authStore = useAuthStore();
    accessStore.setAccessToken(null);
    
    // 因為我們使用 SSO，所以不顯示預設的登入彈窗，而是直接登出並導回 SSO
    await authStore.logout();
  }

  /**
   * 刷新 token
   */
  async function doRefreshToken() {
    const accessStore = useAccessStore();
    const resp = await refreshTokenApi();
    const newToken = resp.data;
    accessStore.setAccessToken(newToken);
    return newToken;
  }

  function formatToken(token: null | string) {
    return token ? `Bearer ${token}` : null;
  }

  // Header處理
  client.addRequestInterceptor({
    fulfilled: async (config) => {
      const accessStore = useAccessStore();

      config.headers.Authorization = formatToken(accessStore.accessToken);
      config.headers['Accept-Language'] = preferences.app.locale;

      // 每次發送請求時同步更新最後活動時間 (Session 續期)
      localStorage.setItem('edm_last_activity', Date.now().toString());

      return config;
    },
  });

  // 處理返回的響應數據格式
  client.addResponseInterceptor(
    defaultResponseInterceptor({
      codeField: 'code',
      dataField: 'data',
      successCode: 0,
    }),
  );

  // token過期
  if (!options?.skipAuthenticate) {
    client.addResponseInterceptor(
      authenticateResponseInterceptor({
        client,
        doReAuthenticate,
        doRefreshToken,
        enableRefreshToken: preferences.app.enableRefreshToken,
        formatToken,
      }),
    );
  }

  // 通用的錯誤處理，如果沒有進入上面的錯誤處理邏輯，就會進入這裡
  client.addResponseInterceptor(
    errorMessageResponseInterceptor((msg: string, error) => {
      // 這裡可以根據業務進行定制，你可以拿到 error 內的資訊進行定制化處理，根據不同的 code 做不同的提示，而不是直接使用 message.error 提示 msg
      // 當前 mock 介面返回的錯誤欄位是 error 或者 message
      const responseData = error?.response?.data ?? {};
      const errorMessage = responseData?.error ?? responseData?.message ?? '';
      // 如果沒有錯誤資訊，則會根據狀態碼進行提示
      ElMessage.error(errorMessage || msg);
    }),
  );

  return client;
}

/**
 * 一般業務請求客戶端 (經由中繼站)
 */
export const requestClient = createRequestClient(apiURL, {
  responseReturn: 'data',
});

/**
 * 專屬 SSO 驗證客戶端 (直連核心系統，accessToken 在外層)
 */
export const ssoRequestClient = createRequestClient(ssoApiURL, {
  responseReturn: 'raw',   // ✅ 必定使用 RAW 以讀取外層 accessToken
  skipAuthenticate: true, // ✅ 跳過自動登出邏輯
});

/**
 * 基礎請求客戶端 (不包含 401 自動登出邏輯)
 */
export const baseRequestClient = createRequestClient(apiURL, {
  responseReturn: 'data',
  skipAuthenticate: true,
});
