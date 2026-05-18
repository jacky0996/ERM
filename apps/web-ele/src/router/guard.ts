import type { Router } from 'vue-router';

import { LOGIN_PATH } from '@vben/constants';
import { preferences } from '@vben/preferences';
import { useAccessStore, useUserStore } from '@vben/stores';
import { startProgress, stopProgress } from '@vben/utils';

import { accessRoutes, coreRouteNames } from '#/router/routes';
import { useAuthStore } from '#/store';
import { isTokenExpired } from '#/utils/jwt';

import { generateAccess } from './access';

/**
 * 通用守衛設定
 * @param router
 */
function setupCommonGuard(router: Router) {
  // 紀錄已經載入的頁面
  const loadedPaths = new Set<string>();

  router.beforeEach((to) => {
    to.meta.loaded = loadedPaths.has(to.path);

    // 頁面載入進度條
    if (!to.meta.loaded && preferences.transition.progress) {
      startProgress();
    }
    return true;
  });

  router.afterEach((to) => {
    // 紀錄頁面是否載入,如果已經載入，後續的頁面切換動畫等效果不再重複執行

    loadedPaths.add(to.path);

    // 關閉頁面載入進度條
    if (preferences.transition.progress) {
      stopProgress();
    }
  });
}

/**
 * 權限存取守衛設定
 * @param router
 */
function setupAccessGuard(router: Router) {
  router.beforeEach(async (to, from) => {
    const accessStore = useAccessStore();
    const userStore = useUserStore();
    const authStore = useAuthStore();

    // SSO Token 攔截處理 (支援 token 與 hws_token 參數名)
    const ssoToken = (to.query.token || to.query.hws_token) as string;
    if (ssoToken) {
      // 構建不帶 Token 的新參數 (防止迴圈)
      const newQuery = { ...to.query };
      delete newQuery.token;
      delete newQuery.hws_token;

      const success = await authStore.ssoLogin(ssoToken);
      if (success) {
        console.log('[Guard] SSO 驗證成功，進入系統。');
        return { path: to.path, query: newQuery, replace: true };
      } else {
        console.error('[Guard] SSO 驗證失敗，10 秒後導回 HWS。');

        // --- 10 秒跳轉與訊息通知 ---
        import('element-plus').then(({ ElMessage }) => {
          ElMessage.error('SSO 驗證失敗，將在 10 秒後導回核心系統首頁。');
        });

        await new Promise((resolve) => setTimeout(resolve, 10_000));

        const hwsUrl = import.meta.env.VITE_HWS_URL;
        window.location.href = `${hwsUrl}login`;
        return false;
      }
    }

    // accessToken 檢查 — 缺 token 或 token 已過期都視為未登入
    const tokenExpired = isTokenExpired(accessStore.accessToken);
    if (!accessStore.accessToken || tokenExpired) {
      // 明確宣告忽略權限存取權限，則可以存取
      if (to.meta.ignoreAccess) {
        return true;
      }

      // token 過期但本地仍有殘留 → 清掉 store + localStorage,避免下一次又誤用
      if (tokenExpired && accessStore.accessToken) {
        console.warn('[Guard] Access token 已過期,清除並導回 SSO');
        accessStore.setAccessToken(null);
        localStorage.removeItem('ACCESS_TOKEN_USER_INFO');
      }

      // 如果沒有 Token,直接導向 HWS Login 頁面
      const hwsUrl = import.meta.env.VITE_HWS_URL;
      const redirect = encodeURIComponent(window.location.href);
      window.location.href = `${hwsUrl}login?redirect=${redirect}`;
      return false;
    }

    // 基本路由，這些路由不需要進入權限攔截
    // (此時已確認有 Token)
    if (coreRouteNames.includes(to.name as string)) {
      if (to.path === LOGIN_PATH) {
        return decodeURIComponent(
          (to.query?.redirect as string) ||
            userStore.userInfo?.homePath ||
            preferences.app.defaultHomePath,
        );
      }
      return true;
    }

    // 是否已經生成過動態路由
    if (accessStore.isAccessChecked) {
      return true;
    }

    // 生成路由表
    // 當前登入使用者擁有的角色標識列表
    const userInfo = userStore.userInfo || (await authStore.fetchUserInfo());
    const userRoles = userInfo.roles ?? [];

    // 生成選單和路由
    const { accessibleMenus, accessibleRoutes } = await generateAccess({
      roles: userRoles,
      router,
      // 則會在選單中顯示，但是存取會被重新導向到 403
      routes: accessRoutes,
    });

    // 儲存選單資訊和路由資訊
    accessStore.setAccessMenus(accessibleMenus);
    accessStore.setAccessRoutes(accessibleRoutes);
    accessStore.setIsAccessChecked(true);
    const redirectPath = (from.query.redirect ??
      (to.path === preferences.app.defaultHomePath
        ? userInfo.homePath || preferences.app.defaultHomePath
        : to.fullPath)) as string;

    return {
      ...router.resolve(decodeURIComponent(redirectPath)),
      replace: true,
    };
  });
}

/**
 * 專案守衛設定
 * @param router
 */
function createRouterGuard(router: Router) {
  /** 通用 */
  setupCommonGuard(router);
  /** 權限存取 */
  setupAccessGuard(router);
}

export { createRouterGuard };
