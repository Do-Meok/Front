import { GetRecipeRecommendationsResponse } from "@/types";
import axiosInstance, { PREFIX } from "./axios";

/** 보유 식재료 기반 메뉴 추천 (4가지) */
async function getRecommendationsRecipes(): Promise<GetRecipeRecommendationsResponse> {
  const { data } = await axiosInstance.get<GetRecipeRecommendationsResponse>(
    `${PREFIX}/assistant/recommendations`
  );
  return data;
}

/** 선택한 메뉴 상세 조리법 생성 **/
async function createRecipeDetails(recipeBody: GetRecipeRecommendationsResponse): Promise<GetRecipeRecommendationsResponse> {
  const { data } = await axiosInstance.post<CreateRecipeDetailsResponse>(
    `${PREFIX}/assistant/assistant/detail`,
    recipeBody
  );

  return data;
}

export { getRecommendationsRecipes };

