import { requestClient } from '#/api/request';

/**
 * 獲取人員列表
 */
export async function getMemberListApi(params: any) {
  return requestClient.post('/edm/member/list', params);
}
  
/**
 * 匯入人員名單
 */
export async function importMemberApi(data: FormData) {
  return requestClient.post('/edm/member/import', data);
}
/**
 * 獲取人員詳情
 */
export async function getMemberDetailApi(id: string | number) {
  return requestClient.post(`/edm/member/view`, { id });
}
