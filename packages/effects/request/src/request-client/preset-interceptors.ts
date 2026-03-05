import type { RequestClient } from './request-client';
import type { MakeErrorMessageFn, ResponseInterceptorConfig } from './types';

import { $t } from '@vben/locales';
import { isFunction } from '@vben/utils';

import axios from 'axios';

export const defaultResponseInterceptor = ({
  codeField = 'code',
  dataField = 'data',
  successCode = 0,
}: {
  /** 回應資料中代表存取結果的欄位名稱 */
  codeField: string;
  /** 回應資料中裝載實際資料的欄位名稱，或者提供一個函式從回應資料中解析需要回傳的資料 */
  dataField: ((response: any) => any) | string;
  /** 當 codeField 所指定的欄位值與 successCode 相同時，代表介面存取成功。如果提供一個函式，則回傳 true 代表介面存取成功 */
  successCode: ((code: any) => boolean) | number | string;
}): ResponseInterceptorConfig => {
  return {
    fulfilled: (response) => {
      const { config, data: responseData, status } = response;

      if (config.responseReturn === 'raw') {
        return response;
      }

      if (status >= 200 && status < 400) {
        if (config.responseReturn === 'body') {
          return responseData;
        } else if (
          isFunction(successCode)
            ? successCode(responseData[codeField])
            : responseData[codeField] === successCode
        ) {
          return isFunction(dataField)
            ? dataField(responseData)
            : responseData[dataField];
        }
      }
      throw Object.assign({}, response, { response });
    },
  };
};

export const authenticateResponseInterceptor = ({
  client,
  doReAuthenticate,
  doRefreshToken,
  enableRefreshToken,
  formatToken,
}: {
  client: RequestClient;
  doReAuthenticate: () => Promise<void>;
  doRefreshToken: () => Promise<string>;
  enableRefreshToken: boolean;
  formatToken: (token: string) => null | string;
}): ResponseInterceptorConfig => {
  return {
    rejected: async (error) => {
      const { config, response } = error;
      // 如果不是 401 錯誤，直接拋出異常
      if (response?.status !== 401) {
        throw error;
      }
      // 判斷是否啟用了 refreshToken 功能
      // 如果沒有啟用或者是重試請求，直接跳轉到重新登入
      if (!enableRefreshToken || config.__isRetryRequest) {
        await doReAuthenticate();
        throw error;
      }
      // 如果正在重新整理 token，則將請求加入佇列，等待重新整理完成
      if (client.isRefreshing) {
        return new Promise((resolve) => {
          client.refreshTokenQueue.push((newToken: string) => {
            config.headers.Authorization = formatToken(newToken);
            resolve(client.request(config.url, { ...config }));
          });
        });
      }

      // 標記開始重新整理 token
      client.isRefreshing = true;
      // 標記當前請求為重試請求，避免無限循環
      config.__isRetryRequest = true;

      try {
        const newToken = await doRefreshToken();

        // 處理佇列中的請求
        client.refreshTokenQueue.forEach((callback) => callback(newToken));
        // 清空佇列
        client.refreshTokenQueue = [];

        return client.request(error.config.url, { ...error.config });
      } catch (refreshError) {
        // 如果重新整理 token 失敗，處理錯誤（如強制登出或跳轉登入頁面）
        client.refreshTokenQueue.forEach((callback) => callback(''));
        client.refreshTokenQueue = [];
        console.error('Refresh token failed, please login again.');
        await doReAuthenticate();

        throw refreshError;
      } finally {
        client.isRefreshing = false;
      }
    },
  };
};

export const errorMessageResponseInterceptor = (
  makeErrorMessage?: MakeErrorMessageFn,
): ResponseInterceptorConfig => {
  return {
    rejected: (error: any) => {
      if (axios.isCancel(error)) {
        return Promise.reject(error);
      }

      const err: string = error?.toString?.() ?? '';
      let errMsg = '';
      if (err?.includes('Network Error')) {
        errMsg = $t('ui.fallback.http.networkError');
      } else if (error?.message?.includes?.('timeout')) {
        errMsg = $t('ui.fallback.http.requestTimeout');
      }
      if (errMsg) {
        makeErrorMessage?.(errMsg, error);
        return Promise.reject(error);
      }

      let errorMessage = '';
      const status = error?.response?.status;

      switch (status) {
        case 400: {
          errorMessage = $t('ui.fallback.http.badRequest');
          break;
        }
        case 401: {
          errorMessage = $t('ui.fallback.http.unauthorized');
          break;
        }
        case 403: {
          errorMessage = $t('ui.fallback.http.forbidden');
          break;
        }
        case 404: {
          errorMessage = $t('ui.fallback.http.notFound');
          break;
        }
        case 408: {
          errorMessage = $t('ui.fallback.http.requestTimeout');
          break;
        }
        default: {
          errorMessage = $t('ui.fallback.http.internalServerError');
        }
      }
      makeErrorMessage?.(errorMessage, error);
      return Promise.reject(error);
    },
  };
};
