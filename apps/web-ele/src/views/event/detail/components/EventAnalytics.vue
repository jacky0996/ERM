<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { 
  ElRow, 
  ElCol, 
  ElCard, 
  ElStatistic, 
  ElProgress,
  ElDivider,
} from 'element-plus';
import { EchartsUI, useEcharts, type EchartsUIType } from '@vben/plugins/echarts';

/** 
 * 定義分析數據的強型別介面 
 * 未來後端 API 回傳時，直接載入此結構即可
 */
interface MailStats {
  total: number;
  read: number;
  unopened: number;
  deleted: number;
}

interface AnalyticsState {
  invitation: MailStats;
  survey: MailStats;
  thankyou: MailStats;
}

const props = defineProps<{
  eventId: string | number;
}>();

// 使用強型別定義模擬數據
const stats: AnalyticsState = {
  invitation: { total: 50, read: 38, unopened: 10, deleted: 2 },
  survey: { total: 45, read: 20, unopened: 20, deleted: 5 },
  thankyou: { total: 40, read: 35, unopened: 5, deleted: 0 },
};

// 計算百分比，強制確保為 number 型別
const invitationReadRate = computed<number>(() => Math.round((stats.invitation.read / stats.invitation.total) * 100));
const invitationUnopenedRate = computed<number>(() => Math.round((stats.invitation.unopened / stats.invitation.total) * 100));
const invitationDeletedRate = computed<number>(() => Math.round((stats.invitation.deleted / stats.invitation.total) * 100));
const surveyFillRate = computed<number>(() => Math.round((stats.survey.read / stats.survey.total) * 100));
const thankyouReadRate = computed<number>(() => Math.round((stats.thankyou.read / stats.thankyou.total) * 100));

// 圖表實例
const invitationChartRef = ref<EchartsUIType>();
const surveyChartRef = ref<EchartsUIType>();

const { renderEcharts: renderInvitation } = useEcharts(invitationChartRef);
const { renderEcharts: renderSurvey } = useEcharts(surveyChartRef);

onMounted(() => {
  // 渲染邀請信比例圖
  renderInvitation({
    tooltip: { trigger: 'item' },
    legend: { top: '5%', left: 'center' },
    series: [{
      name: '邀請信狀態',
      type: 'pie',
      radius: ['40%', '70%'],
      avoidLabelOverlap: false,
      itemStyle: { borderRadius: 10, borderColor: '#fff', borderWidth: 2 },
      label: { show: false, position: 'center' },
      emphasis: { label: { show: true, fontSize: 16, fontWeight: 'bold' } },
      data: [
        { value: stats.invitation.read, name: '已讀', itemStyle: { color: '#10b981' } },
        { value: stats.invitation.unopened, name: '未開啟', itemStyle: { color: '#f59e0b' } },
        { value: stats.invitation.deleted, name: '已刪除', itemStyle: { color: '#ef4444' } }
      ]
    }]
  });

  // 渲染問卷回收比例圖
  renderSurvey({
    tooltip: { trigger: 'item' },
    series: [{
      name: '問卷狀態',
      type: 'pie',
      roseType: 'area',
      radius: [10, 80],
      center: ['50%', '50%'],
      itemStyle: { borderRadius: 8 },
      data: [
        { value: stats.survey.read, name: '已填寫', itemStyle: { color: '#6366f1' } },
        { value: stats.survey.unopened, name: '未填寫', itemStyle: { color: '#94a3b8' } },
        { value: stats.survey.deleted, name: '拒絕參與', itemStyle: { color: '#f43f5e' } }
      ]
    }]
  });
});
</script>

