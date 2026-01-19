import {
  AddIngredientRequest,
  AddIngredientResponse,
  GetIngredientResponse,
  SetIngredientRequest,
  StorageType,
  UpdateIngredientRequest,
} from "@/types";
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
  storage_type: StorageType | null;
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
  const { data } = await axiosInstance.patch<BackendGetIngredientResponse>(
    `${PREFIX}/ingredients/${ingredientId}`,
    body
  );
  return data;
}

// 식재료 조회
async function getIngredients(params?: {
  is_unclassified?: boolean;
  storage?: StorageType;
}): Promise<GetIngredientResponse[]> {
  const { data } = await axiosInstance.get<BackendGetIngredientResponse[]>(
    `${PREFIX}/ingredients`,
    { params }
  );
  return data;
}

// 식재료 단일 조회
async function getIngredient(
  ingredientId: number
): Promise<GetIngredientResponse> {
  const { data } = await axiosInstance.get<BackendGetIngredientResponse>(
    `${PREFIX}/ingredients/detail`,
    { params: { ingredient_id: ingredientId } }
  );
  return data;
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
  const { data } = await axiosInstance.patch<BackendGetIngredientResponse>(
    `${PREFIX}/ingredients/update/${ingredientId}`,
    body
  );
  return data;
}

export {
  addIngredient, deleteIngredient, getIngredient, getIngredients, setIngredientDetails, updateIngredient
};

