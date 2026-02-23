import {
  AddIngredientRequest,
  AddIngredientResponse,
  AutoFillIngredientResponse,
  BackendAddIngredientResponse,
  BackendGetIngredientResponse,
  GetIngredientResponse,
  SetIngredientRequest,
  StorageType,
  UpdateIngredientRequest,
} from "@/types";
import axiosInstance, { PREFIX } from "./axios";


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

// 식재료 삭제
async function deleteIngredient(ingredientId: number): Promise<void> {
  await axiosInstance.delete(`${PREFIX}/ingredients`, {
    params: { ingredient_id: ingredientId },
  });
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


// 식재료 유통기한/보관방법 자동 입력
async function autoFillIngredient(
  ingredientId: number
): Promise<AutoFillIngredientResponse> {
  const { data } = await axiosInstance.patch<AutoFillIngredientResponse>(
    `${PREFIX}/ingredients/${ingredientId}/auto`
  );
  return data;
}

export {
  addIngredient, autoFillIngredient, deleteIngredient, getIngredient, getIngredients, setIngredientDetails, updateIngredient
};

