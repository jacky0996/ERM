<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import {
  ElButton,
  ElCard,
  ElCheckbox,
  ElCheckboxGroup,
  ElForm,
  ElFormItem,
  ElInput,
  ElDivider,
  ElMessage,
  ElMessageBox,
  ElSelect,
  ElOption,
  ElSwitch,
} from 'element-plus';
import { requestClient } from '#/api/request';

const props = defineProps<{
  eventData: any;
}>();

const loading = ref(false);
const isCreated = ref(false); 
const formUrl = ref('');
const editUrl = ref('');

// 配置資料
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

const hasOptions = (type: string) => ['radio', 'checkbox', 'dropdown'].includes(type);

const fieldOptions = [
  { label: '姓名', value: 'name', disabled: true },
  { label: '行動電話', value: 'mobile', disabled: true },
  { label: '電子郵件', value: 'email', disabled: true },
  { label: '公司名稱', value: 'company' },
  { label: '職稱', value: 'job_title' },
  { label: '餐旅需求', value: 'dietary' },
];

onMounted(() => {
  if (props.eventData?.google_form_url) {
    formUrl.value = props.eventData.google_form_url;
    isCreated.value = true;
  }
});

function openExternalLink(url: string) {
  if (url) window.open(url, '_blank');
}

function addQuestion() {
  config.customQuestions.push({ 
    label: '', 
    type: 'text', 
    required: false, 
    options: [] 
  });
}

function removeQuestion(index: number) {
  config.customQuestions.splice(index, 1);
}

function addSubOption(qIdx: number) {
  config.customQuestions[qIdx].options.push('');
}

