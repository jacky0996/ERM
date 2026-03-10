import type { VbenFormProps } from '#/adapter/form';
import type { VxeTableGridOptions } from '#/adapter/vxe-table';

import { h } from 'vue';
import { ElTag, ElLink } from 'element-plus';
import { formatDateTime } from '#/utils/date';
import { getEventListApi } from '#/api/event';

interface RowType {
  id: number;
  title: string;
  status: number;
  start_time: string | null;
  end_time: string | null;
  landmark: string | null;
  schedule_at: string | null;
  created_at: string;
}

const STATUS_MAP = {
  0: { label: '草稿', type: 'info' },
  1: { label: '處理中', type: 'warning' },
  2: { label: '已完成', type: 'success' },
  3: { label: '失敗', type: 'danger' },
} as const;

export const formOptions: VbenFormProps = {
  collapsed: false,
  schema: [
    {
      component: 'Input',
      fieldName: 'title',
      label: '活動名稱',
      componentProps: {
        placeholder: '請輸入活動名稱',
        clearable: true,
      },
    },
    {
      component: 'Select',
      fieldName: 'status',
      label: '活動狀態',
      componentProps: {
        clearable: true,
        options: [
          { label: STATUS_MAP[0].label, value: 0 },
          { label: STATUS_MAP[1].label, value: 1 },
          { label: STATUS_MAP[2].label, value: 2 },
          { label: STATUS_MAP[3].label, value: 3 },
        ],
        placeholder: '請選擇狀態',
      },
    },
  ],
  submitOnChange: true,
  submitOnEnter: true,
};

export const gridOptions: VxeTableGridOptions<RowType> = {
  columns: [
    { title: '序號', type: 'seq', width: 60 },
    {
      field: 'title',
      title: '活動名稱',
      minWidth: 150,
      slots: {
        default: ({ row }) => {
          return h(
            ElLink,
            { type: 'primary' },
            { default: () => row.title }
          );
        },
      },
    },
    {
      field: 'status',
      title: '發送狀態',
      width: 120,
      slots: {
        default: ({ row }) => {
          const statusConfig = STATUS_MAP[row.status as keyof typeof STATUS_MAP] || STATUS_MAP[0];
          return h(ElTag, { type: statusConfig.type }, { default: () => statusConfig.label });
        },
      },
    },
    {
      field: 'start_time',
      title: '開始時間',
      minWidth: 160,
      slots: {
        default: ({ row }) => {
          return row.start_time ? formatDateTime(row.start_time) : '-';
        },
      },
    },
    {
      field: 'end_time',
      title: '結束時間',
      minWidth: 160,
      slots: {
        default: ({ row }) => {
          return row.end_time ? formatDateTime(row.end_time) : '-';
        },
      },
    },
    {
      field: 'landmark',
      title: '活動地標',
      minWidth: 150,
      slots: {
        default: ({ row }) => {
          return row.landmark ?? '-';
        },
      },
    },
    {
      field: 'schedule_at',
      title: '排程時間',
      minWidth: 160,
      slots: {
        default: ({ row }) => {
          return row.schedule_at ? formatDateTime(row.schedule_at) : '即時發送';
        },
      },
    },
    {
      field: 'created_at',
      title: '建立時間',
      minWidth: 160,
      slots: {
        default: ({ row }) => {
          return formatDateTime(row.created_at);
        },
      },
    },
  ],
  height: 'auto',
  keepSource: true,
  pagerConfig: {},
  proxyConfig: {
    ajax: {
      query: async ({ page }, formValues) => {
        const params = {
          page: page.currentPage,
          pageSize: page.pageSize,
          ...formValues,
        };
        try {
          const res = await getEventListApi(params);
          const items = res.items ?? [];
          const total = res.total !== undefined ? res.total : items.length;
          return { items, total };
        } catch (error) {
          console.error('Event list API failed:', error);
          return { items: [], total: 0 };
        }
      },
    },
  },
  toolbarConfig: {
    custom: true,
    refresh: true,
    zoom: true,
  },
};
