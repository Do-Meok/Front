/**
 * API 공통 설정값 (순환 참조 방지를 위해 별도 파일로 분리)
 * 서버 주소는 .env 의 EXPO_PUBLIC_API_URL 로 주입 (.env.example 참고)
 */
const apiUrl = process.env.EXPO_PUBLIC_API_URL;
if (!apiUrl) throw new Error("EXPO_PUBLIC_API_URL 이 설정되지 않았습니다. .env 파일을 확인하세요.");

export const API_URL = apiUrl.replace(/\/+$/, "");

export const PREFIX = "/api/v1";
