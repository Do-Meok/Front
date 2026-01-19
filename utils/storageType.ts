import { StorageType, StorageTypeBackend } from "@/types";

/**
 * 한국어 보관장소 타입을 백엔드 Enum 형식으로 변환
 */
export function toBackendStorageType(
  storageType: StorageType
): StorageTypeBackend {
  const mapping: Record<StorageType, StorageTypeBackend> = {
    냉장: "FRIDGE",
    냉동: "FREEZER",
    실온: "ROOM",
  };
  return mapping[storageType];
}

/**
 * 백엔드 Enum 형식을 한국어 보관장소 타입으로 변환
 */
export function fromBackendStorageType(
  storageType: StorageTypeBackend | null | undefined
): StorageType | null {
  if (!storageType) return null;
  const mapping: Record<StorageTypeBackend, StorageType> = {
    FRIDGE: "냉장",
    FREEZER: "냉동",
    ROOM: "실온",
  };
  return mapping[storageType];
}
