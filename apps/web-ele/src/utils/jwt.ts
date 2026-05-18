/**
 * 純前端 JWT 工具 — 只用來「主動偵測過期」,不負責驗章。
 *
 * 真正的驗章在中台 / 各業務後端;前端只解 payload 看 exp,
 * 過期就讓 router guard 提前跳轉,避免使用者觸發 401 才被踢。
 */

interface JwtPayload {
  exp?: number;
  iat?: number;
  [key: string]: unknown;
}

function base64UrlDecode(input: string): string {
  const padded = input.replaceAll('-', '+').replaceAll('_', '/');
  const pad = padded.length % 4;
  const full = pad ? padded + '='.repeat(4 - pad) : padded;
  return decodeURIComponent(
    Array.prototype.map
      .call(atob(full), (c: string) => {
        return `%${`00${(c.codePointAt(0) ?? 0).toString(16)}`.slice(-2)}`;
      })
      .join(''),
  );
}

export function decodeJwtPayload(token: string): JwtPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    return JSON.parse(base64UrlDecode(parts[1])) as JwtPayload;
  } catch {
    return null;
  }
}

/**
 * 判斷 token 是否已過期 / 即將過期。
 * leewaySeconds:留一點寬限時間,避免時鐘漂移誤判;預設 30 秒。
 * payload 取不到 exp 視同過期(保守處理)。
 */
export function isTokenExpired(
  token: null | string,
  leewaySeconds = 30,
): boolean {
  if (!token) return true;
  const payload = decodeJwtPayload(token);
  if (!payload?.exp) return true;
  const nowSec = Math.floor(Date.now() / 1000);
  return payload.exp <= nowSec + leewaySeconds;
}
