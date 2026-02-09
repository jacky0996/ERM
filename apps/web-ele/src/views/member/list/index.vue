<script setup lang="ts">
import type { VbenFormProps } from '#/adapter/form';
import type { VxeTableGridOptions } from '#/adapter/vxe-table';

import { h } from 'vue';

import { Page } from '@vben/common-ui';

import { ElButton, ElTag } from 'element-plus';

import { useVbenVxeGrid } from '#/adapter/vxe-table';

interface RowType {
  id: string;
  name: string;
  status: 'active' | 'inactive';
  email: string;
  createTime: string;
}

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
          { label: '已啟用', value: 'active' },
          { label: '已禁用', value: 'inactive' },
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
    { field: 'name', title: '姓名' },
    {
      field: 'status',
      title: '狀態',
      slots: {
        default: ({ row }) => {
          const type = row.status === 'active' ? 'success' : 'danger';
          const text = row.status === 'active' ? '已啟用' : '已禁用';
          return h(ElTag, { type }, { default: () => text });
        },
      },
    },
    { field: 'email', title: '信箱' },
    { field: 'createTime', title: '註冊時間' },
  ],
  height: 'auto',
  keepSource: true,
  pagerConfig: {},
  proxyConfig: {
    ajax: {
      query: async (_, formValues) => {
        // 模擬數據
        console.log('查詢參數:', formValues);
        return {
          items: [
            {
              id: '1',
              name: '張三',
              status: 'active',
              email: 'zhangsan@example.com',
              createTime: '2024-01-01 10:00:00',
            },
            {
              id: '2',
              name: '李四',
              status: 'inactive',
              email: 'lisi@example.com',
              createTime: '2024-01-02 11:30:00',
            },
          ],
          total: 2,
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

const [Grid] = useVbenVxeGrid({
  formOptions,
  gridOptions,
});

function handleImport() {
  alert('匯入人員名單功能開發中...');
}
</script>

<template>
  <Page auto-content-height>
    <Grid>
      <template #toolbar-tools>
        <ElButton type="primary" @click="handleImport"> 匯入人員名單 </ElButton>
      </template>
    </Grid>
  </Page>
</template>
