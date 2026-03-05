FROM node:22-slim AS builder

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
ENV TZ=Asia/Taipei

RUN npm i -g corepack

WORKDIR /app

# copy package.json and pnpm-lock.yaml to workspace
COPY . /app

# 跳過 Playwright 瀏覽器下載 (大幅縮減安裝體積與時間)
ENV PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1

# 定義構建環境參數 (預設為 production, 可在 build 時透過 --build-arg APP_ENV=uat 覆蓋)
ARG APP_ENV=production
ENV VITE_APP_ENV=${APP_ENV}

# 安裝依賴 (增加逾時、重試，並嘗試切換至官方 Registry 以排查鏡像站問題)
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm config set fetch-retries 5 && \
    pnpm config set fetch-retry-mintimeout 20000 && \
    pnpm config set fetch-retry-maxtimeout 120000 && \
    pnpm install --no-frozen-lockfile --reporter=append-only --registry=https://registry.npmjs.org

# 編譯 web-ele 模組 (利用 turbo 構建並透傳模式參數)
RUN pnpm run build:ele -- --mode ${VITE_APP_ENV}

RUN echo "Builder Success 🎉"

FROM nginx:stable-alpine AS production

# 配置 nginx
RUN echo "types { application/javascript js mjs; }" > /etc/nginx/conf.d/mjs.conf \
    && rm -rf /etc/nginx/conf.d/default.conf

# 複製構建產物 (指向 web-ele 的輸出目錄)
COPY --from=builder /app/apps/web-ele/dist /usr/share/nginx/html

# 複製 nginx 配置
COPY --from=builder /app/scripts/deploy/nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

# 啟動 nginx
CMD ["nginx", "-g", "daemon off;"]
