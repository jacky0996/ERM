<script setup lang="ts">
import { ref, onMounted } from 'vue';
import {
  ElTable, ElTableColumn, ElButton, ElTag,
  ElMessageBox, ElMessage, ElInput, ElEmpty,
  ElDialog, ElDescriptions, ElDescriptionsItem,
} from 'element-plus';
import { requestClient } from '#/api/request';

const props = defineProps<{
  eventData: any;
}>();

// ─── State ───────────────────────────────────────────────
const list = ref<any[]>([]);
const filteredList = ref<any[]>([]);
const loading = ref(false);
const searchQuery = ref('');
const googleFormId = ref<number | null>(null);
const noBoundForm = ref(false);  // 尚未建立 Google 報名表

// 查看回覆 Dialog
const dialogVisible = ref(false);
const currentResponse = ref<any>(null);

// 是否為審核模式
const isApproveMode = ref(props.eventData?.is_approve === 1);

// ─── Filter ───────────────────────────────────────────────
function applyFilter() {
  const q = searchQuery.value.toLowerCase().trim();
  filteredList.value = q
    ? list.value.filter((row) =>
        [row.name, row.company, row.email, row.mobile]
          .filter(Boolean)
          .some((val) => String(val).toLowerCase().includes(q))
      )
    : [...list.value];
}

// ─── Lifecycle ───────────────────────────────────────────
onMounted(async () => {
  await init();
});

// ─── Init ─────────────────────────────────────────────────
async function init() {
  if (!props.eventData?.id) return;
  isApproveMode.value = props.eventData?.is_approve === 1;

  loading.value = true;
  list.value = [];
  filteredList.value = [];
  try {
    const displayRes: any = await requestClient.post('/edm/event/getDisplayList', {
      event_id: props.eventData.id
    }, { responseReturn: 'raw', timeout: 60000 } as any);

    const body = displayRes?.data || displayRes || {};
    const resData = body.data || {};

    if (!resData.google_form_bound) {
      noBoundForm.value = true;
      return;
    }

    const responses = resData.form_details?.responses || [];
    list.value = responses.map(mapResponse);
    applyFilter();
  } catch (err) {
    console.error('ApprovalList init failed:', err);
    ElMessage.error('資料載入失敗，請稍後再試');
  } finally {
    loading.value = false;
  }
}

// ─── 共用：解析 response 物件 ──────────────────────────────
function mapResponse(item: any) {
  const row: any = {
    _id: item.id,
    _responseId: item.google_response_id,
    _createTime: item.submitted_at,
    status: item.status ?? 0,
    _rawAnswers: item.answers || []
  };

  if (Array.isArray(item.answers)) {
    item.answers.forEach((ans: any) => {
      const title = (ans.title || '').trim();
      const answer = ans.answer || '';
      if (title.includes('姓名')) row.name = answer;
      else if (title.includes('電話') || title.includes('手機')) row.mobile = answer;
      else if (title.includes('公司')) row.company = answer;
      else if (title.includes('郵件') || title.toLowerCase().includes('email')) row.email = answer;
    });
  }
  return row;
}

// ─── 審核操作 ──────────────────────────────────────────────
async function handleApprove(row: any) {
  try {
    const action = await ElMessageBox.confirm(
      `確認核准「${row.name || '此人員'}」的報名？`,
      '審核通過確認',
      { confirmButtonText: '確定通過', cancelButtonText: '取消', type: 'success' }
    ).catch((a) => a);
    if (action !== 'confirm') return;
    await updateStatus(row, 1);
  } catch (_) {}
}

async function handleReject(row: any) {
  try {
    const action = await ElMessageBox.confirm(
      `確認拒絕「${row.name || '此人員'}」的報名？`,
      '審核拒絕確認',
      { confirmButtonText: '確定拒絕', cancelButtonText: '取消', type: 'warning' }
    ).catch((a) => a);
    if (action !== 'confirm') return;
    await updateStatus(row, 2);
  } catch (_) {}
}

