import { SaveRecipeRequest, SaveRecipeResponse } from "@/types";
import axiosInstance, { PREFIX } from "./axios";

/** 레시피 저장 */
async function saveRecipe(recipeBody: SaveRecipeRequest): Promise<SaveRecipeResponse> {
    const { data } = await axiosInstance.post<SaveRecipeResponse>(`${PREFIX}/recipes`, recipeBody);
  
    return data;
  }
  
  /** 레시피 목록 조회 */
  async function getRecipes(): Promise<SaveRecipeResponse[]> {
    const { data } = await axiosInstance.get<SaveRecipeResponse[]>(`${PREFIX}/recipes`);
    
    return data;
  }

  export { getRecipes, saveRecipe };
