import type { CompartmentIngredient, Fridge } from "@/types";
import React, { createContext, useCallback, useContext, useState } from "react";

const defaultFridges: Fridge[] = [
  {
    id: "1",
    apiId: 1,
    name: "메인 냉장고",
    cols: 3,
    rows: 3,
    cellIngredients: {},
  },
];

type FridgeContextType = {
  fridges: Fridge[];
  addFridge: (fridge: Omit<Fridge, "id">) => void;
  setFridges: React.Dispatch<React.SetStateAction<Fridge[]>>;
  localAssignments: Record<number, CompartmentIngredient[]>;
  addLocalAssignment: (compartmentId: number, item: CompartmentIngredient) => void;
};

const FridgeContext = createContext<FridgeContextType | undefined>(undefined);

export function FridgeProvider({ children }: { children: React.ReactNode }) {
  const [fridges, setFridges] = useState<Fridge[]>(defaultFridges);
  const [localAssignments, setLocalAssignments] = useState<
    Record<number, CompartmentIngredient[]>
  >({});

  const addFridge = useCallback((fridge: Omit<Fridge, "id">) => {
    setFridges((prev) => [
      {
        ...fridge,
        id: String(Date.now()),
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
      value={{ fridges, addFridge, setFridges, localAssignments, addLocalAssignment }}
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
