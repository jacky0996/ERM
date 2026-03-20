<script setup lang="ts">
import { Page } from '@vben/common-ui';
import MermaidView from '#/components/common/mermaid-view.vue';

const memberUml = `
graph TD
    Start[人員管理入口] --> List[人員列表頁面]
    List --> Search[查詢: 輸入姓名或選擇狀態]
    
    List --> ImportStart[匯入人員名單]
    ImportStart --> DirectImport[Excel 匯入至指定或預選群組]
    
    List --> ClickName[點選人名]
    ClickName --> Detail[人員詳細頁面]
    
    Detail --> EditBase[修改聯絡資訊: 電話/電子郵件]
    EditBase --> SubmitBase[行內即時同步更新]

    Detail --> EditSales[點選業務編輯按鈕]
    EditSales --> SalesPop[出現彈窗輸入業務工號]
    SalesPop --> SubmitSales[送出並強制重新整理頁面]
    
    Detail --> JumpGroup[點選關聯群組名稱]
    JumpGroup --> GroupDetail[跳轉至群組詳細頁面]
`;

const groupUml = `
graph TD
    Start[群組管理入口] --> List[群組列表頁面]
    List --> Search[查詢: 輸入群組名稱或選擇狀態]
    
    List --> CreateStart[新增群組功能]
    CreateStart --> CreatePage[出現新增頁面]
    CreatePage --> Input{輸入資料}
    Input --> Name[群組名稱: 必填]
    Input --> Note[備註: 選填]
    Name & Note --> Submit[送出並新建群組]
    
    List --> ClickGroupName[點選群組名稱]
    ClickGroupName --> Detail[群組詳細頁面]
    
    Detail --> Switch[狀態: 使用 Switch 即時調整]
    
    Detail --> ImportStart[匯入人員名單]
    ImportStart --> AutoBind[自動綁定匯入人員至該群組]
    ImportStart --> Sample[提供範例下載]
    
    Detail --> ClickMember[點選人名]
    ClickMember --> MemberDetail[跳轉至該人員詳細頁面]
`;

const loginUml = `
sequenceDiagram
    participant HWS as 後端 (HWS) 
    participant Front as 前端 (EDM)
    participant Back as  API
    Front->>HWS: 自動跳轉至 SSO Token 交換
    HWS-->>Front: 回傳加密憑證 (Auth Token)
    Front->>Back: 使用 Token 建立 Session
    Back-->>Front: 回傳登入成功與 UserInfo
    Front->>Front: 儲存至 PINIA 與 LocalStorage
`;

const eventUml = `
graph TD
    Start[活動管理入口] --> List[活動列表頁面]
    List --> SearchEvent[查詢: 活動名稱搜尋]
    
    List --> CreateStart[建立活動項目]
    CreateStart --> CreateInput[輸入順序: 編號 > 類型 > 名稱]
    CreateInput --> CKEditor[橫幅上傳與內容編輯]
    CKEditor --> Preview[Gmail 雙模式預覽]
    Preview --> SubmitCreate[儲存建立]

    List --> ClickEventName[點選活動名稱]
    ClickEventName --> Detail[活動詳細頁面]
    
    Detail -- 活動預覽(詳細頁) --> ReadOnly{預設唯讀模式}
    ReadOnly -- 活動編號 --> Locked[鎖定狀態: 不可修改]
    ReadOnly -- 點選編輯 --> EditMode[編輯模式: 名稱/類型/內容/時間]
    EditMode -- 儲存更新 --> Success[更新後回傳並同步]
    
    Detail -- 邀請名單 --> InviteList[邀請名單分頁列表]
    InviteList --> ImportGroup[從現有群組列表匯入人員]
`;
</script>

<template>
  <Page title="UML 系統架構圖">
    <div class="p-4">
      <el-card shadow="never" class="uml-card">
        <el-tabs type="border-card">
          <el-tab-pane label="👤 人員管理">
            <div class="py-4">
              <div class="mb-4 text-sm text-gray-500 italic">
                人員管理－描述：包含人員搜尋、Excel 匯入流程、業務工號編輯（彈窗）及詳細資料更新邏輯。
              </div>
              <MermaidView :content="memberUml" />
            </div>
          </el-tab-pane>
          
          <el-tab-pane label="📁 群組管理">
            <div class="py-4">
              <div class="mb-4 text-sm text-gray-500 italic">
                群組管理－描述：呈現群組列表、狀態即時同步開關以及新增群組之作業流程。
              </div>
              <MermaidView :content="groupUml" />
            </div>
          </el-tab-pane>
          
          <el-tab-pane label="📅 活動管理">
            <div class="py-4">
              <div class="mb-4 text-sm text-gray-500 italic">
                活動管理－描述：呈現編號/類型/名稱之建立順序、詳細頁編號鎖定規則以及邀請名單匯入邏輯。
              </div>
              <MermaidView :content="eventUml" />
            </div>
          </el-tab-pane>

          <el-tab-pane label="🔑 系統串接">
            <div class="py-4">
              <div class="mb-4 text-sm text-gray-500 italic">
                 登入與 SSO 串接－描述：呈現 EDM 系統與 Laravel HWS 之間的 SSO Token 交換與 Session 建立流程。
              </div>
              <MermaidView :content="loginUml" />
            </div>
          </el-tab-pane>
        </el-tabs>
      </el-card>
    </div>
  </Page>
</template>

<style scoped>
.uml-card {
  border-radius: 12px;
  overflow: hidden;
}

:deep(.el-tabs--border-card) {
  border: none;
  box-shadow: none;
}

:deep(.el-tabs__content) {
  padding: 0 20px 20px;
}
</style>

<style scoped>
.el-card {
  border-radius: 12px;
}
</style>
