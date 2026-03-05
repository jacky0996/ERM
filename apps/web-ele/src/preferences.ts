import { defineOverridesPreferences } from '@vben/preferences';

/**
 * @description 專案設定檔
 * 只需要覆蓋專案中的一部分設定，不需要的設定不用覆蓋，會自動使用預設設定
 * !!! 更改設定後請清空快取，否則可能不生效
 */
export const overridesPreferences = defineOverridesPreferences({
  // overrides
  app: {
    name: import.meta.env.VITE_APP_TITLE,
  },
  widget: {
    fullscreen: false,
    languageToggle: false,
    timezone: false,
    lockScreen: false,
  },
});
