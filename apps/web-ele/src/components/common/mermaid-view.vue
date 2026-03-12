<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import mermaid from 'mermaid';

interface Props {
  content: string;
  theme?: 'default' | 'forest' | 'dark' | 'neutral';
}

const props = withDefaults(defineProps<Props>(), {
  theme: 'default',
});

const container = ref<HTMLElement | null>(null);
const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;

// 初始化 mermaid
mermaid.initialize({
  startOnLoad: false,
  theme: props.theme,
  securityLevel: 'loose',
});

async function renderChart() {
  if (!container.value || !props.content) return;
  
  try {
    const { svg } = await mermaid.render(id, props.content);
    container.value.innerHTML = svg;
  } catch (error) {
    console.error('Mermaid rendering failed:', error);
    container.value.innerHTML = `<div class="text-red-500 font-mono text-xs">圖表渲染失敗: ${error}</div>`;
  }
}

onMounted(() => {
  renderChart();
});

watch(() => props.content, () => {
  renderChart();
});
</script>

<template>
  <div ref="container" class="mermaid-container flex justify-center py-4 overflow-x-auto">
    <!-- SVG will be injected here -->
  </div>
</template>

<style scoped>
.mermaid-container :deep(svg) {
  max-width: 100%;
  height: auto;
}
</style>
