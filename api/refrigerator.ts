import type {
  CompartmentIngredient,
  RefrigeratorAddRequest,
  RefrigeratorAddResponse,
  RefrigeratorListItem,
  RefrigeratorResponse,
} from "@/types";
import axiosInstance, { PREFIX } from "./axios";

// 냉장고 전체 조회 (compartments 포함)
async function getRefrigerators(): Promise<RefrigeratorListItem[]> {
  const { data } = await axiosInstance.get<RefrigeratorListItem[]>(
    `${PREFIX}/refrigerator`,
  );
  return data;
}

// 냉장고 추가
async function addRefrigerator(
  body: RefrigeratorAddRequest,
): Promise<RefrigeratorAddResponse> {
  const { data } = await axiosInstance.post<RefrigeratorAddResponse>(
    `${PREFIX}/refrigerator`,
    body,
  );
  return data;
}

// 냉장고 조회
async function getRefrigerator(
  refrigeratorId: number,
): Promise<RefrigeratorResponse> {
  const { data } = await axiosInstance.get<RefrigeratorResponse>(
    `${PREFIX}/refrigerator/${refrigeratorId}`,
  );
  return data;
}

// 냉장고 칸 속 재료 조회
async function getCompartmentIngredients(
  compartmentId: number,
): Promise<CompartmentIngredient[]> {
  const { data } = await axiosInstance.get<CompartmentIngredient[]>(
    `${PREFIX}/refrigerator/${compartmentId}/ingredients`,
  );
  return data;
}

// 냉장고 칸에 재료 배정
async function assignIngredientToCompartment(
  compartmentId: number,
  ingredientId: number,
): Promise<void> {
  await axiosInstance.post(
    `${PREFIX}/refrigerator/${compartmentId}/ingredients`,
    { ingredient_id: ingredientId },
  );
}

// 냉장고 삭제
async function deleteRefrigerator(refrigeratorId: number): Promise<void> {
  await axiosInstance.delete(`${PREFIX}/refrigerator/${refrigeratorId}`);
}

export {
  addRefrigerator,
  assignIngredientToCompartment,
  deleteRefrigerator,
  getCompartmentIngredients,
  getRefrigerator,
  getRefrigerators
};

