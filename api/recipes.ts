import { GetRecipeRecommendationsResponse } from "@/types";
import axiosInstance, { PREFIX } from "./axios";

/** 보유 식재료 기반 메뉴 추천 (4가지) */
async function getRecommendationsRecipes(): Promise<GetRecipeRecommendationsResponse> {
  const { data } = await axiosInstance.get<GetRecipeRecommendationsResponse>(
    `${PREFIX}/assistant/recommendations`
  );
  return data;
}

export { getRecommendationsRecipes };

