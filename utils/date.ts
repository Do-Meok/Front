/**
 * 사용자 입력(숫자만, "-", 띄워쓰기 혼합)을 YYYY-MM-DD 형식으로 정규화
 * 예: "20250129" -> "2025-01-29", "2025 01 29" -> "2025-01-29"
 */
export function formatInputToYYYYMMDD(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 8);
  if (digits.length === 0) return "";
  const y = digits.slice(0, 4);
  const m = digits.length >= 6 ? digits.slice(4, 6) : digits.slice(4);
  const d = digits.length >= 8 ? digits.slice(6, 8) : "";
  const parts = [y];
  if (m) parts.push(m);
  if (d) parts.push(d);
  return parts.join("-");
}

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