<template>
  <div class="event-analytics p-2 space-y-12 animate-fade-in">
    
    <section>
      <div class="flex items-center gap-3 mb-6">
        <div class="w-2 h-6 bg-blue-500 rounded-full shadow-lg shadow-blue-200"></div>
        <h3 class="text-xl font-bold text-gray-800">活動信件 (含邀請信) 追蹤統計</h3>
      </div>
      
      <ElRow :gutter="24">
        <ElCol :span="8">
           <div class="bg-white rounded-3xl border border-gray-100 shadow-sm p-4 overflow-hidden h-72">
              <EchartsUI ref="invitationChartRef" class="w-full h-full" />
           </div>
        </ElCol>

        <ElCol :span="16">
          <div class="grid grid-cols-2 gap-4 h-full">
            <ElCard shadow="never" class="!rounded-3xl !border-blue-50 bg-blue-50/20">
              <ElStatistic title="總計寄出" :value="stats.invitation.total" suffix="封" />
              <div class="mt-4 flex items-center gap-2">
                 <span class="text-xs text-secondary italic">送達率 100%</span>
                 <ElProgress :percentage="100" color="#2563eb" :show-text="false" stroke-width="6" class="flex-1" />
              </div>
            </ElCard>
            <ElCard shadow="never" class="!rounded-3xl !border-emerald-50 bg-emerald-50/20">
              <ElStatistic title="讀取開啟率" :value="invitationReadRate" suffix="%" :value-style="{ color: '#059669' }" />
              <div class="mt-4 flex items-center gap-2">
                 <span class="text-xs text-emerald-600 font-bold">已讀 {{ stats.invitation.read }} 人</span>
                 <ElProgress :percentage="invitationReadRate" status="success" :show-text="false" stroke-width="12" class="flex-1" />
              </div>
            </ElCard>
            <ElCard shadow="never" class="!rounded-3xl border-orange-50 bg-orange-50/20">
              <ElStatistic title="尚未回應" :value="stats.invitation.unopened" :value-style="{ color: '#d97706' }" />
              <div class="mt-4">
                 <ElProgress :percentage="invitationUnopenedRate" color="#fbbf24" :show-text="false" stroke-width="4" />
              </div>
            </ElCard>
            <ElCard shadow="never" class="!rounded-3xl border-red-50 bg-red-50/20">
              <ElStatistic title="直接刪除" :value="stats.invitation.deleted" :value-style="{ color: '#dc2626' }" />
              <div class="mt-4">
                 <ElProgress :percentage="invitationDeletedRate" color="#f87171" :show-text="false" stroke-width="4" />
              </div>
            </ElCard>
          </div>
        </ElCol>
      </ElRow>
    </section>

    <ElDivider />

    <section>
      <div class="flex items-center gap-3 mb-6">
        <div class="w-2 h-6 bg-indigo-500 rounded-full shadow-lg shadow-indigo-100"></div>
        <h3 class="text-xl font-bold text-gray-800">問卷分發與自動回收統計</h3>
      </div>
      <ElRow :gutter="24">
         <ElCol :span="16">
            <div class="grid grid-cols-2 gap-4 mb-4">
               <div class="p-8 bg-indigo-600 rounded-[32px] text-white shadow-xl shadow-indigo-100 flex flex-col justify-center">
                  <p class="text-xs text-indigo-100 mb-1 uppercase tracking-widest font-bold">問卷已回收份數</p>
                  <p class="text-3xl font-black text-white">{{ stats.survey.read }} <span class="text-base font-normal text-indigo-200">/ {{ stats.survey.total }} 封</span></p>
               </div>
               <div class="p-8 bg-white border-2 border-indigo-50 rounded-[32px] shadow-sm flex flex-col justify-center text-center">
                  <p class="text-xs text-gray-500 mb-1 font-bold uppercase tracking-widest">總表單填寫比例</p>
                  <p class="text-4xl font-black text-indigo-600">{{ surveyFillRate }}%</p>
               </div>
            </div>
            <div class="p-8 bg-white border border-gray-100 rounded-[32px] shadow-sm">
               <p class="font-bold text-gray-800 mb-6 text-sm underline decoration-indigo-300 underline-offset-4 font-bold">電子廣告信件連結點擊分佈 (Heatmap)</p>
               <div class="space-y-6">
                  <div>
                    <div class="flex justify-between text-xs mb-2 font-bold"><span>問卷點擊鈕</span><span>82%</span></div>
                    <ElProgress :percentage="82" stroke-width="12" color="#4f46e5" />
                  </div>
                  <div>
                    <div class="flex justify-between text-xs mb-2 font-bold text-gray-400"><span>活動分頁詳情連結</span><span>15%</span></div>
                    <ElProgress :percentage="15" color="#94a3b8" stroke-width="12" />
                  </div>
               </div>
            </div>
         </ElCol>
         <ElCol :span="8">
            <div class="bg-white rounded-3xl border border-gray-100 shadow-sm p-4 h-full min-h-[300px]">
               <EchartsUI ref="surveyChartRef" class="w-full h-full" />
            </div>
         </ElCol>
      </ElRow>
    </section>

    <ElDivider />

    <section>
      <div class="flex items-center gap-3 mb-6">
        <div class="w-2 h-6 bg-emerald-500 rounded-full shadow-sm shadow-emerald-200"></div>
        <h3 class="text-xl font-bold text-gray-800">活動感謝函開啟率與反應</h3>
      </div>
      <div class="bg-gray-900 p-10 rounded-[40px] shadow-xl text-white">
        <div class="flex items-center justify-around">
           <div class="text-center">
              <p class="text-xs text-gray-500 mb-1 font-bold tracking-widest uppercase">感謝函發行次數</p>
              <p class="text-5xl font-black">{{ stats.thankyou.total }}</p>
           </div>
           <div class="h-10 w-px bg-gray-700"></div>
           <div class="text-center">
              <p class="text-xs text-gray-500 mb-1 font-bold tracking-widest uppercase">感謝函總讀取率</p>
              <p class="text-5xl font-black text-emerald-400">{{ thankyouReadRate }}%</p>
           </div>
           <div class="h-10 w-px bg-gray-700"></div>
           <div class="text-center">
              <p class="text-xs text-gray-500 mb-1 font-bold tracking-widest uppercase">零點擊忽略率</p>
              <p class="text-5xl font-black text-orange-400">12.5%</p>
           </div>
        </div>
      </div>
    </section>

  </div>
</template>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.5s cubic-bezier(0.165, 0.84, 0.44, 1) forwards;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
:deep(.el-statistic__content) {
  font-weight: 800;
  font-size: 28px;
}
</style>
