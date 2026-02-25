import type { RouteRecordRaw } from 'vue-router';

import { BasicLayout } from '#/layouts';

const routes: RouteRecordRaw[] = [
  // 群組管理 - 單獨項
  {
    component: BasicLayout,
    meta: {
      icon: 'lucide:users-round',
      order: 20,
      title: '群組管理',
      authority: ['super', 'admin', 'group_read'],
      hideChildrenInMenu: true,
    },
    name: 'GroupManagementSingle',
    path: '/group',
    redirect: '/group/list',
    children: [
      {
        name: 'GroupList',
        path: 'list',
        component: () => import('#/views/group/list/index.vue'),
        meta: {
          title: '群組管理',
        },
      },
      {
        name: 'GroupDetail',
        path: 'detail/:id',
        component: () => import('#/views/group/list/index.vue'),
        meta: {
          hideInMenu: true,
          title: '群組詳情',
        },
      },
    ],
  },

  // 人員管理 - 單獨項
  {
    component: BasicLayout,
    meta: {
      icon: 'lucide:user',
      order: 30,
      title: '人員管理',
      authority: ['super', 'admin', 'member_read'],
      hideChildrenInMenu: true,
    },
    name: 'MemberManagementSingle',
    path: '/member',
    redirect: '/member/list',
    children: [
      {
        name: 'MemberList',
        path: 'list',
        component: () => import('#/views/member/index.vue'),
        meta: {
          title: '人員管理',
        },
      },
      {
        name: 'MemberDetail',
        path: 'detail/:id',
        component: () => import('#/views/member/detail.vue'),
        meta: {
          hideInMenu: true,
          title: '人員詳情',
        },
      },
    ],
  },
];

export default routes;
