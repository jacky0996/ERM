<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Page } from '@vben/common-ui';
import { ElCard, ElDescriptions, ElDescriptionsItem, ElTag, ElButton, ElInput, ElMessage, ElMessageBox, ElSwitch, ElDialog, ElForm, ElFormItem } from 'element-plus';
import { getMemberDetailApi, updateMemberStatusApi, updateMemberMobileApi, updateMemberEmailApi } from '#/api/member';
import { requestClient } from '#/api/request';
import { formatDateTime } from '#/utils/date';

const route = useRoute();
const router = useRouter();
const memberId = computed(() => route.params.id as string);

// 人員數據
const memberData = ref<any>({
  name: '',
  status: 1,
  salesInfo: '',    
  groups: [],       
  mobiles: [],    
  emails: [],      
  organizations: []
});

const loading = ref(false);
const editingIndex = ref<number | null>(null);
const editValue = ref('');

const editingMobileIndex = ref<number | null>(null);
const editMobileValue = ref('');

async function fetchMemberData() {
  if (!memberId.value) return;
  loading.value = true;
  try {
    const res = await getMemberDetailApi(memberId.value);
    // 處理業務資訊
    const sales = res.sales || {};
    const salesText = (sales.enumber || '') + (sales.name || '');

    memberData.value = {
      ...res,
      name: res.name || '',
      status: res.status ?? 1,
      salesInfo: salesText,
      groups: res.groups || [],
      mobiles: res.mobiles || [],
      emails: res.emails || [],
      organizations: res.organizations || []
    };
  } catch (error) {
    console.error('Failed to fetch member detail:', error);
  } finally {
    loading.value = false;
  }
}

function handleEdit(index: number, email: string) {
  editingIndex.value = index;
  editValue.value = email;
}

function handleCancel() {
  editingIndex.value = null;
  editValue.value = '';
}

async function handleSave(index: number) {
  if (!editValue.value) {
    ElMessage.warning('請輸入電子郵件');
    return;
  }
  
  const item = memberData.value.emails[index];
  const emailId = typeof item === 'object' ? item.id : null;
  
  if (!emailId) {
    ElMessage.error('找不到郵件 ID，無法更新');
    return;
  }

  try {
    loading.value = true;
    await updateMemberEmailApi(emailId, editValue.value);
    // 更新本地數據
    if (typeof memberData.value.emails[index] === 'string') {
      memberData.value.emails[index] = editValue.value;
    } else {
      memberData.value.emails[index].email = editValue.value;
    }
    ElMessage.success('電子郵件更新成功');
    handleCancel();
  } catch (error) {
    console.error('Failed to update email:', error);
    ElMessage.error('電子郵件更新失敗');
  } finally {
    loading.value = false;
  }
}

function handleDelete(index: number) {
  ElMessageBox.confirm('確定要刪除此電子郵件嗎？', '提示', {
    confirmButtonText: '確定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(() => {
    memberData.value.emails.splice(index, 1);
    ElMessage.success('刪除成功');
  }).catch(() => {});
}

function handleMobileEdit(index: number, value: string) {
  editingMobileIndex.value = index;
  editMobileValue.value = value;
}

function handleMobileCancel() {
  editingMobileIndex.value = null;
  editMobileValue.value = '';
}

async function handleMobileSave(index: number) {
  if (!editMobileValue.value) {
    ElMessage.warning('請輸入行動電話');
    return;
  }

  const item = memberData.value.mobiles[index];
  const mobileId = typeof item === 'object' ? item.id : null;

  if (!mobileId) {
    ElMessage.error('找不到電話 ID，無法更新');
    return;
  }

  try {
    loading.value = true;
    await updateMemberMobileApi(mobileId, editMobileValue.value);
    // 更新本地數據 (Key 為 mobile)
    if (typeof item === 'string') {
      memberData.value.mobiles[index] = editMobileValue.value;
    } else {
      item.mobile = editMobileValue.value;
    }
    ElMessage.success('行動電話更新成功');
    handleMobileCancel();
  } catch (error) {
    console.error('Failed to update mobile:', error);
    ElMessage.error('行動電話更新失敗');
  } finally {
    loading.value = false;
  }
}

function handleMobileDelete(index: number) {
  ElMessageBox.confirm('確定要刪除此行動電話嗎？', '提示', {
    confirmButtonText: '確定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(() => {
    memberData.value.mobiles.splice(index, 1);
    ElMessage.success('刪除成功');
  }).catch(() => {});
}