async function updateStatus(row: any, status: number) {
  try {
    loading.value = true;
    const res: any = await requestClient.post('/edm/event/updateResponseStatus', {
      response_id: row._responseId,
      status
    });

    if (res.code === 0 || res.status === true) {
      ElMessage.success(status === 1 ? '已通過審核' : '已退件');
      row.status = status;
      applyFilter();
    } else {
      ElMessage.error(res.message || '更新失敗');
    }
  } catch (err: any) {
    ElMessage.error(err.message || '連線異常');
  } finally {
    loading.value = false;
  }
}

// ─── 查看回覆 Dialog ───────────────────────────────────────
function handleViewResponse(row: any) {
  currentResponse.value = row;
  dialogVisible.value = true;
}

function formatDate(dateStr: string) {
  if (!dateStr) return '(未知)';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const h = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  const s = String(date.getSeconds()).padStart(2, '0');
  return `${y}-${m}-${d} ${h}:${min}:${s}`;
}

// ─── 狀態標籤 ──────────────────────────────────────────────
function getStatusTag(status: number) {
  const map: any = {
    0: { label: '待審核', type: 'info' },
    1: { label: '已通過', type: 'success' },
    2: { label: '不通過', type: 'danger' },
  };
  return map[status] ?? { label: '未知', type: 'info' };
}
</script>

