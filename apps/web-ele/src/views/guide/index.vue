<script setup lang="ts">
import { Page } from '@vben/common-ui';
</script>

<template>
  <Page title="開發日誌">
    <div class="p-4 space-y-4">
      <el-card shadow="never">
        <template #header>
          <div class="font-bold text-lg">💡 歡迎使用 EDM 行銷管理工具</div>
        </template>
        <div class="text-sm text-gray-600 leading-relaxed">
          <ul class="list-disc pl-5 mt-2 space-y-1">
            <!-- <li><strong>群組管理：</strong>可以建立群組並將人員分類。</li>
            <li><strong>人員管理：</strong>管理人員詳細資料、聯絡方式，並提供批次匯入功能。</li> -->
          </ul>
        </div>
      </el-card>

      <el-card shadow="never">
        <template #header>
          <div class="font-bold text-lg">📝 專案開發日誌 (Development Log)</div>
        </template>
        <div class="text-sm text-gray-700 leading-relaxed space-y-3">
          <h3 class="font-bold text-base text-blue-600 border-b pb-1">當週交付價值 (3/23～3/27)</h3>
          <ul class="list-disc pl-5 space-y-1 mb-4">
            <li><strong>人員管理優化：</strong>實作業務人員自動綁定機制，支援 Excel 匯入時透過「工號」自動勾稽關聯。</li>
            <li><strong>後端環境與基礎設施：</strong>完成 EDM 後端專案初始化、Docker 容器化佈署、主機環境設定及防火牆規則配置。</li>
            <li><strong>活動詳細頁面開發：</strong>完成報名表配置介面、審核名單流程管理、以及活動分析數據視覺化（ECharts 整合）之靜態畫面。</li>
            <li><strong>Docker 建置優化：</strong>修正 Dockerfile 指令，解決核心工具安裝時的網路逾時報錯，提升編譯效率。</li>
          </ul>

          <h3 class="font-bold text-base text-blue-600 border-b pb-1 mt-4">下週預計交付</h3>
          <ol class="list-decimal pl-5 space-y-1 mb-6">
            <li><strong>發信系統核心開發：</strong>實作寄信功能（含 Proxy 設定與郵件圖片外部呈現之資安處理）。</li>
            <li><strong>環境遷移與同步：</strong>將現有後端 API、DB 連線及資料完整搬移至全新測試主機。</li>
          </ol>

          <h3 class="font-bold text-base text-blue-600 border-b pb-1 mt-4">當週交付價值 (3/16～3/20)</h3>
          <ul class="list-disc pl-5 space-y-1 mb-4">
            <li><strong>活動管理功能製作：</strong>完成活動列表(搜尋/分頁)、活動詳情(分頁標籤)以及活動內容預覽功能。</li>
            <li><strong>預覽功能製作：</strong>完成 Gmail 風格之「活動預覽」功能，支援電腦版與手機版介面即時切換。</li>
            <li><strong>邀請名單連動機制：</strong>活動/群組/人員基礎勾稽建立</li>
            <li><strong>系統架構文件化：</strong>於系統內建立 UML 流程圖（人員、群組、活動、SSO）及測試項目驗證指南。</li>
            <li><strong>UX 穩定性優化：</strong>修復 Vue Router 換頁不重置組件的問題、優化分頁器排版、開放側邊欄權限限制以利測試。</li>
          </ul>

          <h3 class="font-bold text-base text-blue-600 border-b pb-1">當週交付價值 (3/9～3/13)</h3>
          <ul class="list-disc pl-5 space-y-1 mb-4">
            <li><strong>活動管理頁面框架：</strong>功能框架開發中。</li>
            <li><strong>新增活動頁面開發：</strong>包含 CKEditor 整合與動態預覽優化。</li>
            <li><strong>架構與資安議題討論：</strong>評估專案架構、檔案權限處理及資安防護。</li>
          </ul>

          <h3 class="font-bold text-base text-blue-600 border-b pb-1">當週交付價值 (3/2～3/6)</h3>
          <ul class="list-disc pl-5 space-y-1 mb-4">
            <li><strong>系統整合與 SSO (HWS 串接)：</strong>實作基於 Token 交換的信任登入機制，並處理跨網域 CORS 議題 (使用 Nginx 反向代理)。</li>
            <li><strong>登入狀態持久化：</strong>修復頁面重整及網址跳轉後造成的登入狀態遺失問題，確保 `userStore` 中 Token 及個人資料正確快取。</li>
            <li><strong>人員管理優化：</strong>實作人員清單「姓名」與「狀態」欄位的搜尋與清除功能。</li>
            <li><strong>UI 介面自定義：</strong>隱藏了不必要的全域元件（如右上角通知、全域搜尋、時區與語系切換）並調整側邊欄入口。</li>
            <li><strong>測試準備與部署：</strong>完成測試機環境架設規劃，並建立「測試項目」指南頁面供驗收單位參考。</li>
          </ul>

          <h3 class="font-bold text-base text-blue-600 border-b pb-1 mt-4">下週預計交付</h3>
          <ol class="list-decimal pl-5 space-y-1 mb-6">
            <li>活動功能製作</li>
            <li>測試項目修正或優化</li>
          </ol>

          <h3 class="font-bold text-base text-blue-600 border-b pb-1">當週交付價值 (2/24～2/26)</h3>
          <ul class="list-disc pl-5 space-y-1">
            <li><strong>群組管理功能撰寫：</strong>實作 Tab 標籤頁功能（人員列表、活動列表預留、群組分析預留）。</li>
            <li><strong>人員管理功能撰寫：</strong>清單頁，詳情頁製作。</li>
            <li><strong>人員匯入整合：</strong>群組詳情頁的匯入進行整合，自動預選當前群組。</li>
            <li><strong>狀態管理優化：</strong>群組與人員的「狀態」切換由標籤改為 Switch (開關) 樣式，並對接 API 實現即時同步。</li>
            <li><strong>群組新增功能：</strong>支援群組名稱與備註輸入，對接建立 API。</li>
            <li><strong>人員通訊資料編輯：</strong>完成「行動電話」與「電子郵件」的編輯功能與即時同步。</li>
          </ul>

          <h3 class="font-bold text-base text-blue-600 border-b pb-1 mt-4">下週預計交付</h3>
          <ol class="list-decimal pl-5 space-y-1">
            <li>測試環境架設</li>
            <li>系統整合與合併 (HWS SSO功能)。</li>
          </ol>
        </div>
        <div>
          <h3 class="font-bold text-base text-blue-600 border-b pb-1">開發議題庫</h3>
          <ul class="list-disc pl-5 space-y-1">
            <li>補上使用說明書及測試說明書</li>
            <li>補上流程說明圖</li>
            <li>商機相關需求(預計 EDM 系統完成後執行)</li>
            <li>行業別要智能提供 (預計 EDM 系統完成後執行)</li>
            <li>Dashboard 功能設計 (預計 EDM 系統完成後執行)</li>
            <li>系統分級、防護基準、威脅建模(預計 EDM 系統完成後執行)</li>
          </ul>
        </div>
      </el-card>
    </div>
  </Page>
</template>

