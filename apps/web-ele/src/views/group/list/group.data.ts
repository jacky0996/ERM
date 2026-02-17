import type { VbenFormProps } from '#/adapter/form';
import type { VxeTableGridOptions } from '#/adapter/vxe-table';

import { h } from 'vue';

import { ElTag } from 'element-plus';

interface RowType {
  id: string;
  groupName: string;
  memberCount: number;
  activityTime: string;
  status: number;
  createdAt: string;
}

/**
 * 狀態對應表
 */
const STATUS_MAP = {
  0: { label: '已禁用', type: 'danger' },
  1: { label: '已啟用', type: 'success' },
} as const;

const formOptions: VbenFormProps = {
  collapsed: false,
  schema: [
    {
      component: 'Input',
      fieldName: 'groupName',
      label: '群組名稱',
      componentProps: {
        placeholder: '請輸入群組名稱',
      },
    },
    {
      component: 'Select',
      fieldName: 'status',
      label: '狀態',
      componentProps: {
        options: [
          { label: STATUS_MAP[1].label, value: 1 },
          { label: STATUS_MAP[0].label, value: 0 },
        ],
        placeholder: '請選擇狀態',
      },
    },
  ],
  // 是否在字段值改變時提交表單
  submitOnChange: true,
  // 按下回車時是否提交表單
  submitOnEnter: true,
};

// 假資料
const mockGroupData: RowType[] = [
  {
    id: '1',
    groupName: '春節促銷活動-群組',
    memberCount: 1250,
    activityTime: '2026-02-01',
    status: 1,
    createdAt: '2026-01-15',
  },
  {
    id: '2',
    groupName: '會員回饋計畫-群組',
    memberCount: 3500,
    activityTime: '2026-03-10',
    status: 1,
    createdAt: '2026-01-20',
  },
  {
    id: '3',
    groupName: '新品上市通知-群組',
    memberCount: 2100,
    activityTime: '2026-02-28',
    status: 1,
    createdAt: '2026-01-25',
  },
  {
    id: '4',
    groupName: '季末清倉活動-群組',
    memberCount: 890,
    activityTime: '2026-03-31',
    status: 1,
    createdAt: '2026-02-01',
  },
  {
    id: '5',
    groupName: '舊活動群組-群組',
    memberCount: 450,
    activityTime: '2025-12-31',
    status: 0,
    createdAt: '2025-11-10',
  },
];

const gridOptions: VxeTableGridOptions<RowType> = {
  checkboxConfig: {
    highlight: true,
  },
  columns: [
    { title: '序號', type: 'seq', width: 60 },
    { field: 'groupName', title: '群組名稱', minWidth: 150 },
    {
      field: 'memberCount',
      title: '人數',
      width: 100,
      align: 'center',
    },
    {
      field: 'activityTime',
      title: '活動時間',
      minWidth: 120,
    },
    {
      field: 'status',
      title: '狀態',
      width: 100,
      slots: {
        default: ({ row }) => {
          const statusConfig =
            STATUS_MAP[row.status as keyof typeof STATUS_MAP] || STATUS_MAP[0];
          return h(
            ElTag,
            { type: statusConfig.type },
            { default: () => statusConfig.label },
          );
        },
      },
    },
    { field: 'createdAt', title: '建立時間', minWidth: 120 },
  ],
  height: 'auto',
  keepSource: true,
  pagerConfig: {},
  proxyConfig: {
    ajax: {
      query: async ({ page }) => {
        // 暫時使用假資料，後續替換為真實 API
        const startIndex = (page.currentPage - 1) * page.pageSize;
        const endIndex = startIndex + page.pageSize;
        const items = mockGroupData.slice(startIndex, endIndex);
        const total = mockGroupData.length;

        return {
          items,
          total,
        };
      },
    },
  },
  toolbarConfig: {
    custom: true,
    refresh: true,
    zoom: true,
  },
};

export { formOptions, gridOptions };
export type { RowType };
