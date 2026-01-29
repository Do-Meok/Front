import { ShoppingListRequest, ShoppingListResponse } from "@/types";
import axiosInstance, { PREFIX } from "./axios";

// 쇼핑 리스트 조회
async function getShoppingList(): Promise<ShoppingListResponse[]> {
    const { data } = await axiosInstance.get<ShoppingListResponse[]>(`${PREFIX}/shopping`)
    
    return data;
}

// 쇼핑 리스트 추가
async function addShoppingList(body:ShoppingListRequest): Promise<ShoppingListRequest> {
    const { data } = await axiosInstance.post<ShoppingListResponse>(
        `${PREFIX}/shopping`,
        body
    );

    return data;
}

// 쇼핑 리스트 삭제 (경로 파라미터: DELETE /shopping/{id})
async function deleteShoppingList(shoppingId: number): Promise<void> {
    await axiosInstance.delete(`${PREFIX}/shopping/${shoppingId}`);
}

export { addShoppingList, deleteShoppingList, getShoppingList };