async function handleCreateForm() {
  try {
    if (!props.eventData?.id) {
       ElMessage.error('活動資訊不完整，無法產製表單');
       return;
    }

    await ElMessageBox.confirm('將依據目前配置產製 Google 表單，產製後會自動綁定至此活動。確定執行？', '產製表單', {
      confirmButtonText: '確定',
      cancelButtonText: '取消',
      type: 'primary'
    });
    
    loading.value = true;
    
    const res: any = await requestClient.post('/edm/event/createGoogleForm', {
      event_id: props.eventData.id,
      config: config
    }, {
      responseReturn: 'body'
    });

    if (res && (res.code === 200 || res.code === 0 || res.status === true)) {
      isCreated.value = true;
      formUrl.value = res.data?.view_url || '';
      editUrl.value = res.data?.edit_url || '';
      ElMessage.success('Google 表單產製成功！');
    } else {
      throw new Error(res?.msg || '產製失敗，請檢查權限設定');
    }
  } catch (error: any) {
    if (error !== 'cancel') {
       ElMessage.error(error.message || '產製過程發生異常');
    }
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="registration-form-config p-4 bg-white rounded-2xl">
    
    <div v-if="!isCreated" class="space-y-6 animate-fade-in">
      <!-- 標題與描述 -->
      <ElCard shadow="never" class="!rounded-2xl border-gray-200 bg-gray-50/50">
        <template #header><span class="font-bold text-gray-800">1. Google 表單基本內容</span></template>
        <ElForm label-position="top">
          <ElFormItem label="表單主標題" class="!mb-6">
             <template #label><span class="font-semibold text-gray-700">表單主標題</span></template>
             <ElInput v-model="config.title" placeholder="請輸入標題" />
          </ElFormItem>
          <ElFormItem label="表單介紹說明">
             <template #label><span class="font-semibold text-gray-700">表單介紹說明</span></template>
             <ElInput v-model="config.description" type="textarea" :rows="3" placeholder="請輸入表單說明文字" />
          </ElFormItem>
        </ElForm>
      </ElCard>

      <!-- 欄位設定 -->
      <ElCard shadow="never" class="!rounded-2xl border-gray-200">
        <template #header><span class="font-bold text-gray-800">2. 報名資料與自訂問項</span></template>
        <div class="mb-4">
          <p class="text-xs font-bold text-gray-900 mb-3 uppercase tracking-wider">標配基本欄位</p>
          <ElCheckboxGroup v-model="config.standardFields" class="grid grid-cols-2 md:grid-cols-3 gap-3">
            <ElCheckbox 
              v-for="field in fieldOptions" 
              :key="field.value" 
              :label="field.label" 
              :value="field.value" 
              :disabled="field.disabled" 
              border 
              class="!mr-0 w-full"
            />
          </ElCheckboxGroup>
        </div>
        
        <ElDivider border-style="dashed"><span class="text-gray-400 font-normal px-4">自訂申報問項區</span></ElDivider>
        
        <div class="space-y-6 mt-6">
          <div v-for="(q, index) in config.customQuestions" :key="index" class="question-card p-6 bg-white rounded-xl relative border-2 border-gray-100 hover:border-blue-400 transition-colors shadow-sm">
            <div class="flex flex-wrap gap-6 items-start">
              <div class="flex-1 min-w-[300px]">
                <label class="text-sm font-bold text-gray-800 block mb-2">題目：</label>
                <ElInput v-model="q.label" placeholder="例如：請問您從何處得知本活動？" class="title-input" />
              </div>
              <div class="w-64">
                <label class="text-sm font-bold text-gray-800 block mb-2">問項類型：</label>
                <ElSelect v-model="q.type" class="w-full">
                  <ElOption v-for="opt in typeOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
                </ElSelect>
              </div>
              <div class="flex flex-col items-center">
                <label class="text-sm font-bold text-gray-800 block mb-2">必填項</label>
                <ElSwitch v-model="q.required" />
              </div>
              <ElButton type="danger" plain size="small" @click="removeQuestion(index)" class="self-start mt-8">移除此題</ElButton>
            </div>
            
            <!-- 選項管理 -->
            <div v-if="hasOptions(q.type)" class="mt-6 pl-5 border-l-4 border-blue-500 bg-blue-50/30 p-5 rounded-r-lg space-y-3">
               <p class="text-xs font-bold text-blue-700 mb-2 flex items-center gap-1">
                  <svg viewBox="0 0 24 24" width="14" height="14"><path fill="currentColor" d="M7,15L12,10L17,15H7Z" /></svg>
                  選項配置（請輸入每個答案選項）：
               </p>
               <div v-for="(_, oIdx) in q.options" :key="oIdx" class="flex gap-2">
                  <ElInput v-model="q.options[oIdx]" size="small" placeholder="選項文字，例如：Google 廣告" />
                  <ElButton type="danger" link size="small" @click="q.options.splice(oIdx, 1)">x</ElButton>
               </div>
               <ElButton type="primary" size="small" plain class="mt-2" @click="addSubOption(index)">+ 新增一個子選項</ElButton>
            </div>

            <div v-else class="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
               <span class="text-xs text-gray-600 font-medium italic">此類型（{{ typeOptions.find(t=>t.value===q.type)?.label }}）為開放式填答，產製時會自動對接 Google 表單元件。</span>
            </div>
          </div>
          
          <ElButton type="primary" class="w-full h-14 !rounded-xl !bg-blue-600 !border-blue-600 !text-white hover:!bg-blue-700 active:!bg-blue-800 shadow-md transition-all" @click="addQuestion">
            <span class="flex items-center justify-center gap-2 font-medium text-sm">
               <svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z" /></svg>
               增加一份新的自訂問卷題目
            </span>
          </ElButton>
        </div>
      </ElCard>

      <div class="text-center py-10">
        <ElButton type="primary" size="large" class="!px-24 !rounded-2xl shadow-xl !h-16 font-bold text-xl hover:scale-[1.02] transition-transform" :loading="loading" @click="handleCreateForm">
          🚀 發送至雲端並生成 Google 表單
        </ElButton>
      </div>
    </div>

    <!-- 成功預覽區 -->
    <div v-else class="space-y-6 animate-fade-in p-2">
      <div class="flex justify-between items-center bg-gray-900 p-6 rounded-2xl shadow-lg border-l-8 border-emerald-500">
        <div class="flex items-center gap-5">
          <div class="w-14 h-14 bg-emerald-500/20 text-emerald-400 rounded-2xl flex items-center justify-center border border-emerald-500/30">
            <svg viewBox="0 0 24 24" width="32" height="32"><path fill="currentColor" d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z" /></svg>
          </div>
          <div>
            <h3 class="font-bold text-xl text-white">Google 表單已成功生成！</h3>
            <p class="text-sm text-gray-300 font-medium">所有回覆數據現在已與此專案後端同步連結</p>
          </div>
        </div>
        <div class="flex gap-3">
          <ElButton bg type="info" @click="isCreated = false" class="!rounded-lg !px-6 !h-11">重新設定</ElButton>
          <ElButton type="success" @click="openExternalLink(editUrl || formUrl)" class="!rounded-lg !px-6 !h-11 shadow-md shadow-emerald-500/20">
             <span class="flex items-center gap-2 font-bold">
                <svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M14.06,9L15,9.94L5.92,19H5V18.08L14.06,9M17.66,3C17.41,3 17.15,3.1 16.96,3.29L15.13,5.12L18.88,8.87L20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18.17,3.09 17.92,3 17.66,3M14.06,6.19L3,17.25V21H6.75L17.81,9.94L14.06,6.19Z" /></svg>
                開啟編輯後台
             </span>
          </ElButton>
        </div>
      </div>

      <div class="h-[800px] bg-white rounded-2xl overflow-hidden border-4 border-gray-100 shadow-2xl relative">
         <iframe :src="formUrl" width="100%" height="100%" frameborder="0">載入中...</iframe>
      </div>
    </div>

  </div>
</template>

<style scoped>
.registration-form-config :deep(.el-checkbox.is-bordered.is-checked) {
  border-color: #3b82f6;
  background-color: #eff6ff;
  border-width: 2px;
}
.registration-form-config :deep(.el-checkbox__label) {
  color: #374151 !important;
  font-weight: 600;
}
.title-input :deep(.el-input__wrapper) {
  background-color: #f9fafb;
}
.animate-fade-in {
  animation: fadeIn 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
