import { reactive, ref, computed, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { ElMessage } from 'element-plus';
import type { FormRules, UploadFile, UploadProps } from 'element-plus';
import { useUserStore } from '@vben/stores';
import { getEventDetailApi, updateEventApi } from '#/api/event';

export function useDetailForm(formRef: any) {
  const router = useRouter();
  const route = useRoute();
  const userStore = useUserStore();
  
  const eventId = computed(() => route.params.id as string);
  const isReadonly = ref(true);
  const loading = ref(false);

  const form = reactive({
    id: eventId.value,
    title: '',
    event_number: '',
    activity_type: '' as number | string,
    summary: '',
    start_time: '' as null | string,
    end_time: '' as null | string,
    landmark: '',
    address: '',
    img_url: '/event_default.png',
    content: '',
    is_registration: false,
    is_approval: false,
  });

  const bannerPreviewUrl = ref<string>('/event_default.png');
  const uploading = ref(false);

  /** 表單驗證規則 */
  const rules: FormRules = {
    title: [{ required: true, message: '請輸入活動名稱', trigger: 'blur' }],
    activity_type: [{ required: true, message: '請選擇活動類型', trigger: 'change' }],
    summary: [{ required: true, message: '請輸入活動簡介', trigger: 'blur' }],
    start_time: [{ required: true, message: '請選擇開始時間', trigger: 'change' }],
    end_time: [{ required: true, message: '請選擇結束時間', trigger: 'change' }],
    landmark: [{ required: true, message: '請輸入活動地標', trigger: 'blur' }],
    address: [{ required: true, message: '請輸入活動地址', trigger: 'blur' }],
    img_url: [{ required: true, message: '請上傳活動橫幅', trigger: 'change' }],
    content: [{ required: true, message: '請輸入活動內容', trigger: 'blur' }],
  };

  /** 取得活動詳細資料 */
  async function fetchEventDetail() {
    if (!eventId.value) return;
    try {
      loading.value = true;
      const res: any = await getEventDetailApi({ id: eventId.value });
      const detail = res?.data || res || {};
      
      form.title = detail.title || '';
      form.event_number = detail.event_number || '';
      form.activity_type = detail.type !== undefined ? detail.type : (detail.activity_type !== undefined ? detail.activity_type : '');
      form.summary = detail.summary || detail.description || '';
      form.start_time = detail.start_time || '';
      form.end_time = detail.end_time || '';
      form.landmark = detail.landmark || '';
      form.address = detail.address || '';
      form.img_url = detail.img_url || detail.banner_url || '/event_default.png';
      form.content = detail.content || '';
      
      // 轉換數據格式 (1/0 -> Boolean)
      form.is_registration = detail.is_registration === 1;
      form.is_approval = detail.is_approval === 1;

      bannerPreviewUrl.value = form.img_url;
    } catch (error) {
      console.error('Failed to fetch event detail:', error);
      ElMessage.error('無法取得活動詳細資料');
    } finally {
      loading.value = false;
    }
  }

  watch(
    () => eventId.value,
    (newId) => {
      if (newId) {
        isReadonly.value = true;
        fetchEventDetail();
      }
    },
    { immediate: true },
  );

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

  function handleBannerChange(file: UploadFile) {
    if (file.raw) {
      bannerPreviewUrl.value = URL.createObjectURL(file.raw);
      form.img_url = bannerPreviewUrl.value;
      formRef.value?.validateField('img_url');
    }
  }

  function toggleEdit() {
    isReadonly.value = false;
  }

  function cancelEdit() {
    isReadonly.value = true;
    fetchEventDetail(); 
    formRef.value?.clearValidate();
  }

  async function handleSubmit() {
    try {
      await formRef.value?.validate();
      loading.value = true;
      
      const userInfo: any = userStore.userInfo || {};
      const { event_number, ...formWithoutNumber } = form;

      const payload = {
        ...formWithoutNumber,
        type: form.activity_type,
        updater_id: userInfo?.id || userInfo?.userId || '',
        is_registration: form.is_registration ? 1 : 0,
        is_approval: form.is_approval ? 1 : 0,
      };
      
      const res: any = await updateEventApi(payload);
      
      if (res && (res.code === 200 || res.code === 0 || !res.code)) {
        ElMessage.success('更新成功');
        isReadonly.value = true;
        await fetchEventDetail(); 
      } else {
        throw new Error(res?.msg || res?.message || '更新失敗');
      }
    } catch (error: any) {
      console.error(error);
      ElMessage.error(error.message || '請確認表單欄位填寫正確');
    } finally {
      loading.value = false;
    }
  }

  function handleBack() {
    router.push('/event/list');
  }

  const previewVisible = ref(false);
  const previewDevice = ref<'web' | 'mobile'>('web');

  function generatePreviewHtml() {
    const banner = form.img_url || '/event_default.png';
    const typeMap: Record<string, string> = {
      '0': '會議', '1': '工作坊', '2': '記者會', '3': '標準制定會議', '4': '創意競賽', '5': '其他活動',
    };
    const typeName = typeMap[String(form.activity_type)] || '-';

    return `
      <!DOCTYPE html>
      <html style="overflow: hidden;">
        <head>
          <style>
            body { font-family: 'Arial', sans-serif; margin: 0; padding: 20px; background-color: #f4f4f4; color: #333; overflow: hidden; }
            .container { width: 100%; max-width: ${previewDevice.value === 'web' ? '100%' : '375px'}; margin: 0 auto; background: #fff; padding: 0; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
            .banner { width: 100%; height: auto; display: block; }
            .body { padding: 30px; }
            .title { font-size: 24px; font-weight: bold; margin-bottom: 10px; color: #1a73e8; }
            .info { background: #f8f9fa; border-left: 4px solid #1a73e8; padding: 15px; margin: 20px 0; font-size: 14px; }
            .info-item { margin-bottom: 4px; }
            .content { line-height: 1.6; font-size: 15px; margin-top: 25px; }
            .content img { max-width: 100%; height: auto; border-radius: 4px; }
            .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; background: #fafafa; border-top: 1px solid #efefef; }
          </style>
        </head>
        <body>
          <div class="container">
            <img src="${banner}" class="banner" alt="Banner" />
            <div class="body">
              <div class="title">${form.title || '（未輸入名稱）'}</div>
              <div class="info">
                <div class="info-item"><strong>🆔 活動編號：</strong>${form.event_number || '-'}</div>
                <div class="info-item"><strong>🏷️ 活動類型：</strong>${typeName}</div>
                <div class="info-item"><strong>📍 活動地標：</strong>${form.landmark || '-'}</div>
                <div class="info-item"><strong>📅 活動時間：</strong>${form.start_time || '-'} ~ ${form.end_time || '-'}</div>
              </div>
              <div class="content">${form.content || '請輸入活動內容...'}</div>
            </div>
            <div class="footer">本郵件由 華電聯網 系統自動發送</div>
          </div>
        </body>
      </html>
    `;
  }

  function handlePreview() {
    previewVisible.value = true;
  }

  return {
    form,
    rules,
    bannerPreviewUrl,
    uploading,
    loading,
    isReadonly,
    previewVisible,
    previewDevice,
    beforeBannerUpload,
    handleBannerChange,
    toggleEdit,
    cancelEdit,
    handleSubmit,
    handleBack,
    generatePreviewHtml,
    handlePreview,
  };
}
