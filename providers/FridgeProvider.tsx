import type { Fridge } from "@/types/fridge";
import React, { createContext, useCallback, useContext, useState } from "react";

const defaultFridges: Fridge[] = [
  {
    id: "1",
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
};

const FridgeContext = createContext<FridgeContextType | undefined>(undefined);

export function FridgeProvider({ children }: { children: React.ReactNode }) {
  const [fridges, setFridges] = useState<Fridge[]>(defaultFridges);

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

  return (
    <FridgeContext.Provider value={{ fridges, addFridge, setFridges }}>
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
