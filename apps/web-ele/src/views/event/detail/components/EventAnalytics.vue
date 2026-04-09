<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { 
  ElRow, 
  ElCol, 
  ElProgress,
} from 'element-plus';
import { EchartsUI, useEcharts, type EchartsUIType } from '@vben/plugins/echarts';

/** 
 * 定義分析數據的強型別介面 
 */
interface MailStats {
  total: number;
  read: number;
  unopened: number;
  deleted: number;
}

interface AnalyticsState {
  invitation: MailStats; // 活動信件/EDM
  ticket: MailStats;     // 專屬邀請函
  survey: MailStats;     // 問卷
  thankyou: MailStats;   // 感謝函
}

const props = defineProps<{
  eventId: string | number;
}>();

const stats: AnalyticsState = {
  invitation: { total: 120, read: 80, unopened: 30, deleted: 10 },
  ticket: { total: 50, read: 42, unopened: 7, deleted: 1 },
  survey: { total: 45, read: 20, unopened: 20, deleted: 5 },
  thankyou: { total: 40, read: 35, unopened: 5, deleted: 0 },
};

const invitationReadRate = computed<number>(() => Math.round((stats.invitation.read / stats.invitation.total) * 100));
const invitationUnopenedRate = computed<number>(() => Math.round((stats.invitation.unopened / stats.invitation.total) * 100));
const invitationDeletedRate = computed<number>(() => Math.round((stats.invitation.deleted / stats.invitation.total) * 100));

const ticketReadRate = computed<number>(() => Math.round((stats.ticket.read / stats.ticket.total) * 100));
const ticketUnopenedRate = computed<number>(() => Math.round((stats.ticket.unopened / stats.ticket.total) * 100));
const ticketDeletedRate = computed<number>(() => Math.round((stats.ticket.deleted / stats.ticket.total) * 100));

const surveyFillRate = computed<number>(() => Math.round((stats.survey.read / stats.survey.total) * 100));
const surveyUnopenedRate = computed<number>(() => Math.round((stats.survey.unopened / stats.survey.total) * 100));

const thankyouReadRate = computed<number>(() => Math.round((stats.thankyou.read / stats.thankyou.total) * 100));

const invitationChartRef = ref<EchartsUIType>();
const ticketChartRef = ref<EchartsUIType>();
const surveyChartRef = ref<EchartsUIType>();

const { renderEcharts: renderInvitation } = useEcharts(invitationChartRef);
const { renderEcharts: renderTicket } = useEcharts(ticketChartRef);
const { renderEcharts: renderSurvey } = useEcharts(surveyChartRef);

onMounted(() => {
  // 1. 活動信件圖表 - 靛藍色系
  renderInvitation({
    tooltip: { trigger: 'item', backgroundColor: '#334155', textStyle: { color: '#f8fafc' }, borderWidth: 0 },
    legend: { show: false },
    title: {
      text: `${stats.invitation.total}`,
      subtext: '總寄出',
      left: 'center',
      top: 'center',
      textStyle: { fontSize: 32, fontWeight: 'bold', color: '#334155' },
      subtextStyle: { fontSize: 13, color: '#94a3b8', fontWeight: 'bold' }
    },
    series: [{
      name: '活動信狀態',
      type: 'pie',
      radius: ['65%', '80%'], 
      avoidLabelOverlap: false,
      itemStyle: { borderRadius: 4, borderColor: '#fff', borderWidth: 2 },
      label: { show: false },
      data: [
        { value: stats.invitation.read, name: '已讀', itemStyle: { color: '#6366f1' } }, 
        { value: stats.invitation.unopened, name: '未開啟', itemStyle: { color: '#e2e8f0' } }, 
        { value: stats.invitation.deleted, name: '已刪除', itemStyle: { color: '#cbd5e1' } } 
      ]
    }]
  });

  // 2. 邀請函圖表 - 護眼微紫色系
  renderTicket({
    tooltip: { trigger: 'item', backgroundColor: '#334155', textStyle: { color: '#f8fafc' }, borderWidth: 0 },
    legend: { show: false },
    title: {
      text: `${stats.ticket.total}`,
      subtext: '總計出',
      left: 'center',
      top: 'center',
      textStyle: { fontSize: 32, fontWeight: 'bold', color: '#334155' },
      subtextStyle: { fontSize: 13, color: '#94a3b8', fontWeight: 'bold' }
    },
    series: [{
      name: '邀請函狀態',
      type: 'pie',
      radius: ['65%', '80%'], 
      avoidLabelOverlap: false,
      itemStyle: { borderRadius: 4, borderColor: '#fff', borderWidth: 2 },
      label: { show: false },
      data: [
        { value: stats.ticket.read, name: '已讀', itemStyle: { color: '#8b5cf6' } }, 
        { value: stats.ticket.unopened, name: '未開啟', itemStyle: { color: '#e2e8f0' } }, 
        { value: stats.ticket.deleted, name: '已刪除', itemStyle: { color: '#cbd5e1' } } 
      ]
    }]
  });

  // 3. 問卷回收圖表 - 薄荷綠色系
  renderSurvey({
    tooltip: { trigger: 'item', backgroundColor: '#334155', textStyle: { color: '#f8fafc' }, borderWidth: 0 },
    legend: { show: false },
    title: {
      text: `${stats.survey.total}`,
      subtext: '總計出',
      left: 'center',
      top: 'center',
      textStyle: { fontSize: 32, fontWeight: 'bold', color: '#334155' },
      subtextStyle: { fontSize: 13, color: '#94a3b8', fontWeight: 'bold' }
    },
    series: [{
      name: '問卷狀態',
      type: 'pie',
      radius: ['65%', '80%'],
      center: ['50%', '50%'],
      itemStyle: { borderRadius: 4, borderColor: '#fff', borderWidth: 2 },
      label: { show: false },
      data: [
        { value: stats.survey.read, name: '已填寫', itemStyle: { color: '#14b8a6' } }, 
        { value: stats.survey.unopened, name: '未填寫', itemStyle: { color: '#e2e8f0' } },
        { value: stats.survey.deleted, name: '拒絕參與', itemStyle: { color: '#f1f5f9' } }
      ]
    }]
  });
});
</script>

