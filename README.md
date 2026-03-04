# EDM 營銷與成員管理系統 (EDM & Member Management System)

這是一個基於 **Vue 3** 與 **Vben Admin** 框架構建的現代化營銷與成員管理系統。旨在提供高效的群組管理、精確的人員數據維護以及靈活的營銷活動分析。

---

## 🚀 系統概述 (System Overview)

EDM 系統作為核心數據中心，負責管理大量的人員資料並將其分類至不同群組。系統支持大規模的 Excel 數據匯入、即時的狀態同步以及細粒度的通訊資料維護。目前專案正處於功能擴充期，未來將與 **HWS 系統** 進行深度整合，達成統一身份驗證 (SSO) 與測試環境同步。

---

## 🛠️ 技術架構 (Technical Stack)

- **前端框架**：Vue 3 (Composition API)
- **基礎架構**：[Vben Admin 5.0](https://github.com/vbenjs/vue-vben-admin) (高性能企業級管理後台，Monorepo 架構)
- **UI 組件庫**：Element Plus
- **程式語言**：TypeScript
- **開發工具**：pnpm, Vite, Turbo (Monorepo 管理)
- **整合功能**：
  - **VXE Table**：高效能的神表格組件，用於處理大量成員數據。
  - **ExcelJS / xlsx**：強大的 Excel 讀寫能力，支持人員名單匯入。
  - **Vben Modal / Form**：統一的彈窗與表單開發範式。

---

## 📋 功能清單 (Feature Roadmap)

### ✅ 已開發功能 (Developed)
*   **群組管理 (Group Management)**
    *   群組列表展示、分頁與檢索。
    *   **即時狀態切換**：使用 `ElSwitch` 即時同步群組啟用/禁用狀態。
    *   **詳情頁標籤化**：整合「人員列表」、「活動列表」與「分析報告」入口。
    *   **快速新增**：彈窗式新增群組，包含名稱必填驗證與備註說明。
*   **人員管理 (Member Management)**
    *   **Excel 批次匯入**：專屬人員匯入模組，支持預選群組鎖定，防止歸類錯誤。
    *   **通訊資料維護**：支援行動電話與電子郵件的非同步編輯（傳遞唯一 ID 進行精準更新）。
    *   **狀態控制**：與群組一致的開關式狀態管理。
*   **基礎建設**
    *   全系統 API 呼叫 Loading 狀態反饋。
    *   模組化目錄重構：遵循 `Feature-based` 結構 (`list/detail` 分離)，提升擴充性。

### 🗓️ 未開發 / 規劃中 (Upcoming)
*   **活動系統 (Activity System)**：建立活動流程、活動與群組/成員的雙向關聯。
*   **HWS 系統整合**：
    *   專案合併與測試環境部署。
    *   **SSO 整合**：與 Laravel (HWS) 共享登入狀態與權限控管。
*   **數據可視化**：群組與活動的成效分析圖表。

---

## 🏃 快速啟動 (Quick Start)

專案採用 **pnpm monorepo** 管理，請確保已安裝 [pnpm](https://pnpm.io/)。

### 1. 安裝依賴
```bash
pnpm install
```

### 2. 啟動開發環境
本專案目前主要的開發模組為 `web-ele` (Element Plus 版本)：
```bash
pnpm dev:ele
```

### 3. 編譯與構建
```bash
# 編譯 Element Plus 版本
pnpm build:ele
```

---

## 🐳 Docker 部署 (Docker Deployment)

系統支持使用 Docker 進行容器化部署，配置已針對 `web-ele` 模組進行優化。

### 1. 多環境構建映像檔

系統支援透過 `--build-arg APP_ENV` 參數來決定編譯目標環境（會自動讀取對應的 `.env.[env]` 檔案）：

*   **構建 UAT 測試環境**：
    ```bash
    docker build --build-arg APP_ENV=uat -t edm-image .
    ```
*   **構建正式生產環境 (預設)**：
    ```bash
    docker build -t edm-image .
    ```

### 2. 使用 Docker Compose 啟動

啟動對應環境的容器：
```bash
# 啟動 UAT 容器 (需確保 docker-compose.yml 中的 image 名稱正確)
docker-compose up -d
```
啟動後，系統將運行在 `http://localhost` (80 Port)。

### 3. 主機 Nginx 反向代理設定 (建議)
如果您的主機 80 Port 已被佔用，且希望透過網域（如 `edm.yourdomain.com`）訪問，請在主機的 Nginx 配置中加入以下設定：

```nginx
server {
    listen 80;
    server_name edm.yourdomain.com; # 替換為您的網域

    location / {
        proxy_pass http://127.0.0.1:80; # 指向 Docker 映射的 Port (目前設為 80)
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

## 📁 相關文件
- [開發日誌 (Weekly Dev-Log)](./docs/dev-log.md) - 詳細紀錄每週開發進度與技術決策。
- [跨系統 Auth 同步計畫](./docs/sso-integration-plan.md) - Laravel 與 Vue 整合方案。
