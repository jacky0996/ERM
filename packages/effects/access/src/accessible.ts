import type { Component, DefineComponent } from 'vue';

import type {
  AccessModeType,
  GenerateMenuAndRoutesOptions,
  RouteRecordRaw,
} from '@vben/types';

import { defineComponent, h } from 'vue';

import {
  cloneDeep,
  generateMenus,
  generateRoutesByBackend,
  generateRoutesByFrontend,
  isFunction,
  isString,
  mapTree,
} from '@vben/utils';

async function generateAccessible(
  mode: AccessModeType,
  options: GenerateMenuAndRoutesOptions,
) {
  const { router } = options;

  options.routes = cloneDeep(options.routes);
  // 生成路由
  const accessibleRoutes = await generateRoutes(mode, options);

  const root = router.getRoutes().find((item) => item.path === '/');

  // 獲取已有的路由名稱列表
  const names = root?.children?.map((item) => item.name) ?? [];

  // 動態添加到 router 實例內
  accessibleRoutes.forEach((route) => {
    if (root && !route.meta?.noBasicLayout) {
      // 為了相容之前的版本用法，如果包含子路由，則將 component 移除，以免出現多層 BasicLayout
      // 如果您的專案已經跟進了本次修改，移除了所有自定義選單首層的 BasicLayout，可以將這段 if 程式碼刪除
      if (route.children && route.children.length > 0) {
        delete route.component;
      }
      // 根據 router name 判斷，如果路由已經存在，則不再添加
      if (names?.includes(route.name)) {
        // 找到已存在的路由索引並更新，不更新會造成切換使用者時，一級目錄未更新，homePath 在二級目錄導致的 404 問題
        const index = root.children?.findIndex(
          (item) => item.name === route.name,
        );
        if (index !== undefined && index !== -1 && root.children) {
          root.children[index] = route;
        }
      } else {
        root.children?.push(route);
      }
    } else {
      router.addRoute(route);
    }
  });

  if (root) {
    if (root.name) {
      router.removeRoute(root.name);
    }
    router.addRoute(root);
  }

  // 生成選單
  const accessibleMenus = generateMenus(accessibleRoutes, options.router);

  return { accessibleMenus, accessibleRoutes };
}

/**
 * Generate routes
 * @param mode
 * @param options
 */
async function generateRoutes(
  mode: AccessModeType,
  options: GenerateMenuAndRoutesOptions,
) {
  const { forbiddenComponent, roles, routes } = options;

  let resultRoutes: RouteRecordRaw[] = routes;
  switch (mode) {
    case 'backend': {
      resultRoutes = await generateRoutesByBackend(options);
      break;
    }
    case 'frontend': {
      resultRoutes = await generateRoutesByFrontend(
        routes,
        roles || [],
        forbiddenComponent,
      );
      break;
    }
    case 'mixed': {
      const [frontend_resultRoutes, backend_resultRoutes] = await Promise.all([
        generateRoutesByFrontend(routes, roles || [], forbiddenComponent),
        generateRoutesByBackend(options),
      ]);

      resultRoutes = [...frontend_resultRoutes, ...backend_resultRoutes];
      break;
    }
  }

  /**
   * 調整路由樹，進行以下處理：
   * 1. 對未添加 redirect 的路由添加 redirect
   * 2. 將懶加載的組件名稱修改為當前路由的名稱（如果啟用了 keep-alive 的話）
   */
  resultRoutes = mapTree(resultRoutes, (route) => {
    // 重新包裝 component，使用與路由名稱相同的 name 以支援 keep-alive 的條件快取。
    if (
      route.meta?.keepAlive &&
      isFunction(route.component) &&
      route.name &&
      isString(route.name)
    ) {
      const originalComponent = route.component as () => Promise<{
        default: Component | DefineComponent;
      }>;
      route.component = async () => {
        const component = await originalComponent();
        if (!component.default) return component;
        return defineComponent({
          name: route.name as string,
          setup(props, { attrs, slots }) {
            return () => h(component.default, { ...props, ...attrs }, slots);
          },
        });
      };
    }

    // 如果有 redirect 或者沒有子路由，則直接回傳
    if (route.redirect || !route.children || route.children.length === 0) {
      return route;
    }
    const firstChild = route.children[0];

    // 如果子路由不是以 / 開頭，則直接回傳,這種情況需要計算全部父層的 path 才能得出正確的 path，這裡不做處理
    if (!firstChild?.path || !firstChild.path.startsWith('/')) {
      return route;
    }

    route.redirect = firstChild.path;
    return route;
  });

  return resultRoutes;
}

export { generateAccessible };
