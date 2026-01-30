export type RegisterFormValues = {
  email: string;
  password: string;
  checked_password: string;
  nickname: string;
};

export type SignUpForm = {
  email: string; //"user@example.com",
  password: string;
  checked_password: string;
  nickname: string;
  name: string | null;
  birth: string | null; //"2026-01-04",
  phone_num: string | null;
};

export type LoginForm = {
  email: string;
  password: string;
};

// Ingredient 관련 타입
export type StorageType = "FRIDGE" | "FREEZER" | "ROOM";

export type AddIngredientRequest = {
  purchase_date: string; // YYYY-MM-DD
  ingredients: string[]; // 식재료명 배열
};

export type AddIngredientResponse = {
  id: number;
  ingredient_name: string;
  purchase_date: string;
};

export type SetIngredientRequest = {
  expiration_date: string; // YYYY-MM-DD
  storage_type: StorageType;
};

export type UpdateIngredientRequest = {
  purchase_date?: string | null; // YYYY-MM-DD
  expiration_date?: string | null; // YYYY-MM-DD
  storage_type?: StorageType | null;
};

export type GetIngredientResponse = {
  id: number;
  ingredient_name: string;
  purchase_date: string;
  expiration_date: string | null;
  storage_type: StorageType | null;
};

// User 관련 타입
export type InfoResponse = {
  id: number;
  email: string;
  nickname: string;
  name: string | null;
  birth: string | null;
  phone_num: string | null;
};

// 쇼핑 관련 타입
export type ShoppingListResponse = {
  id: number;
  item_name: string;
}

export type ShoppingListRequest = {
  item_name: string;
}

// 레시피 추천 관련 타입
/** 보유 식재료 기반 메뉴 추천 (4가지) 응답 항목 */
export type RecipeRecommendationItem = {
  food: string;
  use_ingredients: string[];
  difficulty: number;
};

export type GetRecipeRecommendationsResponse = {
  recipes: RecipeRecommendationItem[];
};