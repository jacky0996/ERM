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
  ElTable,
  ElTableColumn,
  ElSwitch,
  ElSelect,
  ElOption,
} from 'element-plus';
import { requestClient } from '#/api/request';

const props = defineProps<{
  eventData: any;
}>();

const loading = ref(false);
const isDisplay = ref(true); 
const isCreatedOrBound = ref(false);
const formUrl = ref('');
const displayList = ref<any[]>([]);

// --- 問卷配置器狀態 (恢復) ---
const config = reactive({
  title: props.eventData?.title || '活動報名表',
  description: props.eventData?.summary || '感謝您參加本活動，請填寫以下報名資訊。',
  standardFields: ['name', 'mobile', 'email', 'company'],
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
  { label: '餐旅需求', value: 'dietary' },
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
  
  // 檢查是否開啟報名表 (對位新的參數 is_registration)
  if (props.eventData.is_registration === 0) {
    isDisplay.value = false;
    return;
  }

  isDisplay.value = true;
  loading.value = true;
  try {
    const res: any = await requestClient.post('/edm/event/getDisplayList', {
      event_id: props.eventData.id
    }, { responseReturn: 'raw' });

    const body = res?.data || res || {};

    if (body.code === 1) {
      isDisplay.value = false;
      return;
    }

    const sheetData = body.data || {};
    const url = sheetData.url || sheetData.form_url || sheetData.sheet_url || '';
    
    if (url) {
      formUrl.value = url;
      isCreatedOrBound.value = true;
    } else {
      isCreatedOrBound.value = false;
    }

    displayList.value = body.list || sheetData.list || [];
  } catch (error) {
    console.warn('Load failed', error);
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
    });

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

// --- 動作：手動更新/刪除網址 ---
async function handleDeleteUrl() {
  await ElMessageBox.confirm('確定刪除綁定？此操作不會刪除雲端表單實體。', '警告', { type: 'warning' });
  loading.value = true;
  try {
    await requestClient.post('/edm/event/updateDisplay', { event_id: props.eventData.id, url: '' });
    formUrl.value = '';
    isCreatedOrBound.value = false;
    ElMessage.success('已解除綁定');
  } finally { loading.value = false; }
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
    <div v-if="!isDisplay" class="py-20 flex justify-center bg-white rounded-2xl shadow-sm border border-gray-100">
      <ElEmpty description="此活動目前設定為：不需報名表" />
    </div>

    <!-- 情境 2: 報名表管理介面 -->
    <div v-else class="space-y-6">
      
      <!-- A. 頂部狀態列 (已產製時顯示管理清單，未產製時顯示配置入口) -->
      <div v-if="isCreatedOrBound" class="animate-fade-in">
        <ElCard shadow="never" class="!rounded-2xl border-gray-200 bg-gray-900 border-l-[6px] border-emerald-500">
          <div class="flex flex-wrap items-center justify-between gap-4">
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-xl flex items-center justify-center border border-emerald-500/30">
                <svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z" /></svg>
              </div>
              <div class="flex flex-col">
                <span class="text-white font-bold text-lg">Google 表單已綁定</span>
                <span class="text-gray-400 text-xs">系統正在自動同步報名名單</span>
              </div>
            </div>
            <div class="flex-1 max-w-xl px-4">
              <ElInput v-model="formUrl" readonly size="default" class="custom-dark-input">
                <template #prefix><span class="text-gray-600">🔗</span></template>
              </ElInput>
            </div>
            <div class="flex gap-2">
              <ElButton type="primary" plain @click="handleCopy">複製連結</ElButton>
              <ElButton type="warning" plain @click="isCreatedOrBound = false">編輯</ElButton>
              <ElButton type="danger" plain @click="handleDeleteUrl">移除綁定</ElButton>
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

      <!-- C. 下層部分: 報名名單 (只要開啟報名表就顯示，若無名單則空置) -->
      <div v-if="isDisplay" class="animate-fade-in pt-4">
        <ElCard shadow="never" class="!rounded-2xl border-gray-200">
          <template #header>
            <div class="flex justify-between items-center">
              <span class="font-bold text-gray-800 text-lg">已填寫名單</span>
              <div class="flex items-center gap-4 text-sm">
                 <span v-if="props.eventData.is_approve" class="bg-orange-100 text-orange-600 px-3 py-1 rounded-full font-bold">⚠️ 此活動需經審核</span>
                 <span class="text-gray-500 font-medium">目前共 {{ displayList.length }} 筆</span>
              </div>
            </div>
          </template>
          <ElTable :data="displayList" stripe border class="w-full" empty-text="目前尚無報名資料">
            <ElTableColumn prop="name" label="姓名" width="150"><template #default="{row}"><span class="font-bold text-blue-600">{{ row.name }}</span></template></ElTableColumn>
            <ElTableColumn prop="company" label="公司單位" min-width="200" />
            <ElTableColumn prop="mobile" label="行動電話" width="180" />
            <ElTableColumn v-if="props.eventData.is_approve" label="審核狀態" width="120">
               <template #default="{row}">
                 <span :class="row.status === 1 ? 'text-green-600' : 'text-gray-400'">{{ row.status === 1 ? '已通過' : '待審核' }}</span>
               </template>
            </ElTableColumn>
          </ElTable>
        </ElCard>
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
</style>
