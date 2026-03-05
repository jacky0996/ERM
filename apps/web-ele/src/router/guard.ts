import type { Router } from 'vue-router';

import { LOGIN_PATH } from '@vben/constants';
import { preferences } from '@vben/preferences';
import { useAccessStore, useUserStore } from '@vben/stores';
import { startProgress, stopProgress } from '@vben/utils';

import { accessRoutes, coreRouteNames } from '#/router/routes';
import { useAuthStore } from '#/store';

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

    // SSO Token 攔截處理 (優先處理網址帶 Token 的情況)
    const token = to.query.token as string;
    if (token) {
      const success = await authStore.ssoLogin(token);
      if (success) {
        // 驗證成功，移除網址上的 token 參數並重導向至原路徑
        const newQuery = { ...to.query };
        delete newQuery.token;
        return { path: to.path, query: newQuery, replace: true };
      }
    }

    // accessToken 檢查
    if (!accessStore.accessToken) {
      // 明確宣告忽略權限存取權限，則可以存取
      if (to.meta.ignoreAccess) {
        return true;
      }

      // [核心修正] 如果沒有 Token，則直接導向 HWS (不帶複雜的 redirect 參數)
      const hwsUrl = import.meta.env.VITE_HWS_URL;
      window.location.href = `${hwsUrl}login`;
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
