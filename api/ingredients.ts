import {
  AddIngredientRequest,
  AddIngredientResponse,
  GetIngredientResponse,
  SetIngredientRequest,
  StorageType,
  StorageTypeBackend,
  UpdateIngredientRequest,
} from "@/types";
import { fromBackendStorageType, toBackendStorageType } from "@/utils/storageType";
import axiosInstance, { PREFIX } from "./axios";

// 백엔드 응답 타입 (ingredient_name 사용)
type BackendAddIngredientResponse = {
  id: number;
  ingredient_name: string;
  purchase_date: string;
};

type BackendGetIngredientResponse = {
  id: number;
  ingredient_name: string;
  purchase_date: string;
  expiration_date: string | null;
  storage_type: StorageTypeBackend | null;
};

// 식재료 추가
async function addIngredient(
  body: AddIngredientRequest
): Promise<AddIngredientResponse[]> {
  const { data } = await axiosInstance.post<BackendAddIngredientResponse[]>(
    `${PREFIX}/ingredients`,
    body
  );
  return data;
}

// 식재료 유통기한 및 보관장소 설정
async function setIngredientDetails(
  ingredientId: number,
  body: SetIngredientRequest
): Promise<GetIngredientResponse> {
  const backendBody = {
    expiration_date: body.expiration_date,
    storage_type: body.storage_type, // 이미 StorageTypeBackend 형식
  };
  const { data } = await axiosInstance.patch<BackendGetIngredientResponse>(
    `${PREFIX}/ingredients/${ingredientId}`,
    backendBody
  );
  return {
    ...data,
    storage_type: fromBackendStorageType(data.storage_type),
  };
}

// 식재료 조회
async function getIngredients(params?: {
  is_unclassified?: boolean;
  storage?: StorageType;
}): Promise<GetIngredientResponse[]> {
  const backendParams = params?.storage
    ? { ...params, storage: toBackendStorageType(params.storage) }
    : params;
  const { data } = await axiosInstance.get<BackendGetIngredientResponse[]>(
    `${PREFIX}/ingredients`,
    { params: backendParams }
  );
  return data.map((item) => ({
    ...item,
    storage_type: fromBackendStorageType(item.storage_type),
  }));
}

// 식재료 단일 조회
async function getIngredient(
  ingredientId: number
): Promise<GetIngredientResponse> {
  const { data } = await axiosInstance.get<BackendGetIngredientResponse>(
    `${PREFIX}/ingredients/detail`,
    { params: { ingredient_id: ingredientId } }
  );
  return {
    ...data,
    storage_type: fromBackendStorageType(data.storage_type),
  };
}

// 식재료 삭제
async function deleteIngredient(ingredientId: number): Promise<void> {
  await axiosInstance.delete(`${PREFIX}/ingredients`, {
    params: { ingredient_id: ingredientId },
  });
}

// 식재료 수정
async function updateIngredient(
  ingredientId: number,
  body: UpdateIngredientRequest
): Promise<GetIngredientResponse> {
  const backendBody = {
    purchase_date: body.purchase_date,
    expiration_date: body.expiration_date,
    storage_type: body.storage_type
      ? toBackendStorageType(body.storage_type)
      : null,
  };
  const { data } = await axiosInstance.patch<BackendGetIngredientResponse>(
    `${PREFIX}/ingredients/update/${ingredientId}`,
    backendBody
  );
  return {
    ...data,
    storage_type: fromBackendStorageType(data.storage_type),
  };
}

export {
  addIngredient, deleteIngredient, getIngredient, getIngredients, setIngredientDetails, updateIngredient
};