<template>
  <div class="event-analytics p-2 space-y-12 animate-fade-in font-sans">
    
    <!-- Section 1: 廣告信/活動信件分析 -->
    <section>
      <div class="flex items-center gap-3 mb-6">
        <div class="w-1.5 h-6 bg-indigo-400 rounded-full"></div>
        <h3 class="text-xl font-bold text-slate-700 tracking-wide">活動宣傳信件追蹤分析</h3>
      </div>
      
      <div class="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
        <ElRow :gutter="48" class="items-center">
          <!-- 左圖：圓環圖 -->
          <ElCol :span="8">
             <div class="h-64 w-full relative">
                <EchartsUI ref="invitationChartRef" class="w-full h-full" />
             </div>
          </ElCol>

          <!-- 右文：對齊排版進度條 -->
          <ElCol :span="16">
            <div class="flex flex-col justify-center space-y-8 pr-4">
              
              <div class="group">
                 <div class="flex justify-between items-end mb-2">
                   <span class="text-sm font-bold text-slate-500 uppercase tracking-wide flex items-center gap-2">
                     <div class="w-2.5 h-2.5 rounded-full bg-indigo-500"></div> 已讀開啟 (Read)
                   </span>
                   <span class="text-2xl font-black text-indigo-500">{{ invitationReadRate }}<span class="text-sm text-indigo-300 ml-1">%</span></span>
                 </div>
                 <div class="flex items-center gap-4">
                   <ElProgress :percentage="invitationReadRate" color="#6366f1" :show-text="false" :stroke-width="10" class="progress-bar flex-1 group-hover:opacity-80 transition-opacity" />
                   <span class="w-12 text-right font-bold text-slate-400">{{ stats.invitation.read }}</span>
                 </div>
              </div>
              
              <div class="group">
                 <div class="flex justify-between items-end mb-2">
                   <span class="text-sm font-bold text-slate-500 uppercase tracking-wide flex items-center gap-2">
                     <div class="w-2.5 h-2.5 rounded-full bg-slate-200"></div> 尚未回應 (Unopened)
                   </span>
                   <span class="text-xl font-black text-slate-400">{{ invitationUnopenedRate }}<span class="text-sm text-slate-300 ml-1">%</span></span>
                 </div>
                 <div class="flex items-center gap-4">
                   <ElProgress :percentage="invitationUnopenedRate" color="#e2e8f0" :show-text="false" :stroke-width="10" class="progress-bar flex-1 group-hover:opacity-80 transition-opacity" />
                   <span class="w-12 text-right font-bold text-slate-400">{{ stats.invitation.unopened }}</span>
                 </div>
              </div>

              <div class="group">
                 <div class="flex justify-between items-end mb-2">
                   <span class="text-sm font-bold text-slate-500 uppercase tracking-wide flex items-center gap-2">
                     <div class="w-2.5 h-2.5 rounded-full bg-slate-300"></div> 拒絕或刪除 (Deleted)
                   </span>
                   <span class="text-xl font-black text-slate-400">{{ invitationDeletedRate }}<span class="text-sm text-slate-300 ml-1">%</span></span>
                 </div>
                 <div class="flex items-center gap-4">
                   <ElProgress :percentage="invitationDeletedRate" color="#cbd5e1" :show-text="false" :stroke-width="10" class="progress-bar flex-1 group-hover:opacity-80 transition-opacity" />
                   <span class="w-12 text-right font-bold text-slate-400">{{ stats.invitation.deleted }}</span>
                 </div>
              </div>

            </div>
          </ElCol>
        </ElRow>
      </div>
    </section>

    <!-- Section 2: 邀請函分析 -->
    <section>
      <div class="flex items-center gap-3 mb-6">
        <div class="w-1.5 h-6 bg-violet-400 rounded-full"></div>
        <h3 class="text-xl font-bold text-slate-700 tracking-wide">邀請函開信率與反應分析</h3>
      </div>
      
      <div class="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
        <ElRow :gutter="48" class="items-center">
           <!-- 左圖：圓環圖 -->
           <ElCol :span="8">
              <div class="h-64 w-full relative">
                 <EchartsUI ref="ticketChartRef" class="w-full h-full" />
              </div>
           </ElCol>

           <!-- 右文：對齊排版進度條 -->
           <ElCol :span="16">
              <div class="flex flex-col justify-center space-y-8 pr-4">
                
                <div class="group">
                   <div class="flex justify-between items-end mb-2">
                     <span class="text-sm font-bold text-slate-500 uppercase tracking-wide flex items-center gap-2">
                       <div class="w-2.5 h-2.5 rounded-full bg-violet-500"></div> 已讀開啟 (Read)
                     </span>
                     <span class="text-2xl font-black text-violet-600">{{ ticketReadRate }}<span class="text-sm text-violet-300 ml-1">%</span></span>
                   </div>
                   <div class="flex items-center gap-4">
                     <ElProgress :percentage="ticketReadRate" color="#8b5cf6" :show-text="false" :stroke-width="10" class="progress-bar flex-1 group-hover:opacity-80 transition-opacity" />
                     <span class="w-12 text-right font-bold text-slate-400">{{ stats.ticket.read }}</span>
                   </div>
                </div>
                
                <div class="group">
                   <div class="flex justify-between items-end mb-2">
                     <span class="text-sm font-bold text-slate-500 uppercase tracking-wide flex items-center gap-2">
                       <div class="w-2.5 h-2.5 rounded-full bg-slate-200"></div> 尚未回應 (Unopened)
                     </span>
                     <span class="text-xl font-black text-slate-400">{{ ticketUnopenedRate }}<span class="text-sm text-slate-300 ml-1">%</span></span>
                   </div>
                   <div class="flex items-center gap-4">
                     <ElProgress :percentage="ticketUnopenedRate" color="#e2e8f0" :show-text="false" :stroke-width="10" class="progress-bar flex-1 group-hover:opacity-80 transition-opacity" />
                     <span class="w-12 text-right font-bold text-slate-400">{{ stats.ticket.unopened }}</span>
                   </div>
                </div>

                <div class="group">
                   <div class="flex justify-between items-end mb-2">
                     <span class="text-sm font-bold text-slate-500 uppercase tracking-wide flex items-center gap-2">
                       <div class="w-2.5 h-2.5 rounded-full bg-slate-300"></div> 拒絕或刪除 (Deleted)
                     </span>
                     <span class="text-xl font-black text-slate-400">{{ ticketDeletedRate }}<span class="text-sm text-slate-300 ml-1">%</span></span>
                   </div>
                   <div class="flex items-center gap-4">
                     <ElProgress :percentage="ticketDeletedRate" color="#cbd5e1" :show-text="false" :stroke-width="10" class="progress-bar flex-1 group-hover:opacity-80 transition-opacity" />
                     <span class="w-12 text-right font-bold text-slate-400">{{ stats.ticket.deleted }}</span>
                   </div>
                </div>

              </div>
           </ElCol>
        </ElRow>
      </div>
    </section>

    <!-- Section 3: 問卷分析 -->
    <section>
      <div class="flex items-center gap-3 mb-6">
        <div class="w-1.5 h-6 bg-teal-400 rounded-full"></div>
        <h3 class="text-xl font-bold text-slate-700 tracking-wide">問卷分發與回收統計</h3>
      </div>
      
      <div class="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
        <ElRow :gutter="48" class="items-center">
           <!-- 左圖：圓環圖 -->
           <ElCol :span="8">
              <div class="h-64 w-full relative">
                 <EchartsUI ref="surveyChartRef" class="w-full h-full" />
              </div>
           </ElCol>

           <!-- 右文：對齊排版進度條 -->
           <ElCol :span="16">
              <div class="flex flex-col justify-center space-y-8 pr-4">
                
                <div class="group">
                   <div class="flex justify-between items-end mb-2">
                     <span class="text-sm font-bold text-slate-500 uppercase tracking-wide flex items-center gap-2">
                       <div class="w-2.5 h-2.5 rounded-full bg-teal-500"></div> 已填寫完成 (Completed)
                     </span>
                     <span class="text-2xl font-black text-teal-600">{{ surveyFillRate }}<span class="text-sm text-teal-300 ml-1">%</span></span>
                   </div>
                   <div class="flex items-center gap-4">
                     <ElProgress :percentage="surveyFillRate" color="#14b8a6" :show-text="false" :stroke-width="10" class="progress-bar flex-1 group-hover:opacity-80 transition-opacity" />
                     <span class="w-12 text-right font-bold text-slate-400">{{ stats.survey.read }}</span>
                   </div>
                </div>
                
                <div class="group">
                   <div class="flex justify-between items-end mb-2">
                     <span class="text-sm font-bold text-slate-500 uppercase tracking-wide flex items-center gap-2">
                       <div class="w-2.5 h-2.5 rounded-full bg-slate-200"></div> 尚待回覆 (Pending)
                     </span>
                     <span class="text-xl font-black text-slate-400">{{ surveyUnopenedRate }}<span class="text-sm text-slate-300 ml-1">%</span></span>
                   </div>
                   <div class="flex items-center gap-4">
                     <ElProgress :percentage="surveyUnopenedRate" color="#e2e8f0" :show-text="false" :stroke-width="10" class="progress-bar flex-1 group-hover:opacity-80 transition-opacity" />
                     <span class="w-12 text-right font-bold text-slate-400">{{ stats.survey.unopened }}</span>
                   </div>
                </div>

              </div>
           </ElCol>
        </ElRow>
      </div>
    </section>

    <!-- 高對比深色模式 Data Bar (感謝函) 降低亮度減少刺眼感 -->
    <section class="pt-4">
      <div class="bg-slate-800 px-12 py-10 rounded-[32px] shadow-sm text-white relative overflow-hidden group">
        <!-- 柔和的微光背景 -->
        <div class="absolute top-0 right-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3"></div>
        <div class="absolute bottom-0 left-0 w-64 h-64 bg-teal-500/5 rounded-full blur-[60px] translate-y-1/3 -translate-x-1/4"></div>

        <div class="relative z-10">
          <h4 class="text-xs font-bold text-slate-400 mb-8 tracking-[0.2em] uppercase border-b border-slate-700 pb-4">感謝函統計</h4>
          <div class="flex items-center justify-between">
             <div>
                <p class="text-sm text-slate-400 font-bold mb-2">發行次數</p>
                <div class="flex items-baseline gap-2">
                  <p class="text-5xl font-black text-slate-100 tracking-tighter">{{ stats.thankyou.total }}</p>
                  <span class="text-slate-500 font-bold">封</span>
                </div>
             </div>
             <div class="h-12 w-px bg-slate-700"></div>
             <div>
                <p class="text-sm text-slate-400 font-bold mb-2">總讀取率</p>
                <div class="flex items-baseline gap-2">
                  <p class="text-5xl font-black text-indigo-400 tracking-tighter">{{ thankyouReadRate }}</p>
                  <span class="text-indigo-500/50 font-bold text-xl">%</span>
                </div>
             </div>
             <div class="h-12 w-px bg-slate-700"></div>
             <div>
                <p class="text-sm text-slate-400 font-bold mb-2">零點擊忽略率</p>
                <div class="flex items-baseline gap-2">
                  <p class="text-5xl font-black text-slate-400 tracking-tighter">12.5</p>
                  <span class="text-slate-600 font-bold text-xl">%</span>
                </div>
             </div>
          </div>
        </div>
      </div>
    </section>

  </div>
</template>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.8s ease-out forwards;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* 讓進度條兩端極度圓滑，維持護眼無銳角設計 */
:deep(.el-progress-bar__outer) {
  border-radius: 12px;
  background-color: #f8fafc;
}
:deep(.el-progress-bar__inner) {
  border-radius: 12px;
}
.progress-bar :deep(.el-progress-bar__outer) {
  overflow: visible;
}
</style>
