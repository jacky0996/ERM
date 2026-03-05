<script setup lang="ts">
import type { AboutProps, DescriptionItem } from './about';

import { h } from 'vue';

import {
  VBEN_DOC_URL,
  VBEN_GITHUB_URL,
  VBEN_PREVIEW_URL,
} from '@vben/constants';

import { VbenRenderContent } from '@vben-core/shadcn-ui';

import { Page } from '../../components';

interface Props extends AboutProps {}

defineOptions({
  name: 'AboutUI',
});

withDefaults(defineProps<Props>(), {
  description:
    '是一個現代化開箱即用的中後台解決方案，採用最新的技術棧，包括 Vue 3.0、Vite、TailwindCSS 和 TypeScript 等前沿技術，程式碼規範嚴謹，提供豐富的設定選項，旨在為中大型專案的開發提供現成的開箱即用解決方案及豐富的範例，同時，它也是學習和深入前端技術的一個極佳範例。',
  name: 'Vben Admin',
  title: '關於專案',
});

declare global {
  const __VBEN_ADMIN_METADATA__: {
    authorEmail: string;
    authorName: string;
    authorUrl: string;
    buildTime: string;
    dependencies: Record<string, string>;
    description: string;
    devDependencies: Record<string, string>;
    homepage: string;
    license: string;
    repositoryUrl: string;
    version: string;
  };
}

const renderLink = (href: string, text: string) =>
  h(
    'a',
    { href, target: '_blank', class: 'vben-link' },
    { default: () => text },
  );

const {
  authorEmail,
  authorName,
  authorUrl,
  buildTime,
  dependencies = {},
  devDependencies = {},
  homepage,
  license,
  version,
  // vite inject-metadata 插件注入的全域變數
} = __VBEN_ADMIN_METADATA__ || {};

const vbenDescriptionItems: DescriptionItem[] = [
  {
    content: version,
    title: '版本號',
  },
  {
    content: license,
    title: '開源許可協議',
  },
  {
    content: buildTime,
    title: '最後建置時間',
  },
  {
    content: renderLink(homepage, '點擊查看'),
    title: '首頁',
  },
  {
    content: renderLink(VBEN_DOC_URL, '點擊查看'),
    title: '文件位址',
  },
  {
    content: renderLink(VBEN_PREVIEW_URL, '點擊查看'),
    title: '預覽位址',
  },
  {
    content: renderLink(VBEN_GITHUB_URL, '點擊查看'),
    title: 'Github',
  },
  {
    content: h('div', [
      renderLink(authorUrl, `${authorName}  `),
      renderLink(`mailto:${authorEmail}`, authorEmail),
    ]),
    title: '作者',
  },
];

const dependenciesItems = Object.keys(dependencies).map((key) => ({
  content: dependencies[key],
  title: key,
}));

const devDependenciesItems = Object.keys(devDependencies).map((key) => ({
  content: devDependencies[key],
  title: key,
}));
</script>

<template>
  <Page :title="title">
    <template #description>
      <p class="text-foreground mt-3 text-sm leading-6">
        <a :href="VBEN_GITHUB_URL" class="vben-link" target="_blank">
          {{ name }}
        </a>
        {{ description }}
      </p>
    </template>
    <div class="card-box p-5">
      <div>
        <h5 class="text-foreground text-lg">基本資訊</h5>
      </div>
      <div class="mt-4">
        <dl class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          <template v-for="item in vbenDescriptionItems" :key="item.title">
            <div class="border-border border-t px-4 py-6 sm:col-span-1 sm:px-0">
              <dt class="text-foreground text-sm font-medium leading-6">
                {{ item.title }}
              </dt>
              <dd class="text-foreground mt-1 text-sm leading-6 sm:mt-2">
                <VbenRenderContent :content="item.content" />
              </dd>
            </div>
          </template>
        </dl>
      </div>
    </div>

    <div class="card-box mt-6 p-5">
      <div>
        <h5 class="text-foreground text-lg">生產環境相依性</h5>
      </div>
      <div class="mt-4">
        <dl class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          <template v-for="item in dependenciesItems" :key="item.title">
            <div class="border-border border-t px-4 py-3 sm:col-span-1 sm:px-0">
              <dt class="text-foreground text-sm">
                {{ item.title }}
              </dt>
              <dd class="text-foreground/80 mt-1 text-sm sm:mt-2">
                <VbenRenderContent :content="item.content" />
              </dd>
            </div>
          </template>
        </dl>
      </div>
    </div>
    <div class="card-box mt-6 p-5">
      <div>
        <h5 class="text-foreground text-lg">開發環境相依性</h5>
      </div>
      <div class="mt-4">
        <dl class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          <template v-for="item in devDependenciesItems" :key="item.title">
            <div class="border-border border-t px-4 py-3 sm:col-span-1 sm:px-0">
              <dt class="text-foreground text-sm">
                {{ item.title }}
              </dt>
              <dd class="text-foreground/80 mt-1 text-sm sm:mt-2">
                <VbenRenderContent :content="item.content" />
              </dd>
            </div>
          </template>
        </dl>
      </div>
    </div>
  </Page>
</template>