async function handleStatusChange(val: any) {
  try {
    loading.value = true;
    await updateMemberStatusApi(memberId.value, Number(val));
    ElMessage.success('狀態更新成功');
  } catch (error) {
    console.error('Failed to update status:', error);
    ElMessage.error('狀態更新失敗');
    // 如果失敗，則刷回原始資料以恢復狀態
    fetchMemberData();
  } finally {
    loading.value = false;
  }
}

// 業務編輯相關
const salesEditVisible = ref(false);
const salesEditEnumber = ref('');

function handleSalesEdit() {
  salesEditVisible.value = true;
  salesEditEnumber.value = ''; // 每次開啟重置，或是預填目前工號
}

async function handleSalesSave() {
  if (!salesEditEnumber.value) {
    ElMessage.warning('請輸入工號');
    return;
  }

  try {
    loading.value = true;
    const res: any = await requestClient.post('/edm/member/editSales', {
      member_id: memberId.value,
      enumber: salesEditEnumber.value
    }, { responseReturn: 'body' });
    
    if (res.code === 0 || res.code === 200 || res.status === true) {
      ElMessage.success('業務資訊更新成功');
      salesEditVisible.value = false;
      // 依要求執行全頁重新整理
      window.location.reload();
    } else {
      // 失敗時顯示特定訊息
      throw new Error('查無此業務');
    }
  } catch (error: any) {
    ElMessage.error(error.message || '查無此業務');
  } finally {
    loading.value = false;
  }
}

watch(
  () => memberId.value,
  (newId) => {
    if (newId) {
      fetchMemberData();
    }
  },
  { immediate: true },
);

function formatValue(val: any) {
  return val && val !== '' ? val : '尚無資料';
}

function handleBack() {
  router.back();
}
</script>

