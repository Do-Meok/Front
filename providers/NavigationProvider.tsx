import { consumeGuestChosen } from "@/utils/guestMode";
import { getSecureStore } from "@/utils/secureStore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter, useSegments } from "expo-router";
import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState,
} from "react";

interface NavigationContextType {
  isOnboardingCompleted: boolean | null;
  hasToken: boolean | null;
  isReady: boolean;
  checkAuthState: () => Promise<void>;
  setOnboardingCompleted: (completed: boolean) => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(
  undefined
);

export function useNavigationContext() {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error(
      "useNavigationContext must be used within NavigationProvider"
    );
  }
  return context;
}

export function NavigationProvider({ children }: { children: React.ReactNode }) {
  const [isOnboardingCompleted, setIsOnboardingCompleted] = useState<
    boolean | null
  >(null);
  const [hasToken, setHasToken] = useState<boolean | null>(null);
  const [isReady, setIsReady] = useState(false);
  const router = useRouter();
  const segments = useSegments();

  // 온보딩 완료 여부 및 로그인 상태 확인 함수
  const checkAuthState = useCallback(async () => {
    try {
      const completed = await AsyncStorage.getItem("onboarding_completed");
      const token = await getSecureStore("accessToken");
      setIsOnboardingCompleted(completed === "true");
      setHasToken(!!token);
      setIsReady(true);
    } catch (error) {
      console.error("인증 상태 확인 실패:", error);
      setIsOnboardingCompleted(false);
      setHasToken(false);
      setIsReady(true);
    }
  }, []);

  useEffect(() => {
    // 앱 시작 시 인증 상태 확인
    checkAuthState();
  }, [checkAuthState]);

  // segments가 변경될 때마다 인증 상태 재확인
  useEffect(() => {
    if (segments[0] === "auth" || segments[0] === "(tabs)") {
      checkAuthState();
    }
  }, [segments, checkAuthState]);

  // 초기 라우팅 및 네비게이션 가드
  useEffect(() => {
    if (!isReady || isOnboardingCompleted === null || hasToken === null) {
      return; // 아직 확인 중
    }

    const currentSegment = segments[0];
    const inOnboarding = currentSegment === "(onboarding)";
    const inAuth = currentSegment === "auth";
    const inTabs = currentSegment === "(tabs)";

    // 1. 온보딩이 완료되지 않은 경우 - 온보딩으로 리다이렉트
    if (!isOnboardingCompleted) {
      if (!inOnboarding) {
        // 온보딩 화면이 아니면 온보딩으로 이동
        router.replace("/(onboarding)");
      }
      return;
    }

    // 2. 온보딩은 완료되었지만 로그인되지 않은 경우
    if (!hasToken) {
      if (inOnboarding) {
        // 온보딩 화면에 있으면 auth로 이동
        router.replace("/auth");
      } else if (inTabs) {
        // "로그인 없이 시작" 직후 동기 플래그 확인 → 있으면 리다이렉트 안 함
        if (consumeGuestChosen()) return;
        AsyncStorage.getItem("is_guest").then((value) => {
          if (value !== "true") {
            router.replace("/auth");
          }
        });
      }
      return;
    }

    // 3. 온보딩 완료 + 로그인 완료
    if (hasToken) {
      if (inOnboarding || inAuth) {
        // 온보딩이나 auth 화면에 있으면 tabs(홈)로 이동
        router.replace("/(tabs)");
      }
      // 초기 라우트면 홈에 그대로 있음 (리다이렉트 없음)
      return;
    }
  }, [isReady, isOnboardingCompleted, hasToken, segments, router]);

  // 온보딩 완료 상태를 즉시 업데이트하는 함수
  const setOnboardingCompleted = useCallback((completed: boolean) => {
    setIsOnboardingCompleted(completed);
    // 상태 업데이트 후 즉시 라우팅 로직이 실행되도록 함
  }, []);

  return (
    <NavigationContext.Provider
      value={{
        isOnboardingCompleted,
        hasToken,
        isReady,
        checkAuthState,
        setOnboardingCompleted,
      }}
    >
      {children}
    </NavigationContext.Provider>
  );
}
