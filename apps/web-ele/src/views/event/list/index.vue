<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { Page } from '@vben/common-ui';
import { ElButton } from 'element-plus';
import { useVbenVxeGrid } from '#/adapter/vxe-table';

import { formOptions, gridOptions } from './event.data';

const router = useRouter();
const [Grid] = useVbenVxeGrid({ formOptions, gridOptions });
const loading = ref(false);

function handleCreate() {
  router.push('/event-management/create');
}
</script>

<template>
  <Page :loading="loading" auto-content-height>
    <Grid>
      <template #toolbar-tools>
        <ElButton type="primary" @click="handleCreate"> 新增活動 </ElButton>
      </template>
    </Grid>
  </Page>
</template>
