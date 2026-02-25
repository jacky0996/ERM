<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Page } from '@vben/common-ui';
import { ElCard, ElDescriptions, ElDescriptionsItem, ElTag, ElButton, ElInput, ElMessage, ElMessageBox } from 'element-plus';
import { getMemberDetailApi } from '#/api/member';
import { formatDateTime } from '#/utils/date';

const route = useRoute();
const router = useRouter();
const memberId = route.params.id as string;

// 人員數據
const memberData = ref<any>({
  name: '',
  status: 1,
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
  if (!memberId) return;
  loading.value = true;
  try {
    const res = await getMemberDetailApi(memberId);
    memberData.value = {
      ...res,
      name: res.name || '',
      status: res.status ?? 1,
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

function handleSave(index: number) {
  if (!editValue.value) {
    ElMessage.warning('請輸入電子郵件');
    return;
  }
  // 更新本地數據
  if (typeof memberData.value.emails[index] === 'string') {
    memberData.value.emails[index] = editValue.value;
  } else {
    memberData.value.emails[index].email = editValue.value;
  }
  ElMessage.success('更新成功');
  handleCancel();
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

function handleMobileSave(index: number) {
  if (!editMobileValue.value) {
    ElMessage.warning('請輸入行動電話');
    return;
  }
  // 更新本地數據 (Key 為 mobile)
  const item = memberData.value.mobiles[index];
  if (typeof item === 'string') {
    memberData.value.mobiles[index] = editMobileValue.value;
  } else {
    item.mobile = editMobileValue.value;
  }
  ElMessage.success('更新成功');
  handleMobileCancel();
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

onMounted(() => {
  fetchMemberData();
});

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
          <ElTag :type="memberData.status === 1 ? 'success' : 'danger'">
            {{ memberData.status === 1 ? '啟動' : '禁用' }}
          </ElTag>
        </ElDescriptionsItem>
      </ElDescriptions>
    </ElCard>

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
                {{ formatValue(item.creator_id) }}
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

<style scoped src="./detail.css"></style>
