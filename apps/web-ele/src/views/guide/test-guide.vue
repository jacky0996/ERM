<script setup lang="ts">
import { Page } from '@vben/common-ui';
</script>

<template>
  <Page title="測試項目與驗證指南">
    <div class="p-4 space-y-4">
      <el-card shadow="never">
        <template #header>
          <div class="font-bold text-lg text-blue-600">🎯 第一階段測試：群組與人員管理</div>
        </template>
        <div class="text-sm text-gray-700 leading-relaxed">
          <p class="mb-4">此階段測試目標為確認「人員管理」與「群組管理」核心操作流程的穩定性，以及兩者之間的關聯是否正確。</p>

          <div class="mb-6">
            <h3 class="font-bold text-base mb-2 border-l-4 border-blue-500 pl-2"> 群組管理 </h3>
            <ul class="list-decimal pl-5 space-y-2">
              <li><strong>建立群組：</strong>點擊「新增群組」，確認必填欄位（群組名稱）未填寫時會阻擋送出。填寫並送出後，確認新群組出現在列表中。</li>
              <li><strong>狀態切換：</strong>在列表中或群組詳情中切換「啟用/禁用」狀態，重新整理頁面，確認狀態有被正確保存。</li>
              <li><strong>群組詳情檢視：</strong>點擊列表中的群組名稱，應成功進入詳情頁。</li>
              <li><strong>人員匯入：</strong>在群組詳情頁中，點擊「匯入人員名單」按鈕，應成功進入匯入頁面，且匯入功能正確。</li>
            </ul>
          </div>

          <div>
            <h3 class="font-bold text-base mb-2 border-l-4 border-green-500 pl-2"> 人員管理 </h3>
            <ul class="list-decimal pl-5 space-y-2">
              <li><strong>列表與搜尋：</strong>在人員列表中，測試使用「姓名」和「狀態」進行搜尋，並測試點擊右側的「x」清除搜尋條件是否能恢復顯示所有名單。</li>
              <li><strong>人員匯入：</strong>
                <ul class="list-disc pl-5 mt-1 space-y-1 text-gray-600">
                  <li>自「人員管理」列表點擊匯入，應可自由選擇欲匯入的群組。</li>
                  <li>下載範例檔後，填寫測試資料上傳，確認資料正確進入對應群組。</li>
                </ul>
              </li>
              <li><strong>人員詳情編輯：</strong>點擊任一人員進入詳情，嘗試編輯「行動電話」與「電子郵件」。確認編輯成功後會有提示框，且重新載入後資料正確。</li>
              <li><strong>狀態即時調整：</strong>使用 Switch 切換狀態，確認列表同步與後端狀態變更。</li>
              <li><strong>業務資訊驗證：</strong>
                <ul class="list-disc pl-5 mt-1 space-y-1 text-gray-600">
                  <li>點擊詳細頁「業務」後方的編輯按鈕，確認彈窗正確顯示。</li>
                  <li>輸入有效工號並儲存，確認頁面自動重新整理且顯示最新工號與姓名。</li>
                  <li>輸入無效工號或清空儲存，確認顯示「查無此業務」錯誤訊息。</li>
                </ul>
              </li>
            </ul>
          </div>
        </div>
      </el-card>

      <el-card shadow="never">
        <template #header>
          <div class="font-bold text-lg text-purple-600">🎯 第二階段測試：活動管理</div>
        </template>
        <div class="text-sm text-gray-700 leading-relaxed">
          <p class="mb-4">此階段重點測試活動的「視覺建立元件」以及「名單匯入邏輯」的完整性。</p>

          <div class="mb-6">
            <h3 class="font-bold text-base mb-2 border-l-4 border-purple-500 pl-2"> 活動建立 </h3>
            <ul class="list-decimal pl-5 space-y-2">
              <li><strong>視覺化預覽：</strong>在建立頁點擊「預覽活動」，確認 Gmail 模擬介面正確顯示。並切換「電腦版/手機版」，檢查響應式排版是否正常。</li>
              <li><strong>欄位驗證：</strong>
                <ul class="list-disc pl-5 mt-1 space-y-1 text-gray-600">
                  <li>活動編號：確認建立時可輸入，但進入「詳細頁」後強制鎖定（不可編輯）。</li>
                  <li>活動類型：選擇下拉選單（如：會議、工作坊），確認預覽與詳情中皆正確呈現對應名稱。</li>
                  <li>按鈕風格：確認建立頁與詳細頁的按鈕配置（返回、預覽、儲存）是否維持一致的大型佈局。</li>
                </ul>
              </li>
              <li><strong>內容編輯器：</strong>使用 CKEditor 插入圖片並編輯內容，確認預覽顯示正常。</li>
              <li><strong>橫幅上傳：</strong>上傳活動主視覺 (1920x600)，確認上傳後能即時看見縮圖回顯。</li>
            </ul>
          </div>

          <div>
            <h3 class="font-bold text-base mb-2 border-l-4 border-indigo-500 pl-2"> 活動詳細頁與邀請</h3>
            <ul class="list-decimal pl-5 space-y-2">
              <li><strong>模式切換：</strong>進入活動詳情，預設應為「唯讀」。點擊「編輯」後應可修改內容，點擊「取消」應能回原資料，點擊「儲存」應成功更新。</li>
              <li><strong>邀請名單搜尋：</strong>在邀請名單頁籤，輸入人員姓名進行搜尋，確認列表能即時過濾。</li>
              <li><strong>分頁導航：</strong>測試下方分頁器，切換「每頁筆數」以及「頁碼」，確認資料有正確向後端重新抓取。</li>
              <li><strong>群組匯入：</strong>點擊「匯入群組人員」，選擇一個現有群組送出後，確認列表自動刷新並補上新成員。</li>
            </ul>
          </div>
        </div>
      </el-card>

      <el-card shadow="never">
        <template #header>
          <div class="font-bold text-lg text-orange-600">📝 測試回報格式</div>
        </template>
        <div class="text-sm text-gray-600">
          <p>若在測試過程中發現異常，懇請提供以下資訊以幫助工程團隊快速定位問題：</p>
          <ul class="list-disc pl-5 mt-2 space-y-1">
            <li>發生異常的具體面頁與操作步驟。</li>
            <li>預期看到的結果 vs 實際發生的結果。</li>
            <li>盡量提供全螢幕截圖（包含網址列與右下角時間）。</li>
            <li><a target="_blank" href="https://docs.google.com/spreadsheets/d/1-zl-DfvXHgUymEXzrLZEJylCvgteNjOocs7ilIrHImc/edit?hl=zh-tw&gid=0#gid=0"
              class="text-blue-500 hover:underline">測試回報表單</a></li>
          </ul>
        </div>
      </el-card>
    </div>
  </Page>
</template>

<style scoped>
</style>
