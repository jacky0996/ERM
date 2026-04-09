<script setup lang="ts">
import { ref } from 'vue';
import {
  ElButton,
  ElCard,
  ElForm,
  ElFormItem,
  ElInput,
  ElTable,
  ElTableColumn,
  ElMessage
} from 'element-plus';

const props = defineProps<{
  eventData: any;
}>();

const loading = ref(false);
const isConfigured = ref(false); 

const config = ref({
  subject: `${props.eventData?.title} - 感謝您的參與！`,
  content: '親愛的貴賓您好：\n\n感謝您撥冗參加本次活動，希望活動內容對您有所幫助。\n隨信附上本次活動的相關資料與花絮。\n\n期待未來能再次與您相見！\n\n敬祝，順心',
});

// 模擬發送名單
const displayList = ref<any[]>([
  { name: '王大明', email: 'ming@example.com', status: 1, open: 1 },
  { name: '李小美', email: 'mei@example.com', status: 1, open: 0 },
  { name: '陳建國', email: 'chen@example.com', status: 0, open: 0 },
]);

async function handleSaveConfig() {
  loading.value = true;
  setTimeout(() => {
    loading.value = false;
    isConfigured.value = true;
    ElMessage.success('感謝函內容已儲存！開始進行發送追蹤。');
  }, 600);
}

function handleSendTest() {
  ElMessage.success('測試感謝函已送出！');
}
</script>

<template>
  <div v-loading="loading" class="thankyou-form-config p-2">
    
    <!-- 頂部狀態列 -->
    <div v-if="isConfigured" class="animate-fade-in">
      <ElCard shadow="never" class="!rounded-2xl border-gray-200 bg-gray-900 border-l-[6px] border-emerald-500">
        <div class="flex flex-wrap items-center justify-between gap-4">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-xl flex items-center justify-center border border-emerald-500/30">
              <svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M20,8L12,13L4,8V6L12,11L20,6M20,4H4C2.89,4 2,4.89 2,6V18A2,2 0 0,0 4,20H20A2,2 0 0,0 22,18V6C22,4.89 21.1,4 20,4Z" /></svg>
            </div>
            <div class="flex flex-col">
              <span class="text-white font-bold text-lg">感謝函已啟用</span>
              <span class="text-gray-400 text-xs">系統正持續監測發送與開信狀態</span>
            </div>
          </div>
          <div class="flex gap-2">
            <ElButton type="primary" plain @click="handleSendTest">發送測試信</ElButton>
            <ElButton type="info" plain @click="isConfigured = false">重新編輯內容</ElButton>
          </div>
        </div>
      </ElCard>
    </div>

    <!-- 配置器區塊 -->
    <div v-if="!isConfigured" class="space-y-6 animate-fade-in mt-4">
      <div class="flex items-center justify-between px-2">
         <div class="flex flex-col">
            <h3 class="text-xl font-bold text-gray-800">編輯活動感謝函</h3>
            <p class="text-sm text-gray-500">活動結束後，系統將依據此處設定的內容自動或手動寄發給與會名單</p>
         </div>
      </div>

      <ElCard shadow="never" class="!rounded-2xl border-gray-200">
         <template #header>
            <div class="flex justify-between items-center">
              <span class="font-bold">感謝函內容配置</span>
            </div>
         </template>
         
         <ElForm label-position="top">
            <ElFormItem label="信件主旨 (Subject)">
              <ElInput v-model="config.subject" placeholder="請輸入感謝函信件主旨" />
            </ElFormItem>
            
            <ElFormItem label="信件內文 (Content)">
              <ElInput 
                v-model="config.content" 
                type="textarea" 
                :rows="10" 
                placeholder="請輸入感謝函內文..." 
              />
            </ElFormItem>
         </ElForm>
         
         <div class="mt-6 flex justify-end gap-return">
           <ElButton type="primary" class="!h-12 !px-10 !rounded-xl font-bold shadow-md !bg-emerald-600 !border-emerald-600 hover:!bg-emerald-700" :loading="loading" @click="handleSaveConfig">
              儲存並啟用感謝函
           </ElButton>
         </div>
      </ElCard>
    </div>
    
    <!-- 下層部分: 感謝函發送清單 (啟用後顯示) -->
    <div v-if="isConfigured" class="animate-fade-in pt-6">
       <ElCard shadow="never" class="!rounded-2xl border-gray-200">
         <template #header>
           <div class="flex justify-between items-center">
             <div class="flex items-center gap-3">
                <div class="w-1.5 h-6 bg-emerald-500 rounded-full"></div>
                <span class="font-bold text-gray-800 text-lg">感謝函發送清單</span>
             </div>
             <div class="flex items-center gap-4 text-sm">
                <span class="text-gray-500 font-medium">目前共 {{ displayList.length }} 筆寄送對象</span>
             </div>
           </div>
         </template>
         <ElTable :data="displayList" stripe border class="w-full" empty-text="目前尚無發送目標資料">
           <ElTableColumn prop="name" label="姓名" width="150"><template #default="{row}"><span class="font-bold text-emerald-600">{{ row.name }}</span></template></ElTableColumn>
           <ElTableColumn prop="email" label="電子郵件" min-width="200" />
           <ElTableColumn label="發送狀態" width="150" align="center">
              <template #default="{row}">
                <div class="flex justify-center items-center gap-1">
                   <div class="w-2 h-2 rounded-full" :class="row.status === 1 ? 'bg-green-500' : 'bg-gray-300'"></div>
                   <span :class="row.status === 1 ? 'text-green-600 font-bold' : 'text-gray-400'">{{ row.status === 1 ? '已成功送達' : '待發送' }}</span>
                </div>
              </template>
           </ElTableColumn>
           <ElTableColumn label="開信狀態" width="150" align="center">
              <template #default="{row}">
                <span v-if="row.open === 1" class="text-emerald-600 font-bold bg-emerald-50 px-3 py-1 rounded-full text-xs border border-emerald-100">已開啟</span>
                <span v-else class="text-gray-400">尚未開啟</span>
              </template>
           </ElTableColumn>
         </ElTable>
       </ElCard>
    </div>

  </div>
</template>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.4s ease-out forwards;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