<template>
  <div class="approval-list bg-white rounded-2xl">

    <!-- 尚未建立 Google 表單 -->
    <div v-if="noBoundForm" class="py-20">
      <ElEmpty description="尚未建立 Google 報名表，請先至「報名表」頁籤進行產製" />
    </div>

    <template v-else>
      <!-- 工具列 -->
      <div class="flex items-center justify-between mb-6">
        <div class="flex items-center gap-4">
          <h3 class="text-lg font-bold text-gray-800">
            {{ isApproveMode ? '報名審核名單' : '已填寫名單' }}
          </h3>
          <!-- 審核模式標籤 -->
          <span v-if="isApproveMode" class="bg-orange-100 text-orange-600 text-xs px-3 py-1 rounded-full font-bold">
            ⚠️ 此活動需經審核
          </span>
          <ElInput
            v-model="searchQuery"
            placeholder="搜尋姓名、公司或 Email..."
            style="width: 280px;"
            clearable
            @input="applyFilter"
            @clear="applyFilter"
          />
        </div>

        <!-- 審核模式統計 -->
        <div class="flex items-center gap-4 text-sm text-gray-500">
          <template v-if="isApproveMode">
            <span>待審核：{{ filteredList.filter(r => r.status === 0).length }} 筆</span>
            <span class="text-green-600">已通過：{{ filteredList.filter(r => r.status === 1).length }} 筆</span>
            <span class="text-red-500">不通過：{{ filteredList.filter(r => r.status === 2).length }} 筆</span>
          </template>
          <span v-else>共 {{ filteredList.length }} 筆</span>
          <ElButton size="small" @click="init">重新整理</ElButton>
        </div>
      </div>

      <!-- 資料表格 -->
      <ElTable
        v-loading="loading"
        :data="filteredList"
        style="width: 100%"
        stripe
        border
        empty-text="目前尚無資料"
        :header-cell-style="{ backgroundColor: '#F9FAFB', fontWeight: 'bold' }"
      >
        <ElTableColumn prop="name" label="姓名" width="120">
          <template #default="{ row }">
            <span class="font-bold text-blue-600">{{ row.name || '-' }}</span>
          </template>
        </ElTableColumn>
        <ElTableColumn prop="company" label="公司單位" min-width="150" />
        <ElTableColumn prop="mobile" label="行動電話" width="130" />
        <ElTableColumn prop="email" label="電子郵件" min-width="180" />

        <ElTableColumn label="提交時間" width="165">
          <template #default="{ row }">
            <span class="text-gray-500 text-xs">
              {{ row._createTime ? String(row._createTime).replace('T', ' ').substring(0, 19) : '-' }}
            </span>
          </template>
        </ElTableColumn>

        <!-- 僅在審核模式顯示狀態欄 -->
        <ElTableColumn v-if="isApproveMode" label="審核狀態" width="110" align="center">
          <template #default="{ row }">
            <ElTag :type="getStatusTag(row.status).type" size="small" effect="dark" disable-transitions>
              {{ getStatusTag(row.status).label }}
            </ElTag>
          </template>
        </ElTableColumn>

        <!-- 操作欄：審核模式多審核按鈕，查看模式只有查看回覆 -->
        <ElTableColumn label="操作" :width="isApproveMode ? 240 : 140" align="center" fixed="right">
          <template #default="{ row }">
            <div class="flex items-center justify-center gap-2 flex-wrap">
              <!-- 審核按鈕：只在審核模式且待審核時顯示 -->
              <template v-if="isApproveMode && row.status === 0">
                <ElButton type="success" size="small" @click="handleApprove(row)">通過</ElButton>
                <ElButton type="danger" size="small" @click="handleReject(row)">拒絕</ElButton>
              </template>
              <span v-else-if="isApproveMode" class="text-xs text-gray-400 italic">已處理</span>
              <!-- 查看回覆：藍底白字實心按鈕 -->
              <ElButton type="primary" size="small" @click="handleViewResponse(row)">查看回復</ElButton>
            </div>
          </template>
        </ElTableColumn>
      </ElTable>
    </template>

    <!-- 回覆詳情彈窗 -->
    <ElDialog v-model="dialogVisible" title="詳細填寫內容" width="650px" destroy-on-close class="!rounded-2xl">
      <div v-if="currentResponse" class="flex flex-col">
        <!-- 核心資訊摘要 -->
        <div class="grid grid-cols-2 gap-3 mb-6 bg-gray-50 p-4 rounded-xl border border-gray-100">
          <div class="flex flex-col">
            <span class="text-[10px] text-gray-400 font-bold uppercase tracking-wider">姓名</span>
            <span class="text-blue-600 font-bold">{{ currentResponse.name || '---' }}</span>
          </div>
          <div class="flex flex-col">
            <span class="text-[10px] text-gray-400 font-bold uppercase tracking-wider">電子郵件</span>
            <span class="text-gray-700 font-medium break-all">{{ currentResponse.email || '---' }}</span>
          </div>
          <div class="flex flex-col">
            <span class="text-[10px] text-gray-400 font-bold uppercase tracking-wider">公司單位</span>
            <span class="text-gray-700 font-medium">{{ currentResponse.company || '---' }}</span>
          </div>
          <div class="flex flex-col">
            <span class="text-[10px] text-gray-400 font-bold uppercase tracking-wider">行動電話</span>
            <span class="text-gray-700 font-medium">{{ currentResponse.mobile || '---' }}</span>
          </div>
        </div>

        <!-- 滾動式詳細問答區 -->
        <div class="px-1">
          <h4 class="text-sm font-bold text-gray-500 mb-3 flex items-center gap-2">
            <div class="w-1 h-4 bg-emerald-500 rounded-full"></div> 完整填寫內容
          </h4>
          <div class="max-h-[400px] overflow-y-auto pr-2 custom-scrollbar border border-gray-100 rounded-xl">
            <ElDescriptions :column="1" border>
              <ElDescriptionsItem v-for="(ans, i) in currentResponse._rawAnswers" :key="i" :label="ans.title">
                <span class="font-medium text-gray-700 whitespace-pre-wrap">{{ ans.answer || '(未填寫)' }}</span>
              </ElDescriptionsItem>
            </ElDescriptions>
          </div>
        </div>

        <!-- 底部元數據 -->
        <div class="text-[10px] text-gray-300 mt-6 flex justify-between px-2 pt-4 border-t border-gray-50">
          <span>Response ID: {{ currentResponse._responseId }}</span>
          <span>提交時間: {{ formatDate(currentResponse._createTime) }}</span>
        </div>
      </div>
    </ElDialog>
  </div>
</template>

<style scoped>
.approval-list :deep(.el-table__row) {
  transition: all 0.2s ease;
}
.approval-list :deep(.el-table__row:hover) {
  background-color: #f8fafc !important;
}
.custom-scrollbar::-webkit-scrollbar { width: 6px; }
.custom-scrollbar::-webkit-scrollbar-track { background: #f9fafb; border-radius: 10px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 10px; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #d1d5db; }
</style>
