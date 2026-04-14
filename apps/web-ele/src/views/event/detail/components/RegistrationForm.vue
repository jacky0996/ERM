<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue';
import {
  ElButton,
  ElCard,
  ElCheckbox,
  ElCheckboxGroup,
  ElForm,
  ElFormItem,
  ElInput,
  ElMessage,
  ElMessageBox,
  ElEmpty,
  ElSwitch,
  ElSelect,
  ElOption,
} from 'element-plus';
import { requestClient } from '#/api/request';

import { useGoogleFormParser } from '../hooks/useGoogleFormParser';

const props = defineProps<{
  eventData: any;
}>();

const { parseGoogleForm } = useGoogleFormParser();
const loading = ref(false);
const loadError = ref(false);
const isDisplay = ref(true); 
const isCreatedOrBound = ref(false);
const formUrl = ref('');
const formId = ref<string | number>(''); // 儲存來自 getDisplayList 的表單 ID

// --- 問卷配置器狀態 (恢復) ---
const config = reactive({
  title: props.eventData?.title || '活動報名表',
  description: props.eventData?.summary || '感謝您參加本活動，請填寫以下報名資訊。',
  standardFields: ['name', 'mobile', 'email'],
  customQuestions: [] as any[]
});

const typeOptions = [
  { label: '簡答 (Short Answer)', value: 'text' },
  { label: '詳答 (Paragraph)', value: 'textarea' },
  { label: '選擇題 (Multiple Choice / 單選)', value: 'radio' },
  { label: '下拉選單 (Dropdown)', value: 'dropdown' },
  { label: '核取方塊 (Checkboxes / 複選)', value: 'checkbox' },
  { label: '日期 (Date)', value: 'date' },
  { label: '時間 (Time)', value: 'time' },
];

const fieldOptions = [
  { label: '姓名', value: 'name', disabled: true },
  { label: '行動電話', value: 'mobile', disabled: true },
  { label: '電子郵件', value: 'email', disabled: true },
  { label: '公司名稱', value: 'company' },
  { label: '職稱', value: 'job_title' },
];

const hasOptions = (type: string) => ['radio', 'checkbox', 'dropdown'].includes(type);

onMounted(() => {
  checkDisplayAndLoad();
});

watch(() => props.eventData?.id, () => {
  checkDisplayAndLoad();
});

async function checkDisplayAndLoad() {
  if (!props.eventData?.id) return;
  
  loading.value = true;
  loadError.value = false;
  try {
    // 考慮到 Google API 或大量數據讀取可能較慢，在此增加 timeout 設定 (若 requestClient 支援)
    const res: any = await requestClient.post('/edm/event/getDisplayList', {
      event_id: props.eventData.id
    }, { 
      responseReturn: 'raw',
      timeout: 60000 // 延長至 60 秒
    } as any);

    const body = res?.data || res || {};

    if (body.code !== 0) {
      if (body.message?.includes('找不到對應的活動')) {
         isDisplay.value = false;
      }
      return;
    }

    const resData = body.data || {};
    isDisplay.value = resData.requires_registration ?? true;

    if (resData.google_form_bound) {
      const details = resData.form_details || {};
      formUrl.value = details.form_url || '';
      formId.value = details.id || '';
      isCreatedOrBound.value = true;
    } else {
      isCreatedOrBound.value = false;
      formId.value = '';
    }
  } catch (error) {
    console.error('getDisplayList Timeout or Failed:', error);
    loadError.value = true;
    ElMessage.error('連線逾時，請檢查網路或稍後再試');
  } finally {
    loading.value = false;
  }
}

