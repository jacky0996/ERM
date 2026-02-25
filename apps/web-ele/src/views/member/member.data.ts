import type { VbenFormProps } from '#/adapter/form';
import type { VxeTableGridOptions } from '#/adapter/vxe-table';

import { h } from 'vue';
import { router } from '#/router';

import { ElTag, ElLink } from 'element-plus';
import { getMemberListApi } from '#/api/member';

interface RowType {
  id: string;
  name: string;
  status: number;
  emails: { email: string }[];
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
      fieldName: 'name',
      label: '姓名',
      componentProps: {
        placeholder: '請輸入姓名',
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


const gridOptions: VxeTableGridOptions<RowType> = {
  checkboxConfig: {
    highlight: true,
  },
  columns: [
    { title: '序號', type: 'seq', width: 60 },
    {
      field: 'name',
      title: '姓名',
      slots: {
        default: ({ row }) => {
          return h(
            ElLink,
            {
              type: 'primary',
              onClick: () => {
                router.push(`/member/detail/${row.id}`);
              },
            },
            { default: () => row.name },
          );
        },
      },
    },
    {
      field: 'status',
      title: '狀態',
      slots: {
        default: ({ row }) => {
          const statusConfig = STATUS_MAP[row.status as keyof typeof STATUS_MAP] || STATUS_MAP[0];
          return h(
            ElTag,
            { type: statusConfig.type },
            { default: () => statusConfig.label },
          );
        },
      },
    },
    {
      field: 'emails',
      title: '信箱',
      slots: {
        default: ({ row }) => {
          return row.emails?.map((e) => e.email).join(', ');
        },
      },
    },
    { 
      field: 'created_at', 
      title: '註冊時間', 
      slots: {
        default: ({ row }) => {
          return (row.created_at ? row.created_at.replace('T', ' ').split('.')[0] : '') as string;
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
          pageSize: page.pageSize, // 如果您的後端需要 per_page，請在此修改
          ...formValues,
        };
        console.log('發送請求參數:', params);
        try {
          const res = await getMemberListApi(params);
          console.log('收到請求結果:', res);

          // 獲取數據列表
          const items = res.items ?? [];
          // 獲取總筆數 (優先從 res.total 拿，如果沒有才拿 items 長度)
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
