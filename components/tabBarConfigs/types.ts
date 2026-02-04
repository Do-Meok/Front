import type { ReactNode } from "react";

export type TabBarItem = {
  key: string;
  label: string;
  focused: boolean;
  icon: (focused: boolean, color: string) => ReactNode;
  go: () => void;
};
