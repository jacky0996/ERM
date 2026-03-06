import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'lucide:book-open',
      order: -1,
      title: '使用說明',
      hideChildrenInMenu: true, // 隱藏子選單，使根節點成為單一可點擊項目
    },
    name: 'Dashboard',
    path: '/dashboard',
    redirect: '/analytics',
    children: [
      {
        name: 'Analytics',
        path: '/analytics',
        component: () => import('#/views/guide/index.vue'), // 暫時替換為使用說明頁面
        meta: {
          affixTab: true,
          icon: 'lucide:book-open',
          title: '使用說明',
        },
      },
      {
        name: 'Workspace',
        path: '/workspace',
        component: () => import('#/views/dashboard/workspace/index.vue'),
        meta: {
          hideInMenu: true,
          icon: 'carbon:workspace',
          title: '工作台',
        },
      },
    ],
  },
];

export default routes;
