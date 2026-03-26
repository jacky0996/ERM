<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import {
  ElButton,
  ElCard,
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

function addSubOption(qIdx: number) {
  config.customQuestions[qIdx].options.push('');
}

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
      form_type: 'survey', // 指定為問券類型
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
  <div class="survey-form-config p-4 bg-white rounded-2xl">
    
    <div v-if="!isCreated" class="space-y-6 animate-fade-in">
      <ElCard shadow="never" class="!rounded-2xl border-gray-200 bg-gray-50/50">
        <template #header><span class="font-bold text-gray-800 italic uppercase tracking-tighter">Survey Settings / 問券基本配置</span></template>
        <ElForm label-position="top">
          <ElFormItem label="問卷主標題"><ElInput v-model="config.title" /></ElFormItem>
          <ElFormItem label="問卷前言說明"><ElInput v-model="config.description" type="textarea" :rows="3" /></ElFormItem>
        </ElForm>
      </ElCard>

      <ElCard shadow="never" class="!rounded-2xl border-gray-200">
        <template #header><span class="font-bold text-gray-800 italic uppercase tracking-tighter">Content / 題項設計</span></template>
        
        <div class="space-y-6">
          <div v-for="(q, index) in config.customQuestions" :key="index" class="p-6 bg-white rounded-xl relative border-2 border-gray-100 hover:border-indigo-400 transition-colors shadow-sm">
            <div class="flex flex-wrap gap-6 items-start">
              <div class="flex-1 min-w-[300px]">
                <label class="text-xs font-bold text-indigo-900 block mb-2 font-bold uppercase tracking-widest">Question Title / 題目題目</label>
                <ElInput v-model="q.label" placeholder="請輸入問題敘述..." />
              </div>
              <div class="w-64">
                <label class="text-xs font-bold text-gray-500 block mb-2 font-bold uppercase tracking-widest">Type / 類型</label>
                <ElSelect v-model="q.type" class="w-full">
                  <ElOption v-for="opt in typeOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
                </ElSelect>
              </div>
              <div class="flex flex-col items-center">
                <label class="text-xs font-bold text-gray-500 block mb-2 font-bold uppercase tracking-widest">Required</label>
                <ElSwitch v-model="q.required" />
              </div>
              <ElButton type="danger" plain size="small" @click="removeQuestion(index)" class="self-start mt-8">移除</ElButton>
            </div>
            
            <div v-if="hasOptions(q.type)" class="mt-6 pl-5 border-l-4 border-indigo-500 bg-indigo-50/30 p-5 rounded-r-lg space-y-3">
               <p class="text-xs font-bold text-indigo-700 mb-2">Options / 選項管理：</p>
               <div v-for="(_, oIdx) in q.options" :key="oIdx" class="flex gap-2">
                  <ElInput v-model="q.options[oIdx]" size="small" placeholder="選項內容" />
                  <ElButton type="danger" link size="small" @click="q.options.splice(oIdx, 1)">x</ElButton>
               </div>
               <ElButton type="primary" size="small" plain @click="addSubOption(index)">+ 新增子選項</ElButton>
            </div>
          </div>
          
          <ElButton type="primary" class="w-full h-14 !rounded-xl !bg-indigo-600 !border-indigo-600 !text-white hover:!bg-indigo-700 active:!bg-indigo-800 shadow-md transition-all" @click="addQuestion">
            <span class="flex items-center justify-center gap-2 font-medium text-sm">
               <svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z" /></svg>
               增加一份新的問卷題目
            </span>
          </ElButton>
        </div>
      </ElCard>

      <div class="text-center py-10">
        <ElButton type="primary" size="large" class="!px-24 !rounded-2xl shadow-xl !h-16 font-bold text-xl !bg-indigo-600 border-none" :loading="loading" @click="handleCreateSurvey">
          🚀 生成 Google 活動回饋問卷
        </ElButton>
      </div>
    </div>

    <!-- 成功預覽區 -->
    <div v-else class="space-y-6 animate-fade-in p-2">
      <div class="flex justify-between items-center bg-gray-900 p-8 rounded-[40px] shadow-2xl border-l-[12px] border-indigo-500">
        <div class="flex items-center gap-6">
          <div class="w-16 h-16 bg-indigo-500/20 text-indigo-400 rounded-3xl flex items-center justify-center border border-indigo-500/30 font-bold text-2xl">?</div>
          <div>
            <h3 class="font-black text-2xl text-white">問卷表單已對接完成！</h3>
            <p class="text-sm text-gray-400 font-medium tracking-wide">後端數據將在受訪者填寫後自動同步至活動分析。 </p>
          </div>
        </div>
        <div class="flex gap-4">
          <ElButton type="info" plain @click="isCreated = false" class="!rounded-xl !px-6 !h-12 !bg-gray-800 !border-gray-700 !text-gray-300">變更配置</ElButton>
          <ElButton type="primary" @click="openExternalLink(editUrl || formUrl)" class="!rounded-xl !px-8 !h-12 !bg-indigo-500 !border-indigo-500 shadow-lg shadow-indigo-500/30 font-bold">開啟 Google 編輯器</ElButton>
        </div>
      </div>

      <div class="h-[750px] bg-white rounded-[40px] overflow-hidden border-4 border-gray-100 shadow-2xl">
         <iframe :src="formUrl" width="100%" height="100%" frameborder="0">載入中...</iframe>
      </div>
    </div>

  </div>
</template>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.5s cubic-bezier(0.165, 0.84, 0.44, 1) forwards;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(24px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
