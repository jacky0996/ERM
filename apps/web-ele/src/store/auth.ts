import type { Recordable, UserInfo } from '@vben/types';

import { ref } from 'vue';
import { useRouter } from 'vue-router';

import { LOGIN_PATH } from '@vben/constants';
import { preferences } from '@vben/preferences';
import { resetAllStores, useAccessStore, useUserStore } from '@vben/stores';

import { ElNotification } from 'element-plus';
import { defineStore } from 'pinia';

import {
  getAccessCodesApi,
  getUserInfoApi,
  loginApi,
  logoutApi,
  verifySsoTokenApi,
} from '#/api';
import { $t } from '#/locales';

export const useAuthStore = defineStore('auth', () => {
  const accessStore = useAccessStore();
  const userStore = useUserStore();
  const router = useRouter();

  const loginLoading = ref(false);

  /**
   * 非同步處理登入操作
   * Asynchronously handle the login process
   * @param params 登入表單資料
   */
  async function authLogin(
    params: Recordable<any>,
    onSuccess?: () => Promise<void> | void,
  ) {
    // 非同步處理使用者登入操作並獲取 accessToken
    let userInfo: null | UserInfo = null;
    try {
      loginLoading.value = true;
      const { accessToken } = await loginApi(params);

      // 如果成功獲取到 accessToken
      if (accessToken) {
        // 將 accessToken 儲存到 accessStore 中
        accessStore.setAccessToken(accessToken);

        // 獲取使用者資訊並儲存到 accessStore 中
        const [fetchUserInfoResult, accessCodes] = await Promise.all([
          fetchUserInfo(),
          getAccessCodesApi(),
        ]);

        userInfo = fetchUserInfoResult;

        userStore.setUserInfo(userInfo);
        accessStore.setAccessCodes(accessCodes);

        if (accessStore.loginExpired) {
          accessStore.setLoginExpired(false);
        } else {
          onSuccess
            ? await onSuccess?.()
            : await router.push(
                userInfo?.homePath || preferences.app.defaultHomePath,
              );
        }

        if (userInfo?.realName) {
          ElNotification({
            message: `${$t('authentication.loginSuccessDesc')}:${userInfo?.realName}`,
            title: $t('authentication.loginSuccess'),
            type: 'success',
          });
        }
      }
    } finally {
      loginLoading.value = false;
    }

    return {
      userInfo,
    };
  }

  /**
   * 處理 SSO 登入 (Token 交換) - 安全重試 10 次版
   * @param token 來自 URL 的 SSO Token
   */
  async function ssoLogin(token: string) {
    const maxRetries = 10;
    const retryInterval = 1000;
    let retryCount = 0;

    while (retryCount < maxRetries) {
      try {
        loginLoading.value = true;
        const res: any = await verifySsoTokenApi(token);
        console.log('[SSO Debug] 原始回傳內容：', res);

        // --- 多層級相容性處理 ---
        // 1. 判斷是否為 Axios Response 物件 (如果是，取其 .data)
        const jsonRoot = res?.status !== undefined ? res.data : res;
        
        // 2. 判斷 payload 位址 (有些結構會把 Token 放在 jsonRoot.data 裡面)
        const payload = (jsonRoot?.data?.accessToken) ? jsonRoot.data : jsonRoot;

        // 成功判定：檢查 code 是否為 0 且 payload 裡擁有 accessToken
        if (jsonRoot && jsonRoot.code === 0 && payload?.accessToken) {
          accessStore.setAccessToken(payload.accessToken);

          // 從 payload 抓取使用者資訊
          const userInfo = payload.userInfo || payload.data?.userInfo;
          
          if (userInfo) {
            userStore.setUserInfo({
              ...userInfo,
              username: userInfo.realName || userInfo.name || 'User',
            });

            localStorage.setItem('edm_last_activity', Date.now().toString());
            console.log(`[SSO] 驗證成功 (第 ${retryCount + 1} 次嘗試)`);
            return true;
          }
          throw new Error('回傳中找不到使用者資訊 (userInfo)');
        }
        
        throw new Error(`驗證未通過 (Code: ${jsonRoot?.code}, Message: ${jsonRoot?.message})`);
      } catch (error: any) {
        retryCount++;
        console.warn(`[SSO] 驗證失敗 (嘗試 ${retryCount}/${maxRetries}):`, error.message || error);

        if (retryCount >= maxRetries) {
          return false;
        }
        await new Promise((resolve) => setTimeout(resolve, retryInterval));
      } finally {
        loginLoading.value = false;
      }
    }
    return false;
  }

  async function logout(redirect: boolean = true) {
    try {
      await logoutApi();
    } catch {
      // 不做任何處理
    }
    resetAllStores();
    accessStore.setLoginExpired(false);

    // 回登入頁帶上當前路由位址
    await router.replace({
      path: LOGIN_PATH,
      query: redirect
        ? {
            redirect: encodeURIComponent(router.currentRoute.value.fullPath),
          }
        : {},
    });
  }

  async function fetchUserInfo() {
    // 優化：如果 store 中已經有使用者資訊，則不再重複呼叫 API
    if (userStore.userInfo && (userStore.userInfo as any).userId) {
      console.log('[Auth] 使用快取中的使用者資訊，略過 API 請求。');
      return userStore.userInfo as UserInfo;
    }

    let userInfo: null | UserInfo = null;
    userInfo = await getUserInfoApi();
    userStore.setUserInfo(userInfo);
    return userInfo;
  }

  function $reset() {
    loginLoading.value = false;
  }

  return {
    $reset,
    authLogin,
    fetchUserInfo,
    loginLoading,
    logout,
    ssoLogin,
  };
});
