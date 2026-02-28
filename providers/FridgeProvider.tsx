import AsyncStorage from "@react-native-async-storage/async-storage";
import { getRefrigerators } from "@/api/refrigerator";
import type { CompartmentIngredient, Fridge } from "@/types";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

const STORAGE_KEY = "fridge_list_v1";
const ASSIGNMENTS_STORAGE_KEY = "fridge_assignments_v1";

type PersistedFridge = {
  apiId: number;
  name: string;
  cols: number;
  rows: number;
};

type FridgeContextType = {
  fridges: Fridge[];
  isLoaded: boolean;
  addFridge: (fridge: Omit<Fridge, "id">) => void;
  setFridges: React.Dispatch<React.SetStateAction<Fridge[]>>;
  removeFridge: (apiId: number) => void;
  refreshFridges: () => Promise<void>;
  localAssignments: Record<number, CompartmentIngredient[]>;
  addLocalAssignment: (compartmentId: number, item: CompartmentIngredient) => void;
  removeLocalIngredient: (ingredientId: number) => void;
};

const FridgeContext = createContext<FridgeContextType | undefined>(undefined);

export function FridgeProvider({ children }: { children: React.ReactNode }) {
  const [fridges, setFridges] = useState<Fridge[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [localAssignments, setLocalAssignments] = useState<
    Record<number, CompartmentIngredient[]>
  >({});

  // 앱 시작 시 냉장고 목록 복원: AsyncStorage 캐시 우선 → 서버 동기화
  useEffect(() => {
    let isMounted = true;

    async function init() {
      // 1. AsyncStorage 캐시로 빠르게 초기 렌더
      try {
        const [rawFridges, rawAssignments] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEY),
          AsyncStorage.getItem(ASSIGNMENTS_STORAGE_KEY),
        ]);
        if (!isMounted) return;
        if (rawFridges) {
          const saved: PersistedFridge[] = JSON.parse(rawFridges);
          setFridges(
            saved.map((f) => ({
              id: String(f.apiId),
              apiId: f.apiId,
              name: f.name,
              cols: f.cols,
              rows: f.rows,
              cellIngredients: {},
            }))
          );
        }
        if (rawAssignments) {
          setLocalAssignments(JSON.parse(rawAssignments));
        }
      } catch {}

      if (!isMounted) return;
      setIsLoaded(true);

      // 2. 서버에서 최신 냉장고 목록 동기화 (다른 기기와 상태 일치)
      try {
        const serverFridges = await getRefrigerators();
        if (!isMounted) return;
        // 전체 교체 대신 병합: 서버에 없는 로컬 냉장고(race condition)도 유지
        const serverApiIds = new Set(serverFridges.map((f) => f.id));
        setFridges((prev) => {
          const serverMapped = serverFridges.map((f) => ({
            id: String(f.id),
            apiId: f.id,
            name: f.name,
            cols: f.pos_x,
            rows: f.pos_y,
            cellIngredients: {},
          }));
          const localOnly = prev.filter(
            (f) => f.apiId !== undefined && !serverApiIds.has(f.apiId)
          );
          return [...serverMapped, ...localOnly];
        });
      } catch {
        // 서버 동기화 실패 시 AsyncStorage 캐시 유지
      }
    }

    init();
    return () => {
      isMounted = false;
    };
  }, []);

  // fridges 변경 시 AsyncStorage에 저장 (초기 로드 완료 후에만)
  useEffect(() => {
    if (!isLoaded) return;
    const toSave: PersistedFridge[] = fridges
      .filter((f) => f.apiId !== undefined)
      .map((f) => ({
        apiId: f.apiId!,
        name: f.name,
        cols: f.cols,
        rows: f.rows,
      }));
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  }, [fridges, isLoaded]);

  // localAssignments 변경 시 AsyncStorage에 저장 (초기 로드 완료 후에만)
  useEffect(() => {
    if (!isLoaded) return;
    AsyncStorage.setItem(ASSIGNMENTS_STORAGE_KEY, JSON.stringify(localAssignments));
  }, [localAssignments, isLoaded]);

  const addFridge = useCallback((fridge: Omit<Fridge, "id">) => {
    setFridges((prev) => [
      {
        ...fridge,
        id: String(fridge.apiId ?? Date.now()),
        cellIngredients: fridge.cellIngredients ?? {},
      },
      ...prev,
    ]);
  }, []);

  const removeFridge = useCallback((apiId: number) => {
    setFridges((prev) => prev.filter((f) => f.apiId !== apiId));
  }, []);

  // 탭 포커스 시 명시적 호출용 — 서버 최신 목록으로 전체 교체 (다기기 삭제 반영)
  const refreshFridges = useCallback(async () => {
    try {
      const serverFridges = await getRefrigerators();
      setFridges(
        serverFridges.map((f) => ({
          id: String(f.id),
          apiId: f.id,
          name: f.name,
          cols: f.pos_x,
          rows: f.pos_y,
          cellIngredients: {},
        }))
      );
    } catch {
      // 실패 시 기존 상태 유지
    }
  }, []);

  const addLocalAssignment = useCallback(
    (compartmentId: number, item: CompartmentIngredient) => {
      setLocalAssignments((prev) => ({
        ...prev,
        [compartmentId]: [...(prev[compartmentId] ?? []), item],
      }));
    },
    []
  );

  const removeLocalIngredient = useCallback((ingredientId: number) => {
    setLocalAssignments((prev) => {
      const next: Record<number, CompartmentIngredient[]> = {};
      for (const key in prev) {
        const filtered = prev[key].filter((i) => i.id !== ingredientId);
        if (filtered.length > 0) {
          next[key] = filtered;
        }
      }
      return next;
    });
  }, []);

  return (
    <FridgeContext.Provider
      value={{
        fridges,
        isLoaded,
        addFridge,
        setFridges,
        removeFridge,
        refreshFridges,
        localAssignments,
        addLocalAssignment,
        removeLocalIngredient,
      }}
    >
      {children}
    </FridgeContext.Provider>
  );
}

export function useFridgeContext() {
  const ctx = useContext(FridgeContext);
  if (ctx === undefined)
    throw new Error("useFridgeContext must be used within FridgeProvider");
  return ctx;
}
