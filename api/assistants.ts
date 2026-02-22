import {
  CreateRecipeDetailsResponse,
  ExtractReceiptResponse,
  GetInstantRecommendationsResponse,
  GetRecipeRecommendationsResponse,
  RecipeRecommendationItem,
  SearchRecipesByNameResponse,
} from "@/types";
import { getSecureStore } from "@/utils/secureStore";
import axiosInstance, { PREFIX } from "./axios";
import { API_URL } from "./config";

/** 보유 식재료 기반 메뉴 추천 (4가지) */
async function getRecommendationsRecipes(): Promise<GetRecipeRecommendationsResponse> {
  const { data } = await axiosInstance.get<GetRecipeRecommendationsResponse>(
    `${PREFIX}/assistant/recommendations`,
  );
  return data;
}

/** 선택한 메뉴 상세 조리법 생성 (단일 객체: food, use_ingredients, difficulty) */
async function createRecipeDetails(
  body: RecipeRecommendationItem,
): Promise<CreateRecipeDetailsResponse> {
  const { data } = await axiosInstance.post<CreateRecipeDetailsResponse>(
    `${PREFIX}/assistant/detail`,
    body,
  );

  return data;
}

/** 요리 이름으로 검색 **/
async function searchRecipesByName(
  name: string,
): Promise<SearchRecipesByNameResponse> {
  const { data } = await axiosInstance.post<SearchRecipesByNameResponse>(
    `${PREFIX}/assistant/search`,
    { food: name },
  );

  return data;
}

/** 대화형 재료 입력 기반 즉시 추천 **/
async function getInstantRecommendations(
  ingredients: string[],
): Promise<GetInstantRecommendationsResponse> {
  const { data } = await axiosInstance.get<GetInstantRecommendationsResponse>(
    `${PREFIX}/assistant/quick`,
    { params: { ingredients } },
  );

  return data;
}

/** 영수증 이미지로 식재료 추출
 *  axios 대신 native fetch 사용 - React Native 새 아키텍처에서
 *  axios + FormData 파일 전송이 서버에 도달하지 않는 문제 해결
 */
async function extractReceipt(imageUri: string): Promise<ExtractReceiptResponse> {
  const token = await getSecureStore("accessToken");

  const formData = new FormData();
  formData.append("file", {
    uri: imageUri,
    name: "receipt.jpg",
    type: "image/jpeg",
  } as any);

  const response = await fetch(
    `${API_URL}${PREFIX}/assistant/receipt/extract`,
    {
      method: "POST",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        // Content-Type 미설정 → fetch가 boundary 포함해 자동 설정
      },
      body: formData,
    },
  );

  if (!response.ok) {
    throw new Error(`서버 오류: ${response.status}`);
  }

  return response.json() as Promise<ExtractReceiptResponse>;
}

export {
  createRecipeDetails, extractReceipt, getInstantRecommendations,
  getRecommendationsRecipes,
  searchRecipesByName
};

