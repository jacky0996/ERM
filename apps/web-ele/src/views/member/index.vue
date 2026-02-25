<script setup lang="ts">
import { Page } from '@vben/common-ui';

import { ElButton } from 'element-plus';

import { useVbenModal } from '@vben/common-ui';

import { useVbenVxeGrid } from '#/adapter/vxe-table';

import { formOptions, gridOptions } from './member.data.ts';
import ExcelImportModal from '#/components/common/excel-import-modal.vue';
import { importMemberApi } from '#/api/member';

const [Grid, gridApi] = useVbenVxeGrid({ formOptions, gridOptions });

const [ImportVbenModal, importModalApi] = useVbenModal({
  connectedComponent: ExcelImportModal,
  class: 'w-[1000px]',
});

function handleImport() {
  importModalApi.open();
}

function handleImportSuccess() {
  gridApi.query();
}
</script>

<template>
  <Page auto-content-height>
    <Grid>
      <template #toolbar-tools>
        <ElButton type="primary" @click="handleImport"> 匯入人員名單 </ElButton>
      </template>
    </Grid>
    <ImportVbenModal
      title="匯入人員名單"
      sample-url="/example/範例-人員名單.xlsx"
      :upload-api="importMemberApi"
      :extra-params="{ type: 'member' }"
      @success="handleImportSuccess"
    />
  </Page>
</template>
