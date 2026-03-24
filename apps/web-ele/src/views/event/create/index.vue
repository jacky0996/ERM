<script setup lang="ts">
import { ref } from 'vue';
import { Page } from '@vben/common-ui';
import { Ckeditor } from '@ckeditor/ckeditor5-vue';
import 'ckeditor5/ckeditor5.css';
import {
  ElButton,
  ElDatePicker,
  ElDialog,
  ElForm,
  ElFormItem,
  ElInput,
  ElRadioButton,
  ElRadioGroup,
  ElUpload,
  ElIcon,
  ElSelect,
  ElOption,
} from 'element-plus';

// Hooks
import { useForm } from './hooks/useForm';
import { useCkeditor } from './hooks/useCkeditor';

const formRef = ref<any>(null);

const {
  form,
  rules,
  bannerPreviewUrl,
  previewVisible,
  previewDevice,
  beforeBannerUpload,
  handleBannerChange,
  handleSubmit,
  handleCancel,
  generatePreviewHtml,
  handlePreview,
} = useForm(formRef);

const {
  libraryVisible,
  libraryImages,
  libraryLoading,
  editorConfig,
  ClassicEditor,
  onEditorReady,
  handleLibraryUpload,
  insertLibraryImage,
} = useCkeditor();

/** 更新 Iframe 高度以消除內部捲軸 */
function updateIframeHeight(e: any) {
  const iframe = e.target;
  if (iframe && iframe.contentWindow) {
    iframe.style.height = 'px';
    const height = iframe.contentWindow.document.body.scrollHeight;
    iframe.style.height = `${height}px`;
  }
}
</script>

