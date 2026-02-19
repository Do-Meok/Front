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
  setHasToken: (value: boolean) => void;
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
  const [hasToken, setHasTokenState] = useState<boolean | null>(null);
  const setHasToken = useCallback((value: boolean) => {
    setHasTokenState(value);
  }, []);
  const [isReady, setIsReady] = useState(false);
  const router = useRouter();
  const segments = useSegments();

  // 온보딩 완료 여부 및 로그인 상태 확인 함수
  const checkAuthState = useCallback(async () => {
    try {
      const completed = await AsyncStorage.getItem("onboarding_completed");
      const token = await getSecureStore("accessToken");
      setIsOnboardingCompleted(completed === "true");
      setHasTokenState(!!token);
      setIsReady(true);
    } catch (error) {
      console.error("인증 상태 확인 실패:", error);
      setIsOnboardingCompleted(false);
      setHasTokenState(false);
      setIsReady(true);
    }
  }, []);

  useEffect(() => {
    // 앱 시작 시 인증 상태 확인
    checkAuthState();
  }, [checkAuthState]);

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
        router.replace("/auth");
      } else if (inTabs) {
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
      const inAuthLoading = segments[1] === "loading";
      // 로그인 상태에서도 접근 가능한 auth 화면 (마이페이지에서 진입)
      const isAuthenticatedAuthScreen =
        segments[1] === "change-password" || segments[1] === "change-nickname";
      if ((inOnboarding || inAuth) && !inAuthLoading && !isAuthenticatedAuthScreen) {
        // 온보딩/auth(로딩·설정 화면 제외)에 있으면 tabs(홈)로 이동
        router.replace("/(tabs)");
      }
      // 초기 라우트면 홈에 그대로 있음 (리다이렉트 없음)
      return;
    }

    // 4. 로그아웃 로딩 중에는 리다이렉트하지 않음
    const inLogoutLoading = inAuth && segments[1] === "logout-loading";
    if (inLogoutLoading) {
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
        setHasToken,
      }}
    >
      {children}
    </NavigationContext.Provider>
  );
}
