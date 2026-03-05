import type {
  AccessModeType,
  AuthPageLayoutType,
  BreadcrumbStyleType,
  BuiltinThemeType,
  ContentCompactType,
  DeepPartial,
  LayoutHeaderMenuAlignType,
  LayoutHeaderModeType,
  LayoutType,
  LoginExpiredModeType,
  NavigationStyleType,
  PageTransitionType,
  PreferencesButtonPositionType,
  TabsStyleType,
  ThemeModeType,
} from '@vben-core/typings';

type SupportedLanguagesType = 'en-US' | 'zh-CN' | 'zh-TW';

interface AppPreferences {
  /** 權限模式 */
  accessMode: AccessModeType;
  /** 登入註冊頁面佈局 */
  authPageLayout: AuthPageLayoutType;
  /** 檢查更新輪詢時間 */
  checkUpdatesInterval: number;
  /** 是否開啟灰色模式 */
  colorGrayMode: boolean;
  /** 是否開啟色弱模式 */
  colorWeakMode: boolean;
  /** 是否開啟緊湊模式 */
  compact: boolean;
  /** 是否開啟內容緊湊模式 */
  contentCompact: ContentCompactType;
  /** 內容緊湊寬度 */
  contentCompactWidth: number;
  /** 內容內邊距 */
  contentPadding: number;
  /** 內容底部內邊距 */
  contentPaddingBottom: number;
  /** 內容左側內邊距 */
  contentPaddingLeft: number;
  /** 內容右側內邊距 */
  contentPaddingRight: number;
  /** 內容頂部內邊距 */
  contentPaddingTop: number;
  // /** 應用預設頭像 */
  defaultAvatar: string;
  /** 預設首頁位址 */
  defaultHomePath: string;
  // /** 開啟動態標題 */
  dynamicTitle: boolean;
  /** 是否開啟檢查更新 */
  enableCheckUpdates: boolean;
  /** 是否顯示偏好設定 */
  enablePreferences: boolean;
  /**
   * @zh_CN 是否開啟 refreshToken
   */
  enableRefreshToken: boolean;
  /**
   * @zh_CN 是否開啟首選項導航欄吸頂效果
   */
  enableStickyPreferencesNavigationBar: boolean;
  /** 是否行動端 */
  isMobile: boolean;
  /** 佈局方式 */
  layout: LayoutType;
  /** 支援的語言 */
  locale: SupportedLanguagesType;
  /** 登入過期模式 */
  loginExpiredMode: LoginExpiredModeType;
  /** 應用名 */
  name: string;
  /** 偏好設定按鈕位置 */
  preferencesButtonPosition: PreferencesButtonPositionType;
  /**
   * @zh_CN 是否開啟浮水印
   */
  watermark: boolean;
  /**
   * @zh_CN 浮水印文案
   */
  watermarkContent: string;
  /** z-index */
  zIndex: number;
}

interface BreadcrumbPreferences {
  /** 瀏覽路徑(導航)是否啟用 */
  enable: boolean;
  /** 瀏覽路徑(導航)是否只有一個時隱藏 */
  hideOnlyOne: boolean;
  /** 瀏覽路徑(導航)首頁圖示是否可見 */
  showHome: boolean;
  /** 瀏覽路徑(導航)圖示是否可見 */
  showIcon: boolean;
  /** 瀏覽路徑(導航)風格 */
  styleType: BreadcrumbStyleType;
}

interface CopyrightPreferences {
  /** 版權公司名 */
  companyName: string;
  /** 版權公司名連結 */
  companySiteLink: string;
  /** 版權日期 */
  date: string;
  /** 版權是否可見 */
  enable: boolean;
  /** 備案號 */
  icp: string;
  /** 備案號連結 */
  icpLink: string;
  /** 設定面板是否顯示*/
  settingShow?: boolean;
}

interface FooterPreferences {
  /** 底欄是否可見 */
  enable: boolean;
  /** 底欄是否固定 */
  fixed: boolean;
  /** 底欄高度 */
  height: number;
}

interface HeaderPreferences {
  /** 頂欄是否啟用 */
  enable: boolean;
  /** 頂欄高度 */
  height: number;
  /** 頂欄是否隱藏,css-隱藏 */
  hidden: boolean;
  /** 頂欄選單位置 */
  menuAlign: LayoutHeaderMenuAlignType;
  /** Header 顯示模式 */
  mode: LayoutHeaderModeType;
}

interface LogoPreferences {
  /** Logo 是否可見 */
  enable: boolean;
  /** Logo 圖片適應方式 */
  fit: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
  /** Logo 位址 */
  source: string;
  /** 深色主題 Logo 位址 (可選，若不設置則使用 source) */
  sourceDark?: string;
}

interface NavigationPreferences {
  /** 導航選單手風琴模式 */
  accordion: boolean;
  /** 導航選單是否分割，只在 layout=mixed-nav 生效 */
  split: boolean;
  /** 導航選單風格 */
  styleType: NavigationStyleType;
}

