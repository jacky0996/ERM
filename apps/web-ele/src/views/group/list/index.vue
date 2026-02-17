<script setup lang="ts">
import { Page } from '@vben/common-ui';

import { ElButton } from 'element-plus';

import { useVbenVxeGrid } from '#/adapter/vxe-table';

import { formOptions, gridOptions } from './group.data.ts';

const [Grid, gridApi] = useVbenVxeGrid({ formOptions, gridOptions });

function handleCreate() {
  // TODO: 實作建立群組功能
  console.log('建立新群組');
}

function handleEdit(row: any) {
  // TODO: 實作編輯群組功能
  console.log('編輯群組:', row);
}

function handleDelete(row: any) {
  // TODO: 實作刪除群組功能
  console.log('刪除群組:', row);
}
</script>

<template>
  <Page auto-content-height>
    <Grid>
      <template #toolbar-tools>
        <ElButton type="primary" @click="handleCreate"> 新增群組 </ElButton>
      </template>
    </Grid>
  </Page>
</template>
