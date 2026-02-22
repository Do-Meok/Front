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

export type TokenRefreshResponse = {
  access_token: string;
  refresh_token: string;
};

export type FindEmailForm = {
  name: string;
  birth: string;
  phone_num: string;
};

export type FindPasswordForm = {
  current_password: string;
  new_password: string;
  checked_new_password: string;
};

export type ResetPasswordForm = {
  email: string;
  name: string;
  birth: string;
  phone_num: string;
  new_password: string;
  checked_new_password: string;
};

// 닉네임 변경
export type ChangeNicknameForm = {
  nickname: string;
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

export type UpdateUserInfoForm = {
  name?: string | null;
  birth?: string | null;
  phone_num?: string | null;
};

// Refresh 관련 타입

export type RefreshRequest = {
  accessToken?: string;
  access_token?: string;
  token?: string;
  refreshToken?: string;
  refresh_token?: string;
};

export type RefreshResponse = {
  access_token: string;
  refresh_token: string;
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

// 백엔드 응답 타입 (ingredient_name 사용)
export type BackendAddIngredientResponse = {
  id: number;
  ingredient_name: string;
  purchase_date: string;
};

export type BackendGetIngredientResponse = {
  id: number;
  ingredient_name: string;
  purchase_date: string;
  expiration_date: string | null;
  storage_type: StorageType | null;
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

export type RecipeDetailUseIngredient = {
  name: string;
  amount: string;
};

export type RecipeDetailResponse = {
  food: string;
  use_ingredients: RecipeDetailUseIngredient[];
  steps: string[];
  tip: string;
};

export type CreateRecipeDetailsResponse = RecipeDetailResponse;
export type SearchRecipesByNameResponse = RecipeDetailResponse;
export type GetInstantRecommendationsResponse = RecipeDetailResponse;

// 레시피 저장 관련 타입
export type SaveRecipeRequest = RecipeDetailResponse;
export type SaveRecipeResponse = RecipeDetailResponse & {
  id: number;
  created_at: string; // ISO 8601 형식 (예: "2019-08-24T14:15:22Z")
};

/** 냉장고 한 대 (시각화용: 가로/세로 칸) */
export type Fridge = {
  id: string;
  apiId?: number; // 백엔드 냉장고 ID
  name: string;
  cols: number; // 1~4
  rows: number; // 1~8
  /** 칸별 식재료: "row-col" -> 식재료 이름 배열 */
  cellIngredients?: Record<string, string[]>;
};

// 냉장고 칸 (Compartment)
export type Compartment = {
  id: number;
  name: string;
  order_index: number;
};

// 냉장고 조회 응답
export type RefrigeratorResponse = {
  id: number;
  name: string;
  pos_x: number;
  pos_y: number;
  compartments: Compartment[];
};

// 냉장고 칸 재료
export type CompartmentIngredient = {
  id: number;
  ingredient_name: string;
  purchase_date: string;
  expiration_date: string;
  storage_type: StorageType;
  is_auto_fillable: boolean;
};

// 자동 입력 응답
export type AutoFillIngredientResponse = {
  id: number;
  ingredient_name: string;
  purchase_date: string;
  expiration_date: string;
  storage_type: StorageType;
  is_auto_fillable: boolean;
};

// 냉장고 추가 요청
export type RefrigeratorAddRequest = {
  name: string;
  pos_x: number;
  pos_y: number;
};

// 냉장고 추가 응답
export type RefrigeratorAddResponse = {
  id: number;
  name: string;
  pos_x: number;
  pos_y: number;
};
