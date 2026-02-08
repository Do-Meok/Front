import {
  CreateRecipeDetailsResponse,
  GetInstantRecommendationsResponse,
  GetRecipeRecommendationsResponse,
  RecipeRecommendationItem,
  SearchRecipesByNameResponse
} from "@/types";
import axiosInstance, { PREFIX } from "./axios";

/** 보유 식재료 기반 메뉴 추천 (4가지) */
async function getRecommendationsRecipes(): Promise<GetRecipeRecommendationsResponse> {
  const { data } = await axiosInstance.get<GetRecipeRecommendationsResponse>(
    `${PREFIX}/assistant/recommendations`
  );
  return data;
}

/** 선택한 메뉴 상세 조리법 생성 (단일 객체: food, use_ingredients, difficulty) */
async function createRecipeDetails(
  body: RecipeRecommendationItem
): Promise<CreateRecipeDetailsResponse> {
  const { data } = await axiosInstance.post<CreateRecipeDetailsResponse>(
    `${PREFIX}/assistant/detail`,
    body
  );

  return data;
}

/** 요리 이름으로 검색 **/
async function searchRecipesByName(name: string): Promise<SearchRecipesByNameResponse> {
  const { data } = await axiosInstance.post<SearchRecipesByNameResponse>(
    `${PREFIX}/assistant/search`,
    { food: name }
  );

  return data;
}

/** 대화형 재료 입력 기반 즉시 추천 **/
async function getInstantRecommendations(ingredients: string[]): Promise<GetInstantRecommendationsResponse> {
  const { data } = await axiosInstance.get<GetInstantRecommendationsResponse>(
    `${PREFIX}/assistant/quick`,
    { params: { ingredients } }
  );

  return data;
}

export { createRecipeDetails, getInstantRecommendations, getRecommendationsRecipes, searchRecipesByName };

