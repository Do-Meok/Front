/**
 * Date를 YYYY-MM-DD 형식의 문자열로 변환
 */
export function fmtYYYYMMDD(d: Date): string {
  const yy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yy}-${mm}-${dd}`;
}

/**
 * 유통기한까지 남은 일수 계산
 * @param expiresAt 유통기한 날짜 (YYYY-MM-DD 형식 또는 null)
 * @returns 남은 일수 (음수면 지난 일수, null이면 null 반환)
 */
export function daysLeft(expiresAt: string | null): number | null {
  if (!expiresAt) return null;
  const end = new Date(expiresAt);
  const now = new Date();
  const diff = end.setHours(0, 0, 0, 0) - now.setHours(0, 0, 0, 0);
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

/**
 * 날짜에 일수를 더한 날짜를 YYYY-MM-DD 형식으로 반환
 * @param dateStr YYYY-MM-DD 형식의 날짜 문자열
 * @param days 더할 일수
 * @returns YYYY-MM-DD 형식의 날짜 문자열
 */
export function addDays(dateStr: string, days: number): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() + days);
  return fmtYYYYMMDD(dt);
}
