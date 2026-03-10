import { requestClient } from '#/api/request';

/**
 * 取得活動列表
 */
export async function getEventListApi(params: any) {
  return requestClient.post('/edm/event/list', params);
}
