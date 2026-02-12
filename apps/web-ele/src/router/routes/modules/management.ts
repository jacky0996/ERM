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
    },
    name: 'GroupManagementSingle',
    path: '/group',
    children: [
      {
        name: 'GroupList',
        path: 'list',
        component: () => import('#/views/group/list/index.vue'),
        meta: {
          title: '群組管理',
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
    },
    name: 'MemberManagementSingle',
    path: '/member',
    children: [
      {
        name: 'MemberList',
        path: 'list',
        component: () => import('#/views/member/index.vue'),
        meta: {
          title: '人員管理',
        },
      },
    ],
  },
];

export default routes;
