import type {
    CompartmentIngredient,
    RefrigeratorAddRequest,
    RefrigeratorAddResponse,
    RefrigeratorResponse,
} from "@/types";
import axiosInstance, { PREFIX } from "./axios";

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

// 냉장고 칸 재료 조회
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

export { addRefrigerator, assignIngredientToCompartment, getCompartmentIngredients, getRefrigerator };

