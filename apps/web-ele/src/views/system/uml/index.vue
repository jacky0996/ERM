<script setup lang="ts">
import { Page } from '@vben/common-ui';
import MermaidView from '#/components/common/mermaid-view.vue';

const memberUml = `
graph TD
    Start[人員管理入口] --> List[人員列表頁面]
    List --> Search[查詢: 輸入姓名或選擇狀態]
    
    List --> ImportStart[匯入人員名單]
    ImportStart --> Sample[下載範例檔]
    ImportStart --> SelectGroup{選擇匯入群組?}
    SelectGroup -- 是 --> GroupImport[匯入至指定群組]
    SelectGroup -- 否 --> DirectImport[直接匯入人員名單]
    
    List --> ClickName[點選人名]
    ClickName --> Detail[人員詳細頁面]
    
    Detail --> Edit[修改基本資料: 電話/電子郵件]
    Edit --> Submit[點選編輯後送出]
    
    Detail --> Delete[點選刪除]
    Delete --> Deleted[刪除該筆資料]
    
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
</script>

<template>
  <Page title="UML 系統架構圖">
    <div class="p-4">
      <el-card shadow="never" class="uml-card">
        <el-tabs type="border-card">
          <el-tab-pane label="👤 人員管理">
            <div class="py-4">
              <div class="mb-4 text-sm text-gray-500 italic">
                人員管理－描述：包含人員搜尋、Excel 匯入流程（範例下載/群組選擇）、詳細資料編輯及跳轉邏輯。
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
          
          <el-tab-pane label="🔑 登入與 SSO 串接">
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
