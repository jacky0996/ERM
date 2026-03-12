import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'lucide:clipboard-check',
      order: 10,
      title: '測試項目',
    },
    name: 'TestGroup',
    path: '/testing',
    redirect: '/testing/index',
    children: [
      {
        name: 'TestingIndex',
        path: 'index',
        component: () => import('#/views/guide/test-guide.vue'),
        meta: {
          icon: 'lucide:clipboard-check',
          title: '測試項目',
        },
      },
      {
        name: 'UMLView',
        path: 'uml',
        component: () => import('#/views/system/uml/index.vue'),
        meta: {
          icon: 'lucide:file-json-2',
          title: 'UML 展示',
        },
      },
    ],
  },
];

export default routes;