// --- 動作：產製 Google 表單 ---
async function handleCreateForm() {
  try {
    await ElMessageBox.confirm('將依據目前配置產製 Google 表單並自動綁定。確定執行？', '產製表單', {
      confirmButtonText: '確定',
      cancelButtonText: '取消',
      type: 'primary'
    });
    
    loading.value = true;
    await requestClient.post('/edm/event/createGoogleForm', {
      event_id: props.eventData.id,
      type: 'registration',
      config: config
    }, { timeout: 60000 } as any);

    // 只要沒進入 catch，就代表執行成功
    ElMessage.success('產製成功');
    // 重新執行一次讀取報名表的 api 並進行畫面的刷新
    await checkDisplayAndLoad();
  } catch (error: any) {
    if (error !== 'cancel') ElMessage.error(error.message || '產製失敗');
  } finally {
    loading.value = false;
  }
}

// --- 動作：讀取現有表單配置回填以進行編輯 ---
async function handleEditForm() {
  if (!formId.value) return;
  
  loading.value = true;
  try {
    const res: any = await requestClient.post('/edm/event/getGoogleForm', {
      id: formId.value
    }, { timeout: 60000 } as any);
    
    // 使用 Hook 解析原始 Google 資料
    const googleInfo = res.data?.google_info || res.google_info;
    const parsedConfig = parseGoogleForm(googleInfo);
    
    if (parsedConfig) {
      // 將解析後的配置填入目前的 config 物件
      config.title = parsedConfig.title;
      config.description = parsedConfig.description;
      config.standardFields = parsedConfig.standardFields || [];
      config.customQuestions = parsedConfig.customQuestions || [];
      
      // 成功讀取後，將狀態切換回「編輯模式」
      isCreatedOrBound.value = false;
      ElMessage.success('已載入最新雲端配置');
    } else {
      ElMessage.warning('無法解析雲端表單內容');
    }
  } catch (error: any) {
    ElMessage.error(error.message || '無法取得表單配置');
  } finally {
    loading.value = false;
  }
}

// --- 動作：手動更新/刪除網址 ---
async function handleDeleteUrl() {
  if (!formId.value) return;

  await ElMessageBox.confirm('確定刪除此 Google 表單綁定？此操作將同步移除雲端紀錄。', '警告', { 
    type: 'warning',
    confirmButtonText: '確定刪除',
    confirmButtonClass: 'el-button--danger'
  });
  
  loading.value = true;
  try {
    // 呼叫刪除 API
    await requestClient.post('/edm/event/delGoogleForm', { 
      id: formId.value 
    });
    
    formUrl.value = '';
    formId.value = '';
    isCreatedOrBound.value = false;
    ElMessage.success('已成功移除綁定');
    
    // 重新加載頁面狀態
    await checkDisplayAndLoad();
  } catch (error: any) {
    ElMessage.error(error.message || '刪除失敗');
  } finally {
    loading.value = false;
  }
}


function handleCopy() {
  navigator.clipboard.writeText(formUrl.value).then(() => ElMessage.success('已複製連結'));
}

// --- 問卷配置器子動作 ---
function addQuestion() {
  config.customQuestions.push({ label: '', type: 'text', required: false, options: [''] });
}
</script>

