<script setup lang="ts">
import { ref } from 'vue';

import { ElButton, ElMessage, ElUpload, type UploadFile } from 'element-plus';

import { useVbenModal } from '@vben/common-ui';

interface Props {
  /** 彈窗標題 */
  title?: string;
  /** 範例檔案下載路徑 */
  sampleUrl?: string;
  /** 上傳 API 函式 */
  uploadApi: (data: FormData) => Promise<any>;
  /** 額外的上傳參數，用於後端識別功能 */
  extraParams?: Record<string, any>;
}

const props = withDefaults(defineProps<Props>(), {
  title: '匯入資料',
  sampleUrl: '',
  extraParams: () => ({}),
});

const emit = defineEmits(['success']);

const fileList = ref<UploadFile[]>([]);
const uploading = ref(false);

const [Modal, modalApi] = useVbenModal({
  onCancel() {
    modalApi.close();
  },
  onConfirm: async () => {
    if (fileList.value.length === 0) {
      ElMessage.warning('請先選擇要上傳的檔案');
      return;
    }

    const formData = new FormData();
    // 放入檔案
    formData.append('file', fileList.value[0]!.raw as File);

    // 放入額外參數
    if (props.extraParams) {
      Object.entries(props.extraParams).forEach(([key, value]) => {
        formData.append(key, value);
      });
    }

    try {
      uploading.value = true;
      modalApi.setState({ confirmLoading: true });
      await props.uploadApi(formData);
      ElMessage.success('匯入成功');
      modalApi.close();
      emit('success');
    } catch (error: any) {
      ElMessage.error(`匯入失敗: ${error.message || '未知錯誤'}`);
    } finally {
      uploading.value = false;
      modalApi.setState({ confirmLoading: false });
    }
  },
});

function handleDownloadSample() {
  if (!props.sampleUrl) {
    ElMessage.warning('尚未配置範例檔案路徑');
    return;
  }

  // 取得基礎路徑 (通常為 /)
  const baseUrl = import.meta.env.BASE_URL || '/';
  // 移除 props.sampleUrl 開頭的 / 以免重複
  const relativeUrl = props.sampleUrl.startsWith('/')
    ? props.sampleUrl.slice(1)
    : props.sampleUrl;

  const fullUrl = `${baseUrl}${relativeUrl}`;

  // 建立隱藏的 a 標籤來執行下載，能更穩定處理中文檔名與下載行為
  const link = document.createElement('a');
  link.href = fullUrl;
  // 如果有網址中有中文，部分瀏覽器需要對路徑進行編碼，但 href 通常會自動處理
  // 這裡我們嘗試直接執行下載
  link.setAttribute('download', '');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  ElMessage.info('正在下載範例檔案...');
}

function handleFileChange(file: UploadFile) {
  fileList.value = [file];
}

function handleRemove() {
  fileList.value = [];
}
</script>

<template>
  <Modal :title="props.title">
    <div class="px-12 py-10">
      <div class="mb-10 flex items-center justify-between">
        <div class="flex flex-col gap-2">
          <span class="text-2xl font-bold text-foreground">上傳 Excel 檔案</span>
          <span class="text-muted-foreground text-lg">請依照範例格式填寫後上傳</span>
        </div>
        <ElButton
          v-if="props.sampleUrl"
          type="warning"
          plain
          size="large"
          class="text-lg px-6 py-4"
          @click="handleDownloadSample"
        >
          下載匯入範例
        </ElButton>
      </div>

      <ElUpload
        v-model:file-list="fileList"
        :auto-upload="false"
        :limit="1"
        :on-change="handleFileChange"
        :on-remove="handleRemove"
        accept=".xlsx, .xls"
        action=""
        drag
      >
        <div class="el-upload__text py-16">
          <div class="text-6xl mb-6 text-primary/60">
            <i class="el-icon-upload"></i>
          </div>
          <div class="text-2xl mb-2">將檔案拖曳至此</div>
          <em class="text-primary cursor-pointer font-bold text-2xl">或點擊上傳</em>
        </div>
        <template #tip>
          <div class="el-upload__tip text-center mt-8 text-xl text-gray-400">
            <span class="text-xl">僅支援 .xlsx 或 .xls 格式之 Excel 檔案</span>
          </div>
        </template>
      </ElUpload>
    </div>
  </Modal>
</template>

<style scoped>
:deep(.el-upload-dragger) {
  width: 100%;
  height: 350px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  border-width: 2px;
  border-style: dashed;
}

:deep(.el-upload) {
  width: 100%;
}
</style>
