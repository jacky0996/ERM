import { requestClient } from '#/api/request';

/**
 * 獲取人員列表
 */
export async function getMemberListApi(params: any) {
  return requestClient.post('http://127.0.0.1:8000/api/ehr/member/list', params);
}

/**
 * 匯入人員名單
 */
export async function importMemberApi(data: FormData) {
  return requestClient.post('/ehr/member/import', data);
}
