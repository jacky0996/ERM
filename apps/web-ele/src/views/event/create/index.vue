<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { Page } from '@vben/common-ui';
import {
  ElButton,
  ElForm,
  ElFormItem,
  ElInput,
  ElDatePicker,
  ElUpload,
  ElMessage,
  type FormInstance,
  type FormRules,
  type UploadProps,
  type UploadFile,
} from 'element-plus';

const router = useRouter();
const formRef = ref<FormInstance>();

const form = reactive({
  title: '',
  description: '',
  start_time: '' as string | null,
  end_time: '' as string | null,
  landmark: '',
  address: '',
  banner_url: '',
});

/** 表單驗證規則（全部必填） */
const rules: FormRules = {
  title: [{ required: true, message: '請輸入活動名稱', trigger: 'blur' }],
  description: [{ required: true, message: '請輸入活動簡介', trigger: 'blur' }],
  start_time: [{ required: true, message: '請選擇開始時間', trigger: 'change' }],
  end_time: [{ required: true, message: '請選擇結束時間', trigger: 'change' }],
  landmark: [{ required: true, message: '請輸入活動地標', trigger: 'blur' }],
  address: [{ required: true, message: '請輸入活動地址', trigger: 'blur' }],
  banner_url: [{ required: true, message: '請上傳活動橫幅', trigger: 'change' }],
};

/** Banner 預覽 URL */
const bannerPreviewUrl = ref<string>('');
const uploading = ref(false);

/** 上傳前確認格式 */
const beforeBannerUpload: UploadProps['beforeUpload'] = (rawFile) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (!allowedTypes.includes(rawFile.type)) {
    ElMessage.error('僅支援 JPG、PNG、GIF、WebP 格式');
    return false;
  }
  if (rawFile.size / 1024 / 1024 > 5) {
    ElMessage.error('圖片大小不得超過 5MB');
    return false;
  }
  return true;
};

/** 上傳成功後取得 URL */
const handleBannerSuccess: UploadProps['onSuccess'] = (response, file: UploadFile) => {
  bannerPreviewUrl.value = URL.createObjectURL(file.raw!);
  form.banner_url = response?.url ?? bannerPreviewUrl.value;
  uploading.value = false;
  formRef.value?.validateField('banner_url');
};

/** 選擇檔案後即時預覽 */
function handleBannerChange(file: UploadFile) {
  if (file.raw) {
    bannerPreviewUrl.value = URL.createObjectURL(file.raw);
    form.banner_url = bannerPreviewUrl.value;
    formRef.value?.validateField('banner_url');
  }
}

/** 送出表單 */
async function handleSubmit() {
  try {
    await formRef.value?.validate();
    // TODO: 呼叫建立活動 API
    ElMessage.success('活動建立成功！');
    router.push('/event-management/list');
  } catch {
    // 驗證失敗，不送出
  }
}

/** 返回列表 */
function handleCancel() {
  router.push('/event-management/list');
}
</script>

<template>
  <Page title="建立活動">
    <div class="p-6 max-w-[80%] mx-auto">
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-position="top"
        class="space-y-6"
      >
        <!-- Banner 上傳 -->
        <el-form-item label="活動橫幅 (Banner)" prop="banner_url" required>
          <el-upload
            class="banner-uploader w-full"
            :show-file-list="false"
            :before-upload="beforeBannerUpload"
            :on-success="handleBannerSuccess"
            action="#"
            :auto-upload="false"
            accept="image/*"
            :on-change="handleBannerChange"
          >
            <img
              v-if="bannerPreviewUrl"
              :src="bannerPreviewUrl"
              class="w-full h-72 object-cover rounded-lg border"
              alt="Banner 預覽"
            />
            <div
              v-else
              class="flex flex-col items-center justify-center w-full h-72 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 transition-colors"
            >
              <el-icon class="text-4xl text-gray-400 mb-2"><Plus /></el-icon>
              <span class="text-sm text-gray-500">點擊上傳活動橫幅</span>
              <span class="text-4xl text-gray-400 mt-5">JPG / PNG / GIF / WebP，最大 5MB</span>
            </div>
          </el-upload>
        </el-form-item>

        <!-- 活動名稱 -->
        <el-form-item label="活動名稱" prop="title" required>
          <el-input
            v-model="form.title"
            placeholder="請輸入活動名稱"
            clearable
            maxlength="100"
            show-word-limit
          />
        </el-form-item>

        <!-- 活動簡介 -->
        <el-form-item label="活動簡介" prop="description" required>
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="4"
            placeholder="請輸入活動簡介"
            maxlength="1000"
            show-word-limit
          />
        </el-form-item>

        <!-- 活動時間 -->
        <el-form-item label="開始時間" prop="start_time" required>
          <el-date-picker
            v-model="form.start_time"
            type="datetime"
            placeholder="請選擇開始時間"
            format="YYYY/MM/DD HH:mm"
            value-format="YYYY-MM-DD HH:mm:ss"
            class="w-full"
          />
        </el-form-item>

        <el-form-item label="結束時間" prop="end_time" required>
          <el-date-picker
            v-model="form.end_time"
            type="datetime"
            placeholder="請選擇結束時間"
            format="YYYY/MM/DD HH:mm"
            value-format="YYYY-MM-DD HH:mm:ss"
            :disabled-date="(time: Date) => form.start_time ? time < new Date(form.start_time) : false"
            class="w-full"
          />
        </el-form-item>

        <!-- 活動地標 -->
        <el-form-item label="活動地標" prop="landmark" required>
          <el-input
            v-model="form.landmark"
            placeholder="請輸入活動地標"
            clearable
          />
        </el-form-item>

        <!-- 活動地址 -->
        <el-form-item label="活動地址" prop="address" required>
          <el-input
            v-model="form.address"
            placeholder="請輸入完整活動地址"
            clearable
          />
        </el-form-item>

        <!-- 操作按鈕 -->
        <el-form-item class="pt-4">
          <div class="flex gap-3">
            <el-button type="primary" @click="handleSubmit">建立活動</el-button>
            <el-button @click="handleCancel">取消</el-button>
          </div>
        </el-form-item>
      </el-form>
    </div>
  </Page>
</template>
<style scoped src="./create.css"></style>

