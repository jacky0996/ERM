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
   * 處理 SSO 登入 (Token 交換)
   * @param token 來自 URL 的 SSO Token
   */
  /**
   * 處理 SSO 登入 (Token 交換)
   * @param token 來自 URL 的 SSO Token
   */
  async function ssoLogin(token: string) {
    try {
      loginLoading.value = true;
      // 這裡回傳的是整包 JSON (因為 requestClient 設定了 responseReturn: 'raw')
      const res: any = await verifySsoTokenApi(token);

      // 直接檢查大包 JSON (code: 0 或 success: true，且必須有 accessToken)
      if (res && (res.code === 0 || res.success) && res.accessToken) {
        // 儲存由核心系統簽發的 JWT Token
        accessStore.setAccessToken(res.accessToken);

        // 整理使用者資訊
        const userInfo = res.data;
        userStore.setUserInfo({
          userId:     String(userInfo.uid),
          username:   userInfo.name,
          realName:   userInfo.name,
          email:      userInfo.email,
          department: userInfo.department,
          avatar:     '',
          roles:      [],
        });

        // 紀錄活動時間與日誌
        localStorage.setItem('edm_last_activity', Date.now().toString());
        console.log('[SSO] 驗證成功，進入系統。');
        return true;
      }
      
      throw new Error('未取得授權回傳或回傳碼錯誤');
    } catch (error: any) {
      console.error('[SSO] 驗證過程出錯：', error);
      // 如果暫時沒有 ElMessage，可以用 console.error 或是 alert 替代，
      // 但強烈建議後續加上通知 UI。
      return false;
    } finally {
      loginLoading.value = false;
    }
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