<template>
  <Page title="建立活動" >
    <div class="p-6">
      <ElForm
        ref="formRef"
        :model="form"
        :rules="rules"
        label-position="top"
        class="space-y-6"
      >
        <!-- Banner 上傳 -->
        <ElFormItem label="活動橫幅(預設夾帶華電標誌，點選後可以替換圖片)" prop="img_url" required>
          <ElUpload
            class="banner-uploader w-full"
            :show-file-list="false"
            :before-upload="beforeBannerUpload"
            action="#"
            :auto-upload="false"
            accept="image/*"
            :on-change="handleBannerChange"
          >
            <img
              v-if="bannerPreviewUrl"
              :src="bannerPreviewUrl"
              class="h-72 w-full rounded-lg border object-cover"
              alt="Banner 預覽"
            />
            <div
              v-else
              class="flex h-72 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 transition-colors hover:border-blue-400"
            >
              <ElIcon class="mb-2 text-4xl text-gray-400">
                <svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
                  <path fill="currentColor" d="M480 480V128a32 32 0 0 1 64 0v352h352a32 32 0 1 1 0 64H544v352a32 32 0 1 1-64 0V544H128a32 32 0 1 1 0-64h352z"></path>
                </svg>
              </ElIcon>
              <span class="text-sm text-gray-500">點擊上傳活動橫幅</span>
              <span class="mt-5 text-4xl text-gray-400">JPG / PNG / GIF / WebP，最大 5MB</span>
            </div>
          </ElUpload>
        </ElFormItem>

        <!-- 2. 活動類型 -->
        <ElFormItem label="活動類型" prop="activity_type" required>
          <ElSelect
            v-model="form.activity_type"
            placeholder="請選擇活動類型"
            class="w-full custom-height"
            clearable
          >
            <ElOption label="會議" :value="0" />
            <ElOption label="工作坊" :value="1" />
            <ElOption label="記者會" :value="2" />
            <ElOption label="標準制定會議" :value="3" />
            <ElOption label="創意競賽" :value="4" />
            <ElOption label="其他活動" :value="5" />
          </ElSelect>
        </ElFormItem>

        <!-- 3. 活動名稱 -->
        <ElFormItem label="活動名稱" prop="title" required>
          <ElInput
            v-model="form.title"
            placeholder="請輸入活動名稱"
            clearable
            maxlength="100"
            show-word-limit
            class="custom-height"
          />
        </ElFormItem>

        <!-- 活動簡介 -->
        <ElFormItem label="活動簡介" prop="summary" required>
          <ElInput
            v-model="form.summary"
            type="textarea"
            :rows="4"
            placeholder="請輸入活動簡介"
            maxlength="1000"
            show-word-limit
          />
        </ElFormItem>

        <!-- 活動時間 -->
        <div class="grid grid-cols-2 gap-4">
          <ElFormItem label="開始時間" prop="start_time" required>
            <ElDatePicker
              v-model="form.start_time"
              type="datetime"
              placeholder="請選擇開始時間"
              format="YYYY/MM/DD HH:mm"
              value-format="YYYY-MM-DD HH:mm:ss"
              class="w-full custom-height"
            />
          </ElFormItem>

          <ElFormItem label="結束時間" prop="end_time" required>
            <ElDatePicker
              v-model="form.end_time"
              type="datetime"
              placeholder="請選擇結束時間"
              format="YYYY/MM/DD HH:mm"
              value-format="YYYY-MM-DD HH:mm:ss"
              :disabled-date="(time: Date) => form.start_time ? time < new Date(form.start_time) : false"
              class="w-full custom-height"
            />
          </ElFormItem>
        </div>

        <!-- 活動地標 -->
        <ElFormItem label="活動地標" prop="landmark" required>
          <ElInput
            v-model="form.landmark"
            placeholder="請輸入活動地標"
            clearable
            class="custom-height"
          />
        </ElFormItem>

        <!-- 活動地址 -->
        <ElFormItem label="活動地址" prop="address" required>
          <ElInput
            v-model="form.address"
            placeholder="請輸入活動地址"
            clearable
            class="custom-height"
          />
        </ElFormItem>

        <!-- CKEditor 活動內容 -->
        <ElFormItem label="活動內容" prop="content" required>
          <Ckeditor
            v-model="form.content"
            :editor="ClassicEditor"
            :config="editorConfig"
            @ready="onEditorReady"
          />
        </ElFormItem>

        <!-- 按鈕區：調整為與詳細頁一致的一左一右佈局 -->
        <div class="mt-8 flex items-center justify-between border-t py-6">
          <ElButton size="large" @click="handleCancel"> 返回列表 </ElButton>

          <div class="flex gap-4">
            <ElButton size="large" @click="handlePreview"> 測試預覽 </ElButton>
            <ElButton type="primary" size="large" @click="handleSubmit"> 建立活動 </ElButton>
          </div>
        </div>
      </ElForm>

      <!-- 預覽 Dialog -->
      <ElDialog
        v-model="previewVisible"
        title="郵件預覽"
        width="95%"
        top="2vh"
        destroy-on-close
        class="gmail-preview-dialog"
      >
        <div class="bg-gray-100 min-h-[85vh] flex flex-col rounded-xl overflow-hidden shadow-inner border border-gray-200">
          <!-- 裝置切換列 -->
          <div class="device-switcher flex items-center justify-center gap-4 py-4 bg-white border-b sticky top-0 z-10">
            <ElRadioGroup v-model="previewDevice">
              <ElRadioButton label="web">電腦瀏覽器</ElRadioButton>
              <ElRadioButton label="mobile">移動端手機</ElRadioButton>
            </ElRadioGroup>
          </div>

          <!-- Web 模式 -->
          <div v-if="previewDevice === 'web'" class="gmail-web-shell flex flex-col flex-1">
            <!-- Gmail 頂部搜尋欄模擬 -->
            <div class="h-16 bg-white border-b flex items-center px-8 justify-between shrink-0">
              <div class="flex items-center gap-6">
                <span class="text-2xl font-bold text-gray-700 bg-gray-100 px-3 py-1 rounded">Gmail</span>
                <div class="bg-blue-50 w-[600px] h-11 rounded-xl flex items-center px-4 text-gray-500 border border-transparent hover:bg-white hover:border-gray-200 hover:shadow-sm transition-all">
                  搜尋郵件
                </div>
              </div>
              <div class="flex items-center gap-4">
                <div class="w-10 h-10 rounded-full bg-blue-500 shadow-sm border-2 border-white"></div>
              </div>
            </div>

            <div class="flex flex-1 overflow-hidden">
              <!-- 左側選單 -->
              <div class="w-64 p-4 flex flex-col gap-1">
                <div class="bg-[#c2e7ff] text-[#001d35] px-6 py-4 rounded-2xl font-medium mb-4 w-32 text-center shadow-sm">撰寫</div>
                <div class="bg-[#d3e3fd] text-[#041e49] px-6 py-1.5 rounded-full font-bold">收件匣</div>
                <div class="px-6 py-1.5 text-gray-700 hover:bg-gray-100 rounded-full cursor-pointer">星號郵件</div>
                <div class="px-6 py-1.5 text-gray-700 hover:bg-gray-100 rounded-full cursor-pointer">已傳送</div>
                <div class="px-6 py-1.5 text-gray-700 hover:bg-gray-100 rounded-full cursor-pointer">草稿</div>
              </div>

              <!-- 右側郵件內容區 -->
              <div class="flex-1 bg-white m-4 rounded-2xl shadow-sm overflow-auto p-8 relative">
                <div class="text-2xl mb-6 font-normal text-gray-800">{{ form.title || '（無主旨）' }}</div>

                <div class="flex items-center gap-3 mb-8 border-b pb-8">
                  <div class="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-lg">H</div>
                  <div class="flex flex-col">
                    <div class="font-bold text-sm">華電管理員 <span class="font-normal text-xs text-secondary">&lt;admin@hwacom.com&gt;</span></div>
                    <div class="text-xs text-secondary">寄給「我」</div>
                  </div>
                </div>

                <div class="iframe-wrapper flex justify-center w-full">
                  <iframe
                    title="Gmail Web Preview"
                    :srcdoc="generatePreviewHtml()"
                    scrolling="no"
                    @load="updateIframeHeight"
                    style="width: 100%; border: none; background-color: transparent;"
                  ></iframe>
                </div>
              </div>
            </div>
          </div>

          <!-- Mobile 模式 -->
          <div v-else class="gmail-mobile-shell flex flex-col items-center py-8 h-[85vh] overflow-y-auto">
            <div class="mobile-device-frame relative w-[412px] h-[820px] bg-black rounded-[60px] p-4 shadow-2xl border-[8px] border-gray-800">
              <div class="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-7 bg-black rounded-b-3xl"></div>
              <div class="bg-white w-full h-full rounded-[40px] overflow-hidden flex flex-col">
                <div class="h-12 border-b flex items-center px-4 justify-between mt-4">
                  <span class="font-bold">Gmail</span>
                  <div class="w-8 h-8 rounded-full bg-blue-500"></div>
                </div>
                <div class="flex-1 overflow-auto p-4">
                  <div class="text-xl font-medium mb-4">{{ form.title || '（無主旨）' }}</div>
                  <div class="flex items-center gap-2 mb-4">
                    <div class="w-8 h-8 rounded-full bg-blue-500"></div>
                    <div>
                      <div class="text-sm font-bold">管理員 <span class="font-normal text-xs">12:30</span></div>
                      <div class="text-xs text-secondary font-normal">寄給 我</div>
                    </div>
                  </div>
                  <div class="iframe-wrapper">
                    <iframe
                      title="Gmail Mobile Preview"
                      :srcdoc="generatePreviewHtml()"
                      scrolling="no"
                      @load="updateIframeHeight"
                      class="w-full border-none"
                      style="min-height: 400px;"
                    ></iframe>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ElDialog>

      <!-- 圖片庫 Dialog -->
      <ElDialog
        v-model="libraryVisible"
        title="圖片庫與上傳管理"
        width="800"
        destroy-on-close
      >
        <div class="library-container p-4">
          <div class="mb-4">
            <ElUpload
              drag
              action=""
              :http-request="handleLibraryUpload"
              :show-file-list="false"
              accept="image/*"
            >
              <div class="el-upload__text">將檔案拖到此處，或<em>點擊上傳</em></div>
            </ElUpload>
          </div>

          <div v-loading="libraryLoading" class="image-grid grid grid-cols-4 gap-4 mt-8 max-h-[400px] overflow-auto p-2">
            <div
              v-for="(url, index) in libraryImages"
              :key="index"
              class="relative group cursor-pointer border rounded-lg overflow-hidden h-32 hover:border-blue-500 transition-all shadow-sm"
              @click="insertLibraryImage(url)"
            >
              <img :src="url" class="w-full h-full object-cover" />
              <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <span class="text-white text-xs px-2 py-1 bg-blue-500 rounded">插入圖片</span>
              </div>
            </div>
            <div v-if="libraryImages.length === 0" class="col-span-4 py-8 text-center text-gray-400">尚無圖片，請先上傳</div>
          </div>
        </div>
      </ElDialog>
    </div>
  </Page>
</template>

<style scoped src="./create.css"></style>
<style>
.ck-editor__editable_inline {
  min-height: 400px;
}
</style>
