import { baseRequestClient, requestClient, ssoRequestClient } from '#/api/request';

export namespace AuthApi {
  /** 登入參數 */
  export interface LoginParams {
    password?: string;
    username?: string;
  }

  /** 登入結果 */
  export interface LoginResult {
    accessToken: string;
  }

  export interface RefreshTokenResult {
    data: string;
    status: number;
  }

  /** SSO 驗證結果 */
  export interface SsoResult {
    accessToken: string;
    userInfo: any;
  }
}

/**
 * 登入
 */
export async function loginApi(data: AuthApi.LoginParams) {
  return requestClient.post<AuthApi.LoginResult>('/auth/login', data);
}

/**
 * 刷新 Access Token
 */
export async function refreshTokenApi() {
  return baseRequestClient.post<AuthApi.RefreshTokenResult>('/auth/refresh', {
    withCredentials: true,
  });
}

/**
 * 登出
 */
export async function logoutApi() {
  return baseRequestClient.post('/auth/logout', {
    withCredentials: true,
  });
}

/**
 * 獲取使用者權限碼
 */
export async function getAccessCodesApi() {
  return requestClient.get<string[]>('/auth/codes');
}

/**
 * 驗證 SSO Token
 * 使用 baseRequestClient 以避免在 Token 過期時觸發全域 401 登出
 */
export async function verifySsoTokenApi(token: string) {
  return ssoRequestClient.post<AuthApi.SsoResult>('/edm/sso/verify-token', {
    token,
  });
}
