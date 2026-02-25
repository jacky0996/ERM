import { requestClient } from '#/api/request';

/**
 * 獲取群組列表
 */
export async function getGroupListApi(params: any) {
  return requestClient.post('/edm/group/list', params);
}
