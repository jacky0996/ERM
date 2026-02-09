import type { RouteRecordRaw } from 'vue-router';

import { BasicLayout } from '#/layouts';

const routes: RouteRecordRaw[] = [
  // 活動管理
  {
    component: BasicLayout,
    meta: {
      icon: 'lucide:calendar-days',
      order: 10,
      title: '活動管理',
      authority: ['super', 'admin', 'event_read'],
    },
    name: 'EventManagementGroup',
    path: '/event-management',
    children: [
      {
        name: 'EventCreate',
        path: 'create',
        component: () => import('#/views/event/create/index.vue'),
        meta: {
          title: '建立活動',
          authority: ['super', 'admin', 'event_create'],
        },
      },
      {
        name: 'EventList',
        path: 'list',
        component: () => import('#/views/event/list/index.vue'),
        meta: {
          title: '活動列表',
          authority: ['super', 'admin', 'event_read'],
        },
      },
      {
        name: 'EventPrivacy',
        path: 'privacy',
        component: () => import('#/views/event/privacy/index.vue'),
        meta: {
          title: '個資聲明',
          authority: ['super', 'admin', 'event_create'],
        },
      },
      {
        name: 'BannerManagement',
        path: 'banner',
        component: () => import('#/views/banner/index.vue'),
        meta: {
          title: '橫幅廣告',
          authority: ['super', 'admin', 'banner_read'],
        },
      },
    ],
  },
  // 行銷管理
  {
    component: BasicLayout,
    meta: {
      icon: 'lucide:mail',
      order: 40,
      title: '行銷管理',
      authority: [
        'super',
        'admin',
        'edm_read',
        'edm_create',
        'sms_read',
        'sms_create',
      ],
    },
    name: 'MarketingManagementGroup',
    path: '/marketing-management',
    children: [
      {
        name: 'SendEDM',
        path: 'send-edm',
        component: () => import('#/views/marketing/send-edm/index.vue'),
        meta: {
          title: '發送 EDM',
          authority: ['super', 'admin', 'edm_create'],
        },
      },
      {
        name: 'EDMList',
        path: 'edm-list',
        component: () => import('#/views/marketing/edm-list/index.vue'),
        meta: {
          title: '信件列表',
          authority: ['super', 'admin', 'edm_read'],
        },
      },
      {
        name: 'SendSMS',
        path: 'send-sms',
        component: () => import('#/views/marketing/send-sms/index.vue'),
        meta: {
          title: '發送 SMS',
          authority: ['super', 'admin', 'sms_create'],
        },
      },
      {
        name: 'SMSList',
        path: 'sms-list',
        component: () => import('#/views/marketing/sms-list/index.vue'),
        meta: {
          title: '簡訊列表',
          authority: ['super', 'admin', 'sms_read'],
        },
      },
      {
        name: 'MailSender',
        path: 'mail-sender',
        component: () => import('#/views/marketing/mail-sender/index.vue'),
        meta: {
          title: '寄件者管理',
          authority: ['super', 'admin', 'sender_read'],
        },
      },
    ],
  },
];

export default routes;
