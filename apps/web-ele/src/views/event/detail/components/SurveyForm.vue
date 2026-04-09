<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import {
  ElButton,
  ElCard,
  ElForm,
  ElFormItem,
  ElInput,
  ElMessage,
  ElMessageBox,
  ElSelect,
  ElOption,
  ElSwitch,
  ElTable,
  ElTableColumn,
} from 'element-plus';
import { requestClient } from '#/api/request';

const props = defineProps<{
  eventData: any;
}>();

const loading = ref(false);
const isCreated = ref(false); 
const formUrl = ref('');
const editUrl = ref('');
const displayList = ref<any[]>([
  { name: '王大明', email: 'ming@example.com', status: 1, reply: 1 },
  { name: '李小美', email: 'mei@example.com', status: 1, reply: 0 },
  { name: '陳建國', email: 'chen@example.com', status: 0, reply: 0 },
]);

// 問券配置資料 (強型別)
interface Question {
  label: string;
  type: string;
  required: boolean;
  options: string[];
}

const config = reactive({
  title: `${props.eventData?.title} - 活動滿意度調查`,
  description: '謝謝您參加本次活動！為了讓我們未來做得更好，請撥冗填寫以下回饋。',
  customQuestions: [
    { 
      label: '您對本次活動的整體滿意度如何？', 
      type: 'dropdown', 
      required: true, 
      options: ['非常滿意', '滿意', '普通', '不滿意', '非常不滿意']
    },
    {
      label: '未來您是否願意參加類似活動？',
      type: 'radio',
      required: true,
      options: ['是', '否', '考慮中']
    }
  ] as Question[]
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

onMounted(() => {
  if (props.eventData?.survey_url) {
    formUrl.value = props.eventData.survey_url;
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

// 移除被取代的 addSubOption

async function handleCreateSurvey() {
  try {
    await ElMessageBox.confirm('將依據目前配置產製 Google 問卷表單？', '產製問卷', {
      confirmButtonText: '確定產製',
      cancelButtonText: '取消',
      type: 'info'
    });
    
    loading.value = true;
    
    // 呼叫後端 API (假設共用同一接口，或傳入 type=survey)
    const res: any = await requestClient.post('/edm/event/createGoogleForm', {
      event_id: props.eventData.id,
      type: 'survey', // 指定為問券類型
      config: config
    }, {
      responseReturn: 'body'
    });

    if (res && (res.code === 200 || res.code === 0 || res.status === true)) {
      isCreated.value = true;
      formUrl.value = res.data?.view_url || '';
      editUrl.value = res.data?.edit_url || '';
      ElMessage.success('Google 問卷表單產製成功！');
    } else {
      throw new Error(res?.msg || '產製失敗');
    }
  } catch (error: any) {
    if (error !== 'cancel') {
       ElMessage.error(error.message || '發生異常');
    }
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div v-loading="loading" class="survey-form-config p-2">
    
    <!-- 頂部狀態列 (已產製時顯示管理清單，未產製時顯示配置入口) -->
    <div v-if="isCreated" class="animate-fade-in">
      <ElCard shadow="never" class="!rounded-2xl border-gray-200 bg-gray-900 border-l-[6px] border-indigo-500">
        <div class="flex flex-wrap items-center justify-between gap-4">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 bg-indigo-500/20 text-indigo-400 rounded-xl flex items-center justify-center border border-indigo-500/30">
              <svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z" /></svg>
            </div>
            <div class="flex flex-col">
              <span class="text-white font-bold text-lg">Google 問卷已產製</span>
              <span class="text-gray-400 text-xs">專屬表單與編輯器皆已配置就緒</span>
            </div>
          </div>
          <div class="flex-1 max-w-xl px-4">
            <ElInput v-model="formUrl" readonly size="default" class="custom-dark-input">
              <template #prefix><span class="text-gray-600">🔗</span></template>
            </ElInput>
          </div>
          <div class="flex gap-2">
            <ElButton type="primary" plain @click="openExternalLink(formUrl)">前往填寫頁面</ElButton>
            <ElButton type="warning" plain @click="openExternalLink(editUrl)">雲端編輯器</ElButton>
            <ElButton type="info" plain @click="isCreated = false">重新配置介面</ElButton>
          </div>
        </div>
      </ElCard>
    </div>

    <!-- 配置器區塊 (未產製/重新配置時顯示) -->
    <div v-if="!isCreated" class="space-y-6 animate-fade-in mt-4">
      <div class="flex items-center justify-between px-2">
         <div class="flex flex-col">
            <h3 class="text-xl font-bold text-gray-800">設計問卷內容</h3>
            <p class="text-sm text-gray-500">設定完畢後點擊下方按鈕，系統將自動在雲端建立問卷表單</p>
         </div>
         <div class="flex items-center gap-2">
            <span class="text-indigo-500 text-sm font-bold">* 問卷支援後續持續擴充選項</span>
         </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <!-- 左側：基礎設定 -->
        <div class="lg:col-span-4 space-y-6">
          <ElCard shadow="never" class="!rounded-2xl border-gray-200">
             <template #header><span class="font-bold">1. 問卷資訊</span></template>
             <ElForm label-position="top">
                <ElFormItem label="問卷主標題"><ElInput v-model="config.title" /></ElFormItem>
                <ElFormItem label="問卷前言說明"><ElInput v-model="config.description" type="textarea" :rows="3" /></ElFormItem>
             </ElForm>
          </ElCard>
        </div>

        <!-- 右側：自訂問項 -->
        <div class="lg:col-span-8">
          <ElCard shadow="never" class="!rounded-2xl border-gray-200 min-h-[500px]">
             <template #header>
                <div class="flex justify-between items-center">
                  <span class="font-bold">2. 問項設計區</span>
                  <ElButton type="primary" size="small" @click="addQuestion">+ 新增題目</ElButton>
                </div>
             </template>
             
             <div class="space-y-4">
                <div v-for="(q, index) in config.customQuestions" :key="index" class="p-6 border-2 border-gray-100 rounded-xl bg-white relative hover:border-indigo-300 transition-colors shadow-sm">
                  <div class="flex gap-4 items-start">
                    <div class="flex-1"><ElInput v-model="q.label" placeholder="題目標題..." /></div>
                    <div class="w-40"><ElSelect v-model="q.type"><ElOption v-for="o in typeOptions" :key="o.value" :label="o.label" :value="o.value" /></ElSelect></div>
                    <div class="flex items-center gap-2 pt-1 font-medium text-xs"><span class="text-gray-500">必填</span><ElSwitch v-model="q.required" size="small" /></div>
                    <ElButton type="danger" link @click="removeQuestion(index)">移除</ElButton>
                  </div>
                  
                  <div v-if="hasOptions(q.type)" class="mt-4 pl-4 border-l-2 border-indigo-200 space-y-2">
                     <div v-for="(_, oi) in q.options" :key="oi" class="flex gap-2">
                        <ElInput v-model="q.options[oi]" size="small" placeholder="選項文字..." />
                        <ElButton type="danger" link @click="q.options.splice(oi,1)">x</ElButton>
                     </div>
                     <ElButton type="primary" link size="small" @click="q.options.push('')">+ 增加選項</ElButton>
                  </div>
                </div>
                <div v-if="config.customQuestions.length === 0" class="flex flex-col items-center justify-center py-20 text-gray-400">
                  <svg viewBox="0 0 24 24" width="48" height="48" class="mb-2 opacity-20"><path fill="currentColor" d="M19,3H5C3.89,3 3,3.89 3,5V19C3,20.11 3.89,21 5,21H19C20.11,21 21,20.11 21,19V5C21,3.89 20.11,3 19,3M19,19H5V5H19V19M11,7H13V11H17V13H13V17H11V13H7V11H11V7Z" /></svg>
                  <span>尚未增加任何問項</span>
                </div>
             </div>
          </ElCard>
          
          <div class="mt-8">
            <ElButton type="primary" class="w-full !h-16 !rounded-2xl text-xl font-bold shadow-xl !bg-indigo-600 !border-indigo-600 hover:!bg-indigo-700 hover:!border-indigo-700" :loading="loading" @click="handleCreateSurvey">
               🚀 同步雲端：產製 Google 活動回饋問卷
            </ElButton>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 產出後的 iframe 預覽區 -->
    <div v-if="isCreated" class="animate-fade-in pt-6">
       <div class="h-[750px] bg-white rounded-3xl overflow-hidden border border-gray-200 shadow-sm relative">
          <!-- iframe placeholder or spinner if needed later -->
          <iframe :src="formUrl" width="100%" height="100%" frameborder="0" class="absolute inset-0 z-10 bg-transparent">載入中...</iframe>
       </div>

       <!-- 下層部分: 問卷發送與回覆清單 -->
       <div class="pt-6">
         <ElCard shadow="never" class="!rounded-2xl border-gray-200">
           <template #header>
             <div class="flex justify-between items-center">
               <div class="flex items-center gap-3">
                  <div class="w-1.5 h-6 bg-indigo-500 rounded-full"></div>
                  <span class="font-bold text-gray-800 text-lg">問卷發送與回覆清單</span>
               </div>
               <div class="flex items-center gap-4 text-sm">
                  <span class="text-gray-500 font-medium">目前共 {{ displayList.length }} 筆發送對象</span>
               </div>
             </div>
           </template>
           <ElTable :data="displayList" stripe border class="w-full" empty-text="目前尚無發送目標資料">
             <ElTableColumn prop="name" label="姓名" width="150"><template #default="{row}"><span class="font-bold text-indigo-600">{{ row.name }}</span></template></ElTableColumn>
             <ElTableColumn prop="email" label="電子郵件" min-width="200" />
             <ElTableColumn label="發送狀態" width="150" align="center">
                <template #default="{row}">
                  <div class="flex justify-center items-center gap-1">
                     <div class="w-2 h-2 rounded-full" :class="row.status === 1 ? 'bg-green-500' : 'bg-gray-300'"></div>
                     <span :class="row.status === 1 ? 'text-green-600 font-bold' : 'text-gray-400'">{{ row.status === 1 ? '已發送' : '待發送' }}</span>
                  </div>
                </template>
             </ElTableColumn>
             <ElTableColumn label="問卷回覆狀態" width="150" align="center">
                <template #default="{row}">
                  <span v-if="row.reply === 1" class="text-indigo-600 font-bold bg-indigo-50 px-3 py-1 rounded-full text-xs border border-indigo-100">已回覆填寫</span>
                  <span v-else class="text-gray-400">尚未回覆</span>
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
