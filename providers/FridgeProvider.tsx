import AsyncStorage from "@react-native-async-storage/async-storage";
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
  localAssignments: Record<number, CompartmentIngredient[]>;
  addLocalAssignment: (compartmentId: number, item: CompartmentIngredient) => void;
};

const FridgeContext = createContext<FridgeContextType | undefined>(undefined);

export function FridgeProvider({ children }: { children: React.ReactNode }) {
  const [fridges, setFridges] = useState<Fridge[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [localAssignments, setLocalAssignments] = useState<
    Record<number, CompartmentIngredient[]>
  >({});

  // 앱 시작 시 AsyncStorage에서 냉장고 목록 + 칸 배정 복원
  useEffect(() => {
    Promise.all([
      AsyncStorage.getItem(STORAGE_KEY),
      AsyncStorage.getItem(ASSIGNMENTS_STORAGE_KEY),
    ])
      .then(([rawFridges, rawAssignments]) => {
        if (rawFridges) {
          try {
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
          } catch {}
        }
        if (rawAssignments) {
          try {
            const saved = JSON.parse(rawAssignments);
            setLocalAssignments(saved);
          } catch {}
        }
      })
      .finally(() => setIsLoaded(true));
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

  const addLocalAssignment = useCallback(
    (compartmentId: number, item: CompartmentIngredient) => {
      setLocalAssignments((prev) => ({
        ...prev,
        [compartmentId]: [...(prev[compartmentId] ?? []), item],
      }));
    },
    []
  );

  return (
    <FridgeContext.Provider
      value={{
        fridges,
        isLoaded,
        addFridge,
        setFridges,
        localAssignments,
        addLocalAssignment,
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
