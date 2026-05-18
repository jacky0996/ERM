import { createApp, watchEffect } from 'vue';

import { registerAccessDirective } from '@vben/access';
import { registerLoadingDirective } from '@vben/common-ui';
import { preferences } from '@vben/preferences';
import { initStores } from '@vben/stores';
import '@vben/styles';
import '@vben/styles/ele';

import { useTitle } from '@vueuse/core';
import { ElLoading } from 'element-plus';

import { $t, setupI18n } from '#/locales';

import { initComponentAdapter } from './adapter/component';
import { initSetupVbenForm } from './adapter/form';
import App from './app.vue';
import { router } from './router';

async function bootstrap(namespace: string) {
  // 初始化组件适配器
  await initComponentAdapter();

  // 初始化表单组件
  await initSetupVbenForm();

  // // 设置弹窗的默认配置
  // setDefaultModalProps({
  //   fullscreenButton: false,
  // });
  // // 设置抽屉的默认配置
  // setDefaultDrawerProps({
  //   zIndex: 2000,
  // });
  const app = createApp(App);

  // 注册Element Plus提供的v-loading指令
  app.directive('loading', ElLoading.directive);

  // 注册Vben提供的v-loading和v-spinning指令
  registerLoadingDirective(app, {
    loading: false, // Vben提供的v-loading指令和Element Plus提供的v-loading指令二选一即可，此处false表示不注册Vben提供的v-loading指令
    spinning: 'spinning',
  });

  // 国际化 i18n 配置
  await setupI18n(app);

  // 配置 pinia-tore
  await initStores(app, { namespace });

  // SSO 閒置 + JWT 過期檢查定時器
  const storeModule = await import('#/store');
  const authStore = storeModule.useAuthStore();
  const { useAccessStore } = await import('@vben/stores');
  const { isTokenExpired } = await import('#/utils/jwt');

  setInterval(() => {
    // 1. JWT 主動過期偵測 — 即使使用者停在頁面不動,token 一過期就跳走
    const accessStore = useAccessStore();
    if (accessStore.accessToken && isTokenExpired(accessStore.accessToken)) {
      console.warn('[Idle Check] Access token 已過期,自動登出');
      authStore.logout();
      return;
    }

    // 2. 閒置 30 分鐘登出
    const lastActivity = Number.parseInt(
      localStorage.getItem('edm_last_activity') || '0',
    );
    if (!lastActivity) return;
    if (Date.now() - lastActivity > 30 * 60 * 1000) {
      authStore.logout();
    }
  }, 60_000); // 每分鐘檢查一次

  // 安装权限指令
  registerAccessDirective(app);

  // 初始化 tippy
  const { initTippy } = await import('@vben/common-ui/es/tippy');
  initTippy(app);

  // 配置路由及路由守卫
  app.use(router);

  // 配置Motion插件
  const { MotionPlugin } = await import('@vben/plugins/motion');
  app.use(MotionPlugin);

  // 动态更新标题
  watchEffect(() => {
    if (preferences.app.dynamicTitle) {
      const routeTitle = router.currentRoute.value.meta?.title;
      const pageTitle =
        (routeTitle ? `${$t(routeTitle)} - ` : '') + preferences.app.name;
      useTitle(pageTitle);
    }
  });

  app.mount('#app');
}

export { bootstrap };
