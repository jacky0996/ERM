import dayjs from 'dayjs';

/**
 * 格式化日期時間為 YYYY-MM-DD HH:mm:ss
 * @param date 日期資料
 * @returns 格式化後的字串，若無值則回傳「尚無資料」
 */
export function formatDateTime(date: string | number | Date | null | undefined) {
  if (!date) return '尚無資料';
  return dayjs(date).format('YYYY-MM-DD HH:mm:ss');
}
