<script setup lang="ts">
import { Page } from '@vben/common-ui';
</script>

<template>
  <Page title="系統使用說明">
    <div class="p-4">
      <el-card class="mb-4" shadow="never">
        <template #header>
          <div class="font-bold text-lg">💡 歡迎使用 EDM 行銷管理工具</div>
        </template>
        <div class="text-sm text-gray-600 leading-relaxed">
          <p class="mb-2">
            本系統主要用於協助您管理行銷活動、人員名單與群組資料。
          </p>
          <ul class="list-disc pl-5 mt-2 space-y-1">
            <li><strong>群組管理：</strong>可以建立群組並將人員分類。</li>
            <li><strong>人員管理：</strong>管理人員詳細資料、聯絡方式，並提供批次匯入功能。</li>
          </ul>
        </div>
      </el-card>
      
      <el-card shadow="never">
        <template #header>
          <div class="font-bold text-lg">⚠️ 常見問題</div>
        </template>
        <div class="text-sm text-gray-600 leading-relaxed space-y-4">
          <div>
            <div class="font-bold text-gray-800">Q: 我發現右上角的介面設定（如隱藏通知、時區）沒有生效？</div>
            <div class="mt-1">
              A: 這是因為系統會將介面偏好設定 <span class="bg-gray-100 px-1 rounded text-red-500 font-mono">快取在瀏覽器中</span>。如需套用最新設定，請開啟瀏覽器的開發者工具 (F12) -> Application -> Local Storage，將所有項目清除並重新整理頁面。
            </div>
          </div>
          <div>
            <div class="font-bold text-gray-800">Q: 如果遇到登入狀態異常怎麼辦？</div>
            <div class="mt-1">
              A: 系統已支援靜默續傳機制與防呆驗證，正常情況下不會輕易失效。若仍遇到異常，請嘗試完全關閉瀏覽器分頁後重新從入口進入。
            </div>
          </div>
        </div>
      </el-card>
    </div>
  </Page>
</template>

<style scoped>
/* 簡單的美化樣式 */
</style>
