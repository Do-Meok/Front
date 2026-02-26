import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from "react";
import { View } from "react-native";

export type HoleConfig = {
  x: number;
  y: number;
  width: number;
  height: number;
  borderRadius?: number;
};

export type TutorialStep = {
  /** 하이라이트할 요소의 ID (없으면 전체 화면 설명) */
  targetId?: string;
  description: string;
};

type TutorialContextType = {
  isActive: boolean;
  currentStep: TutorialStep | null;
  holeConfig: HoleConfig | null;
  totalSteps: number;
  currentStepIndex: number;
  startTutorialIfNeeded: (tabName: string, steps: TutorialStep[]) => void;
  nextStep: () => void;
  skipTutorial: () => void;
  registerTarget: (id: string, ref: React.RefObject<View | null>) => void;
  unregisterTarget: (id: string) => void;
};

const TutorialContext = createContext<TutorialContextType | undefined>(
  undefined
);

export function useTutorial() {
  const ctx = useContext(TutorialContext);
  if (!ctx) throw new Error("useTutorial must be inside TutorialProvider");
  return ctx;
}

export function TutorialProvider({ children }: { children: React.ReactNode }) {
  const [isActive, setIsActive] = useState(false);
  const [steps, setSteps] = useState<TutorialStep[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [holeConfig, setHoleConfig] = useState<HoleConfig | null>(null);
  const [activeTutorial, setActiveTutorial] = useState<string | null>(null);

  // ref들을 저장하는 Map
  const targets = useRef<Map<string, React.RefObject<View | null>>>(new Map());
  // 현재 steps를 ref로도 유지 (async 콜백에서 최신 값 접근)
  const stepsRef = useRef<TutorialStep[]>([]);

  const registerTarget = useCallback(
    (id: string, ref: React.RefObject<View | null>) => {
      targets.current.set(id, ref);
    },
    []
  );

  const unregisterTarget = useCallback((id: string) => {
    targets.current.delete(id);
  }, []);

  const measureTarget = useCallback(
    (targetId: string): Promise<HoleConfig | null> => {
      return new Promise((resolve) => {
        const ref = targets.current.get(targetId);
        if (!ref?.current) {
          resolve(null);
          return;
        }
        ref.current.measureInWindow((x, y, width, height) => {
          if (width === 0 && height === 0) {
            resolve(null);
          } else {
            resolve({ x, y, width, height, borderRadius: 12 });
          }
        });
      });
    },
    []
  );

  const applyStep = useCallback(
    async (stepIndex: number, currentSteps: TutorialStep[]) => {
      if (stepIndex >= currentSteps.length) return;
      const step = currentSteps[stepIndex];
      if (step.targetId) {
        const config = await measureTarget(step.targetId);
        setHoleConfig(config);
      } else {
        setHoleConfig(null);
      }
    },
    [measureTarget]
  );

  const startTutorialIfNeeded = useCallback(
    async (tabName: string, newSteps: TutorialStep[]) => {
      const key = `tutorial_${tabName}_done`;
      const done = await AsyncStorage.getItem(key);
      if (done === "true") return;

      stepsRef.current = newSteps;
      setSteps(newSteps);
      setCurrentStepIndex(0);
      setActiveTutorial(tabName);
      setIsActive(true);

      // 레이아웃 완료 후 측정
      setTimeout(async () => {
        await applyStep(0, newSteps);
      }, 400);
    },
    [applyStep]
  );

  const nextStep = useCallback(async () => {
    const nextIndex = currentStepIndex + 1;
    const currentSteps = stepsRef.current;

    if (nextIndex >= currentSteps.length) {
      if (activeTutorial) {
        await AsyncStorage.setItem(`tutorial_${activeTutorial}_done`, "true");
      }
      setIsActive(false);
      setHoleConfig(null);
      setActiveTutorial(null);
      return;
    }

    setCurrentStepIndex(nextIndex);
    await applyStep(nextIndex, currentSteps);
  }, [currentStepIndex, activeTutorial, applyStep]);

  const skipTutorial = useCallback(async () => {
    if (activeTutorial) {
      await AsyncStorage.setItem(`tutorial_${activeTutorial}_done`, "true");
    }
    setIsActive(false);
    setHoleConfig(null);
    setActiveTutorial(null);
  }, [activeTutorial]);

  const currentStep =
    isActive && steps.length > 0 ? steps[currentStepIndex] : null;

  return (
    <TutorialContext.Provider
      value={{
        isActive,
        currentStep,
        holeConfig,
        totalSteps: steps.length,
        currentStepIndex,
        startTutorialIfNeeded,
        nextStep,
        skipTutorial,
        registerTarget,
        unregisterTarget,
      }}
    >
      {children}
    </TutorialContext.Provider>
  );
}