<template>
  <Page :loading="loading" :title="`人員詳情 - ${memberData.name}`">
    <template #extra>
      <ElButton @click="handleBack"> 返回列表 </ElButton>
    </template>

    <!-- 基本資訊 -->
    <ElCard shadow="never" class="detail-card">
      <ElDescriptions title="基本資訊" :column="2" border>
        <ElDescriptionsItem label="姓名">
          {{ memberData.name }}
        </ElDescriptionsItem>
        <ElDescriptionsItem label="狀態">
          <ElSwitch 
            v-model="memberData.status" 
            :active-value="1" 
            :inactive-value="0"
            active-text="啟動"
            inactive-text="停用"
            inline-prompt
            @change="handleStatusChange"
          />
        </ElDescriptionsItem>
        <ElDescriptionsItem label="業務">
          <div class="flex items-center justify-between w-full">
            <span>{{ formatValue(memberData.salesInfo) }}</span>
            <ElButton 
              size="small" 
              type="primary" 
              plain
              @click="handleSalesEdit"
            >
              編輯
            </ElButton>
          </div>
        </ElDescriptionsItem>
      </ElDescriptions>
    </ElCard>

    <!-- 業務編輯彈窗 -->
    <ElDialog
      v-model="salesEditVisible"
      title="修改業務資訊"
      width="400px"
      append-to-body
      destroy-on-close
    >
      <ElForm label-position="top">
        <ElFormItem label="工號" required>
          <ElInput 
            v-model="salesEditEnumber" 
            placeholder="請輸入工號 " 
            clearable
          />
        </ElFormItem>
      </ElForm>
      <template #footer>
        <div class="flex justify-end gap-3">
          <ElButton @click="salesEditVisible = false">取消</ElButton>
          <ElButton type="primary" @click="handleSalesSave" :loading="loading">儲存</ElButton>
        </div>
      </template>
    </ElDialog>

    <!-- 隸屬組織 -->
    <ElCard shadow="never" class="detail-card">
      <template #header>
        <span class="detail-section-title">隸屬組織</span>
      </template>
      <div v-if="memberData.organizations.length > 0" class="detail-table-container">
        <table class="custom-detail-table">
          <thead>
            <tr>
              <th>組織名稱</th>
              <th>組織部門</th>
              <th>組織職稱</th>
              <th>組織統編</th>
              <th>組織行業別</th>
              <th>組織所在國家</th>
              <th>組織所在區域</th>
              <th>組織地址</th>
              <th>組織電話</th>
              <th>組織分機</th>
              <th>組織傳真</th>
              <th>公司代碼</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in memberData.organizations" :key="index">
              <td>{{ formatValue(item.name) }}</td>
              <td>{{ formatValue(item.department) }}</td>
              <td>{{ formatValue(item.title) }}</td>
              <td>{{ formatValue(item.vat_no) }}</td>
              <td>{{ formatValue(item.industry_type) }}</td>
              <td>{{ formatValue(item.country) }}</td>
              <td>{{ formatValue(item.area) }}</td>
              <td>{{ formatValue(item.address) }}</td>
              <td>{{ formatValue(item.phone) }}</td>
              <td>{{ formatValue(item.ext) }}</td>
              <td>{{ formatValue(item.fax) }}</td>
              <td>{{ formatValue(item.codename) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-else class="empty-data-text">尚無組織資料</div>
    </ElCard>

    <!-- 行動電話 -->
    <ElCard shadow="never" class="detail-card">
      <template #header>
        <span class="detail-section-title">行動電話</span>
      </template>
      <div v-if="memberData.mobiles.length > 0" class="detail-table-container">
        <table class="custom-detail-table">
          <thead>
            <tr>
              <th>電話號碼</th>
              <th style="width: 200px;">操作管理</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in memberData.mobiles" :key="index">
              <td>
                <template v-if="editingMobileIndex === index">
                  <ElInput v-model="editMobileValue" size="small" placeholder="請輸入行動電話" />
                </template>
                <template v-else>
                  {{ item.mobile || item }}
                </template>
              </td>
              <td>
                <template v-if="editingMobileIndex === index">
                  <ElButton size="small" type="primary" @click="handleMobileSave(index as number)">儲存</ElButton>
                  <ElButton size="small" @click="handleMobileCancel">取消</ElButton>
                </template>
                <template v-else>
                  <ElButton size="small" type="primary" plain @click="handleMobileEdit(index as number, item.mobile || item)">編輯</ElButton>
                  <ElButton size="small" type="danger" plain @click="handleMobileDelete(index as number)">刪除</ElButton>
                </template>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-else class="empty-data-text">尚無電話資料</div>
    </ElCard>

    <!-- 電子郵件 -->
    <ElCard shadow="never" class="detail-card">
      <template #header>
        <span class="detail-section-title">電子郵件</span>
      </template>
      <div v-if="memberData.emails.length > 0" class="detail-table-container">
        <table class="custom-detail-table">
          <thead>
            <tr>
              <th>信箱地址</th>
              <th style="width: 200px;">操作管理</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in memberData.emails" :key="index">
              <td>
                <template v-if="editingIndex === index">
                  <ElInput v-model="editValue" size="small" placeholder="請輸入電子郵件" />
                </template>
                <template v-else>
                  {{ item.email || item }}
                </template>
              </td>
              <td>
                <template v-if="editingIndex === index">
                  <ElButton size="small" type="primary" @click="handleSave(index as number)">儲存</ElButton>
                  <ElButton size="small" @click="handleCancel">取消</ElButton>
                </template>
                <template v-else>
                  <ElButton size="small" type="primary" plain @click="handleEdit(index as number, item.email || item)">編輯</ElButton>
                  <ElButton size="small" type="danger" plain @click="handleDelete(index as number)">刪除</ElButton>
                </template>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-else class="empty-data-text">尚無郵件資料</div>
    </ElCard>

    <!-- 關聯群組 -->
    <ElCard shadow="never" class="detail-card">
      <template #header>
        <span class="detail-section-title">關聯群組</span>
      </template>
      <div v-if="memberData.groups.length > 0" class="detail-table-container">
        <table class="custom-detail-table">
          <thead>
            <tr>
              <th>群組名稱</th>
              <th>群組人數</th>
              <th>建立者</th>
              <th>狀態</th>
              <th>建立時間</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in memberData.groups" :key="index">
              <td class="cursor-pointer text-blue-500" @click="router.push(`/group/detail/${item.id || item}`)">
                {{ formatValue(item.name) }}
              </td>
              <td>
                {{ item.members ? item.members.length : '0' }}
              </td>
              <td>
                {{ formatValue(item.creator?.name) }}
              </td>
              <td>
                <ElTag :type="item.status === 1 ? 'success' : 'danger'" size="small">
                  {{ item.status === 1 ? '啟動' : '禁用' }}
                </ElTag>
              </td>
              <td>
                {{ formatDateTime(item.created_at) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-else class="empty-data-text">尚無群組資料</div>
    </ElCard>
  </Page>
</template>

<style scoped src="./index.css"></style>