interface SidebarPreferences {
  /** 點擊目錄時自動激活子選單   */
  autoActivateChild: boolean;
  /** 側邊欄是否折疊 */
  collapsed: boolean;
  /** 側邊欄折疊按鈕是否可見 */
  collapsedButton: boolean;
  /** 側邊欄折疊時，是否顯示標題 */
  collapsedShowTitle: boolean;
  /** 側邊欄折疊寬度 */
  collapseWidth: number;
  /** 側邊欄是否可見 */
  enable: boolean;
  /** 選單自動展開狀態 */
  expandOnHover: boolean;
  /** 側邊欄擴展區域是否折疊 */
  extraCollapse: boolean;
  /** 側邊欄擴展區域折疊寬度 */
  extraCollapsedWidth: number;
  /** 側邊欄固定按鈕是否可見 */
  fixedButton: boolean;
  /** 側邊欄是否隱藏 - css */
  hidden: boolean;
  /** 混合側邊欄寬度 */
  mixedWidth: number;
  /** 側邊欄寬度 */
  width: number;
}

interface ShortcutKeyPreferences {
  /** 是否啟用快捷鍵 - 全域 */
  enable: boolean;
  /** 是否啟用全域鎖屏快捷鍵 */
  globalLockScreen: boolean;
  /** 是否啟用全域登出快捷鍵 */
  globalLogout: boolean;
  /** 是否啟用全域偏好設定快捷鍵 */
  globalPreferences: boolean;
  /** 是否啟用全域搜尋快捷鍵 */
  globalSearch: boolean;
}

interface TabbarPreferences {
  /** 是否開啟多頁籤拖曳 */
  draggable: boolean;
  /** 是否開啟多頁籤 */
  enable: boolean;
  /** 頁籤高度 */
  height: number;
  /** 開啟頁籤快取功能 */
  keepAlive: boolean;
  /** 限制最大數量 */
  maxCount: number;
  /** 是否點擊中鍵時關閉頁籤 */
  middleClickToClose: boolean;
  /** 是否持久化頁籤 */
  persist: boolean;
  /** 是否開啟多頁籤圖示 */
  showIcon: boolean;
  /** 顯示最大化按鈕 */
  showMaximize: boolean;
  /** 顯示更多按鈕 */
  showMore: boolean;
  /** 頁籤風格 */
  styleType: TabsStyleType;
  /** 是否開啟存取歷史紀錄 */
  visitHistory: boolean;
  /** 是否開啟滑鼠滾輪響應 */
  wheelable: boolean;
}

interface ThemePreferences {
  /** 內建主題名稱 */
  builtinType: BuiltinThemeType;
  /** 錯誤顏色 */
  colorDestructive: string;
  /** 主題顏色 */
  colorPrimary: string;
  /** 成功顏色 */
  colorSuccess: string;
  /** 警告顏色 */
  colorWarning: string;
  /** 字體大小（單位：px） */
  fontSize: number;
  /** 目前主題 */
  mode: ThemeModeType;
  /** 圓角 */
  radius: string;
  /** 是否開啟半深色頂欄（只在 theme='light' 時生效） */
  semiDarkHeader: boolean;
  /** 是否開啟半深色選單（只在 theme='light' 時生效） */
  semiDarkSidebar: boolean;
}

interface TransitionPreferences {
  /** 頁面切換動畫是否啟用 */
  enable: boolean;
  // /** 是否開啟頁面載入 Loading */
  loading: boolean;
  /** 頁面切換動畫 */
  name: PageTransitionType | string;
  /** 是否開啟頁面載入進度動畫 */
  progress: boolean;
}

interface WidgetPreferences {
  /** 是否啟用全螢幕部件 */
  fullscreen: boolean;
  /** 是否啟用全域搜尋部件 */
  globalSearch: boolean;
  /** 是否啟用語言切換部件 */
  languageToggle: boolean;
  /** 是否開啟鎖屏功能 */
  lockScreen: boolean;
  /** 是否顯示通知部件 */
  notification: boolean;
  /** 顯示重新整理按鈕 */
  refresh: boolean;
  /** 是否顯示側邊欄顯示/隱藏部件 */
  sidebarToggle: boolean;
  /** 是否顯示主題切換部件 */
  themeToggle: boolean;
  /** 是否顯示時區部件 */
  timezone: boolean;
}

interface Preferences {
  /** 全域設定 */
  app: AppPreferences;
  /** 瀏覽路徑(導覽)設定 */
  breadcrumb: BreadcrumbPreferences;
  /** 版權設定 */
  copyright: CopyrightPreferences;
  /** 底欄設定 */
  footer: FooterPreferences;
  /** 頂欄設定 */
  header: HeaderPreferences;
  /** Logo 設定 */
  logo: LogoPreferences;
  /** 導航設定 */
  navigation: NavigationPreferences;
  /** 快捷鍵設定 */
  shortcutKeys: ShortcutKeyPreferences;
  /** 側邊欄設定 */
  sidebar: SidebarPreferences;
  /** 多頁籤設定 */
  tabbar: TabbarPreferences;
  /** 主題設定 */
  theme: ThemePreferences;
  /** 動畫設定 */
  transition: TransitionPreferences;
  /** 功能設定 */
  widget: WidgetPreferences;
}

type PreferencesKeys = keyof Preferences;

interface InitialOptions {
  namespace: string;
  overrides?: DeepPartial<Preferences>;
}
export type {
  AppPreferences,
  BreadcrumbPreferences,
  FooterPreferences,
  HeaderPreferences,
  InitialOptions,
  LogoPreferences,
  NavigationPreferences,
  Preferences,
  PreferencesKeys,
  ShortcutKeyPreferences,
  SidebarPreferences,
  SupportedLanguagesType,
  TabbarPreferences,
  ThemePreferences,
  TransitionPreferences,
  WidgetPreferences,
};
