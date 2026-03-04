# 多環境支援 (Dev/Uat/Prod) 配置計畫書

為了讓專案能根據不同部署環境（開發、測試、生產）自動切換 API 地址與網域設定，我們採用 Vite 的環境變數機制。

## 1. 環境檔案規範 (Environment Files)

請在 `apps/web-ele/` 目錄下管理以下檔案：

### 🟢 開發環境 (.env.development)
用於本地 `pnpm dev:ele`。
```env
VITE_GLOB_API_URL=/api
VITE_NITRO_MOCK=true
```
*   **特性**：通常配合 Vite Proxy，指向本地或 Mock 伺服器。

### 🟡 測試環境 (.env.uat) [新增]
用於主機上的 UAT 測試。
```env
# 替換為您的 UAT API 地址
VITE_GLOB_API_URL=https://uat-api.hwacom.com/api
VITE_ROUTER_HISTORY=hash
VITE_INJECT_APP_LOADING=true
```

### 🔴 生產環境 (.env.production)
用於正式發佈。
```env
# 替換為您的正式 API 地址
VITE_GLOB_API_URL=https://api.hwacom.com/api
VITE_ROUTER_HISTORY=hash
```

---

## 2. 構建指令設定 (Package.json)

在 `apps/web-ele/package.json` 的 `scripts` 中新增 UAT 編譯指令：

```json
{
  "scripts": {
    "build:uat": "pnpm vite build --mode uat",
    "build:prod": "pnpm vite build --mode production"
  }
}
```

---

## 3. 如何切分 API 與網域

1.  **程式碼引用**：
    專案中已經整合好的 `requestClient` 會自動讀取 `VITE_GLOB_API_URL`。您不需要在程式碼中寫死 `https://...`，只需確保環境變數設定正確。

2.  **Vite Proxy (僅限開發環境)**：
    在 `vite.config.mts` 中，`proxy` 設定僅在 `dev` 模式下生效。當您執行 `build` 時，Vite 會直接將 `VITE_GLOB_API_URL` 的完整地址寫入編譯後的代碼。

3.  **Docker 部署適配**：
    如果您正在主機上構建：
    - **UAT**：執行 `docker build` 並在內部觸發 `pnpm build:uat`。
    - **PROD**：執行 `docker build` 並在內部觸發 `pnpm build:prod`。

---

## 4. 實作建議步驟

1.  **建立 `.env.uat`**：填入 UAT 專用的 API 地址。
2.  **更新指令**：在 `package.json` 加入 `build:uat`。
3.  **構建測試**：嘗試 `pnpm build:uat`，檢查輸出的 `dist/_app.config.js` 檔案中的 `VITE_GLOB_API_URL` 是否正確。
