/** 냉장고 한 대 (시각화용: 가로/세로 칸) */
export type Fridge = {
  id: string;
  name: string;
  cols: number; // 1~4
  rows: number; // 1~3
  /** 칸별 식재료: "row-col" -> 식재료 이름 배열 */
  cellIngredients?: Record<string, string[]>;
};
