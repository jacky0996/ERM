<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import {
  ElTable,
  ElTableColumn,
  ElButton,
  ElTag,
  ElPagination,
  ElMessageBox,
  ElMessage,
  ElInput,
} from 'element-plus';

const props = defineProps<{
  eventId: string | number;
}>();

// 模擬假資料
const mockList = [
  { id: 1, name: '王大同', company: '華電聯網', phone: '0912-345678', email: 'wang@hwacom.com', status: 'pending' },
  { id: 2, name: '李阿美', company: '資策會', phone: '0922-111222', email: 'lee@iii.org.tw', status: 'pending' },
  { id: 3, name: '張小明', company: '工研院', phone: '0933-555666', email: 'chang@itri.org.tw', status: 'approved' },
  { id: 4, name: '林志玲', company: '凱渥模特', phone: '0944-777888', email: 'lin@catwalk.com', status: 'rejected' },
  { id: 5, name: '郭台銘', company: '鴻海精密', phone: '0955-999000', email: 'terry@foxconn.com', status: 'pending' },
];

const list = ref<any[]>([]);
const loading = ref(false);
const total = ref(15); // 模擬總筆數
const currentPage = ref(1);
const pageSize = ref(10);
const searchQuery = ref('');

onMounted(() => {
  fetchList();
});

/** 模擬取得資料 */
function fetchList() {
  loading.value = true;
  // 延遲模擬 API 呼叫
  setTimeout(() => {
    list.value = [...mockList].map(item => ({ ...item }));
    loading.value = false;
  }, 300);
}

/** 審核通過流程 */
async function handleApprove(row: any) {
  try {
    const action = await ElMessageBox.confirm(
      '確認核准該人員報名？此操作將使狀態變更為「已過審」。',
      '審核通過確認',
      {
        confirmButtonText: '寄出過審文件',
        cancelButtonText: '僅過審(不寄信)',
        distinguishCancelAndClose: true,
        type: 'success',
      }
    ).catch((action) => action);

    // 不論點選什麼(除了關閉視窗)，狀態都會變更
    if (action === 'confirm') {
      ElMessage.success(`${row.name} 已過審，並已發送過審文件。`);
      row.status = 'approved';
    } else if (action === 'cancel') {
      ElMessage.success(`${row.name} 已過審 (未寄送文件)。`);
      row.status = 'approved';
    }
  } catch (err) {
    // 點擊關閉 X 或點擊背景不執行動作
  }
}

/** 審核拒絕流程 */
async function handleReject(row: any) {
  try {
    const action = await ElMessageBox.confirm(
      '確認拒絕該人員報名？此操作將使狀態變更為「審核未過」。',
      '審核拒絕確認',
      {
        confirmButtonText: '寄出失敗通知信',
        cancelButtonText: '僅拒絕(不寄信)',
        distinguishCancelAndClose: true,
        type: 'warning',
      }
    ).catch((action) => action);

    if (action === 'confirm') {
      ElMessage.warning(`${row.name} 審核未過，已發送失敗通知。`);
      row.status = 'rejected';
    } else if (action === 'cancel') {
      ElMessage.warning(`${row.name} 審核未過 (未寄送郵件)。`);
      row.status = 'rejected';
    }
  } catch (err) {
    // 關閉視窗不執行
  }
}

/** 狀態標籤對應樣式 */
function getStatusTag(status: string) {
  const map: any = {
    pending: { label: '待審核', type: 'info' },
    approved: { label: '已過審', type: 'success' },
    rejected: { label: '審核未過', type: 'danger' },
  };
  return map[status] || { label: '未知', type: 'info' };
}
</script>

<template>
  <div class="approval-list bg-white rounded-2xl">
    <!-- 工具列 -->
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center gap-4">
        <h3 class="text-lg font-bold text-gray-800">活動報名審核名單</h3>
        <ElInput 
          v-model="searchQuery" 
          placeholder="搜尋姓名或公司..." 
          style="width: 250px;" 
          clearable
        />
      </div>
      <div class="text-xs text-gray-500">
        目前顯示 {{ list.length }} 筆資料
      </div>
    </div>

    <!-- 表格區 -->
    <ElTable 
      v-loading="loading" 
      :data="list" 
      style="width: 100%"
      class="custom-table"
      :header-cell-style="{ backgroundColor: '#F9FAFB', fontWeight: 'bold' }"
    >
      <ElTableColumn prop="name" label="姓名" width="120" />
      <ElTableColumn prop="company" label="公司單位" min-width="180" />
      <ElTableColumn prop="phone" label="電話號碼" width="150" />
      <ElTableColumn prop="email" label="Email" min-width="220" />
      
      <ElTableColumn label="當前狀態" width="120" align="center">
        <template #default="{ row }">
          <ElTag :type="getStatusTag(row.status).type" disable-transitions>
            {{ getStatusTag(row.status).label }}
          </ElTag>
        </template>
      </ElTableColumn>

      <ElTableColumn label="審核操作" width="220" align="center" fixed="right">
        <template #default="{ row }">
          <div v-if="row.status === 'pending'" class="flex gap-2 justify-center">
            <ElButton type="success" size="small" @click="handleApprove(row)">過審</ElButton>
            <ElButton type="danger" size="small" @click="handleReject(row)">拒絕</ElButton>
          </div>
          <div v-else class="text-xs text-gray-400 italic">
            已完成處理
          </div>
        </template>
      </ElTableColumn>
    </ElTable>

    <!-- 分頁器 -->
    <div class="mt-8 flex items-center justify-between">
      <div class="text-sm text-gray-500 italic">資料 ID: {{ eventId }} (僅供測試參考)</div>
      <ElPagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        background
        @size-change="fetchList"
        @current-change="fetchList"
      />
    </div>
  </div>
</template>

<style scoped>
.custom-table :deep(.el-table__row) {
  transition: all 0.3s ease;
}
.custom-table :deep(.el-table__row:hover) {
  background-color: #f8fafc !important;
}
</style>
