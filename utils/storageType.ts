import { StorageType } from "@/types";

/**
 * StorageType을 한국어로 변환 (UI 표시용)
 */
export function toKoreanStorageType(
  storageType: StorageType | null | undefined
): string {
  if (!storageType) return "미설정";
  const mapping: Record<StorageType, string> = {
    FRIDGE: "냉장",
    FREEZER: "냉동",
    ROOM: "실온",
  };
  return mapping[storageType];
}

/**
 * 한국어를 StorageType으로 변환
 */
export function fromKoreanStorageType(
  korean: string
): StorageType | null {
  const mapping: Record<string, StorageType> = {
    냉장: "FRIDGE",
    냉동: "FREEZER",
    실온: "ROOM",
  };
  return mapping[korean] || null;
}