<template>
  <div v-loading="loading" class="registration-form-container p-2">
    
    <!-- 情境 1: 活動不需填寫報名表 -->
    <div v-if="!isDisplay" class="py-20 flex flex-col items-center justify-center bg-white rounded-2xl shadow-sm border border-gray-100 italic text-gray-400">
      <ElEmpty description="此活動目前設定為：不需報名表" />
    </div>

    <!-- 加載異常狀態 -->
    <div v-else-if="loadError" class="py-20 flex flex-col items-center justify-center bg-white rounded-2xl shadow-sm border border-gray-100">
      <div class="text-red-400 mb-4">
        <svg viewBox="0 0 24 24" width="64" height="64"><path fill="currentColor" d="M12,2L1,21H23L12,2M12,6L19.53,19H4.47L12,6M11,10V14H13V10H11M11,16V18H13V16H11Z" /></svg>
      </div>
      <p class="text-gray-600 font-bold mb-4">資料加載發生逾時</p>
      <ElButton type="primary" @click="checkDisplayAndLoad">重新嘗試</ElButton>
    </div>

    <!-- 情境 2: 報名表管理介面 -->
    <div v-else class="space-y-6">
      
      <!-- A. 頂部狀態列 (已產製時顯示管理清單) -->
      <div v-if="isCreatedOrBound" class="animate-fade-in group">
        <ElCard shadow="never" class="!rounded-2xl border border-emerald-100 bg-white p-1 relative overflow-hidden shadow-sm hover:shadow-md transition-shadow">
          <!-- 裝飾微光 -->
          <div class="absolute -right-10 -top-10 w-40 h-40 bg-emerald-50/50 blur-3xl rounded-full"></div>
          
          <div class="flex flex-wrap items-center justify-between gap-6 p-3 relative z-10">
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-xl flex items-center justify-center border border-emerald-100 transition-transform group-hover:scale-105 shadow-sm">
                <svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z" /></svg>
              </div>
              <div class="flex flex-col">
                <div class="flex items-center gap-2">
                  <span class="text-gray-800 font-bold text-lg tracking-tight">Google 報名表已就緒</span>
                  <span class="bg-emerald-500 text-white text-[10px] px-2 py-0.5 rounded-md font-black uppercase shadow-sm">Live</span>
                </div>
                <span class="text-gray-400 text-xs mt-0.5 font-medium">系統已自動建立並連結此活動之報名清單</span>
              </div>
            </div>

            <div class="flex-1 min-w-[280px] flex items-center gap-2 bg-gray-50 p-2 rounded-xl border border-gray-100 group-hover:border-emerald-200 transition-all shadow-inner">
              <code class="text-emerald-700 text-[11px] px-2 truncate flex-1 font-mono font-bold">{{ formUrl }}</code>
              <ElButton type="primary" size="small" circle plain @click="handleCopy" class="!bg-white border-gray-200 hover:!border-emerald-500">
                <template #icon><svg viewBox="0 0 24 24" width="14" height="14"><path fill="currentColor" d="M19,21H8V7H19M19,5H8A2,2 0 0,0 6,7V21A2,2 0 0,0 8,23H19A2,2 0 0,0 21,21V7A2,2 0 0,0 19,5M16,1H4A2,2 0 0,0 2,3V17H4V3H16V1Z" /></svg></template>
              </ElButton>
            </div>

            <div class="flex items-center gap-3">
              <a :href="formUrl" target="_blank" class="no-underline">
                <ElButton type="primary" class="!rounded-xl px-6 !h-10 font-bold shadow-md shadow-emerald-500/10 hover:shadow-emerald-500/20 active:scale-95 transition-all">
                  開啟表單 ↗
                </ElButton>
              </a>
              <div class="h-6 w-[1px] bg-gray-200 mx-1"></div>
              <ElButton type="success" class="!rounded-xl px-5 !h-10 font-bold shadow-sm" @click="handleEditForm">
                編輯配置
              </ElButton>
              <ElButton type="danger" class="!rounded-xl px-5 !h-10 font-bold shadow-sm" @click="handleDeleteUrl">
                移除綁定
              </ElButton>
            </div>
          </div>
        </ElCard>
      </div>

      <!-- B. 配置器區塊 (未產製/編輯模式時顯示) -->
      <div v-if="!isCreatedOrBound" class="space-y-6 animate-fade-in">
        <div class="flex items-center justify-between px-2">
           <div class="flex flex-col">
              <h3 class="text-xl font-bold text-gray-800">產製 Google 表單</h3>
              <p class="text-sm text-gray-500">設定完畢後點擊下方按鈕，系統將自動在雲端建立表單</p>
           </div>
           <div class="flex items-center gap-2">
              <span class="text-red-500 text-sm font-bold animate-pulse">* 請先產製或綁定問卷</span>
           </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <!-- 左側：基礎設定 -->
          <div class="lg:col-span-4 space-y-6">
            <ElCard shadow="never" class="!rounded-2xl border-gray-200">
               <template #header><span class="font-bold">1. 表單資訊</span></template>
               <ElForm label-position="top">
                  <ElFormItem label="表單主標題"><ElInput v-model="config.title" /></ElFormItem>
                  <ElFormItem label="介紹說明"><ElInput v-model="config.description" type="textarea" :rows="3" /></ElFormItem>
               </ElForm>
            </ElCard>
            
            <ElCard shadow="never" class="!rounded-2xl border-gray-200">
               <template #header><span class="font-bold">2. 基本欄位勾選</span></template>
               <ElCheckboxGroup v-model="config.standardFields" class="grid grid-cols-1 gap-2">
                  <ElCheckbox v-for="f in fieldOptions" :key="f.value" :label="f.label" :value="f.value" :disabled="f.disabled" border class="!mr-0 w-full" />
               </ElCheckboxGroup>
            </ElCard>
          </div>

          <!-- 右側：自訂問項 -->
          <div class="lg:col-span-8">
            <ElCard shadow="never" class="!rounded-2xl border-gray-200 min-h-[500px]">
               <template #header>
                  <div class="flex justify-between items-center">
                    <span class="font-bold">3. 自訂問題區</span>
                    <ElButton type="primary" size="small" @click="addQuestion">+ 新增題目</ElButton>
                  </div>
               </template>
               
               <div class="space-y-4">
                  <div v-for="(q, index) in config.customQuestions" :key="index" class="p-6 border-2 border-gray-100 rounded-xl bg-white relative hover:border-blue-300 transition-colors">
                    <div class="flex gap-4 items-start">
                      <div class="flex-1"><ElInput v-model="q.label" placeholder="題目標題..." /></div>
                      <div class="w-40"><ElSelect v-model="q.type"><ElOption v-for="o in typeOptions" :key="o.value" :label="o.label" :value="o.value" /></ElSelect></div>
                      <div class="flex items-center gap-2 pt-1 font-medium text-xs"><span class="text-gray-500">必填</span><ElSwitch v-model="q.required" size="small" /></div>
                      <ElButton type="danger" link @click="config.customQuestions.splice(index,1)">移除</ElButton>
                    </div>
                    
                    <div v-if="hasOptions(q.type)" class="mt-4 pl-4 border-l-2 border-blue-200 space-y-2">
                       <div v-for="(_, oi) in q.options" :key="oi" class="flex gap-2">
                          <ElInput v-model="q.options[oi]" size="small" placeholder="選項文字..." />
                          <ElButton type="danger" link @click="q.options.splice(oi,1)">x</ElButton>
                       </div>
                       <ElButton type="primary" link size="small" @click="q.options.push('')">+ 增加選項</ElButton>
                    </div>
                  </div>
                  <div v-if="config.customQuestions.length === 0" class="flex flex-col items-center justify-center py-20 text-gray-400">
                    <svg viewBox="0 0 24 24" width="48" height="48" class="mb-2 opacity-20"><path fill="currentColor" d="M19,3H5C3.89,3 3,3.89 3,5V19C3,20.11 3.89,21 5,21H19C20.11,21 21,20.11 21,19V5C21,3.89 20.11,3 19,3M19,19H5V5H19V19M11,7H13V11H17V13H13V17H11V13H7V11H11V7Z" /></svg>
                    <span>尚未增加任何自訂問項</span>
                  </div>
               </div>
            </ElCard>
            
            <div class="mt-8">
              <ElButton type="primary" class="w-full !h-16 !rounded-2xl text-xl font-bold shadow-xl" :loading="loading" @click="handleCreateForm">
                 🚀 同步雲端：立即產製 Google 表單
              </ElButton>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<style scoped>
.custom-dark-input :deep(.el-input__wrapper) {
  background-color: #1f2937;
  border: 1px solid #374151;
  box-shadow: none;
}
.custom-dark-input :deep(.el-input__inner) {
  color: #9ca3af;
}
.animate-fade-in {
  animation: fadeIn 0.4s ease-out forwards;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* 自定義捲軸樣式 */
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: #f9fafb;
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #e5e7eb;
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #d1d5db;
}
</style>
