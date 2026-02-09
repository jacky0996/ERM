import type { RouteRecordRaw } from 'vue-router';

import { BasicLayout } from '#/layouts';

const routes: RouteRecordRaw[] = [
  // 系統設定
  {
    component: BasicLayout,
    meta: {
      icon: 'lucide:settings-2',
      order: 50,
      title: '系統設定',
      authority: ['super', 'admin', 'tag_read', 'template_read'],
    },
    name: 'SystemSettingsGroup',
    path: '/system-settings',
    children: [
      {
        name: 'TagList',
        path: 'tag/list',
        component: () => import('#/views/tag/list/index.vue'),
        meta: {
          title: '標籤管理',
          authority: ['super', 'admin', 'tag_read'],
        },
      },
      {
        name: 'TemplateList',
        path: 'template/list',
        component: () => import('#/views/template/list/index.vue'),
        meta: {
          title: '模板管理',
          authority: ['super', 'admin', 'template_read'],
        },
      },
    ],
  },
];

export default routes;
