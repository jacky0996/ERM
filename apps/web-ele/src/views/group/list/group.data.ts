import type { VbenFormProps } from '#/adapter/form';
import type { VxeTableGridOptions } from '#/adapter/vxe-table';

import { h } from 'vue';
import { router } from '#/router';

import { ElTag, ElLink } from 'element-plus';
import { formatDateTime } from '#/utils/date';

interface RowType {
  id: number;
  name: string;
  note: string;
  creator_id: number;
  status: number;
  members: any[];
  created_at: string;
  updated_at: string;
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



import { getGroupListApi } from '#/api/group';

const gridOptions: VxeTableGridOptions<RowType> = {
  checkboxConfig: {
    highlight: true,
  },
  columns: [
    { title: '序號', type: 'seq', width: 60 },
    {
      field: 'name',
      title: '群組名稱',
      minWidth: 150,
      slots: {
        default: ({ row }) => {
          return h(
            ElLink,
            {
              type: 'primary',
              onClick: () => {
                router.push(`/group/detail/${row.id}`);
              },
            },
            { default: () => row.name },
          );
        },
      },
    },
    {
      field: 'members',
      title: '人數',
      width: 100,
      align: 'center',
      slots: {
        default: ({ row }) => {
          return `${row.members?.length ?? 0}`;
        },
      },
    },
    {
      field: 'creator_id',
      title: '建立者',
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
          const res = await getGroupListApi(params);
          const items = res.items ?? [];
          const total = res.total !== undefined ? res.total : items.length;

          return {
            items,
            total,
          };
        } catch (error) {
          console.error('API Call Failed:', error);
          return {
            items: [],
            total: 0,
          };
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

export { formOptions, gridOptions };
export type { RowType };
