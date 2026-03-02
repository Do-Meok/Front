import { refreshAccessToken } from "@/api/authRefresh";
import axiosInstance, { setAuthFailureCallback } from "@/api/axios";
import { consumeGuestChosen } from "@/utils/guestMode";
import { getSecureStore } from "@/utils/secureStore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SplashScreen from "expo-splash-screen";
import { useRouter, useSegments } from "expo-router";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

interface NavigationContextType {
  hasToken: boolean | null;
  isReady: boolean;
  checkAuthState: () => Promise<void>;
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
  const [hasToken, setHasTokenState] = useState<boolean | null>(null);
  const setHasToken = useCallback((value: boolean) => {
    setHasTokenState(value);
  }, []);
  const [isReady, setIsReady] = useState(false);
  const router = useRouter();
  const segments = useSegments();

  // 로그인 상태 확인 함수
  const checkAuthState = useCallback(async () => {
    try {
      let token = await getSecureStore("accessToken");

      // 액세스 토큰이 없으면 리프레시 토큰으로 재발급 시도 (자동 로그인)
      if (!token) {
        const newToken = await refreshAccessToken();
        if (newToken) {
          token = newToken;
          // 재발급된 토큰을 axios 기본 헤더에 즉시 반영
          axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
        }
      }

      setHasTokenState(!!token);
    } catch (error) {
      console.error("인증 상태 확인 실패:", error);
      setHasTokenState(false);
    } finally {
      setIsReady(true);
      // 인증 확인 완료 후 스플래시 스크린 해제
      SplashScreen.hideAsync();
    }
  }, []);

  useEffect(() => {
    // 앱 시작 시 인증 상태 확인
    checkAuthState();
  }, [checkAuthState]);

  // axios 인터셉터가 강제 로그아웃할 때 NavigationProvider 상태를 동기화
  useEffect(() => {
    setAuthFailureCallback(() => {
      setHasTokenState(false);
    });
  }, []);

  // 네비게이션 가드
  useEffect(() => {
    if (!isReady || hasToken === null) {
      return; // 아직 확인 중
    }

    const currentSegment = segments[0];
    const inAuth = currentSegment === "auth";
    const inTabs = currentSegment === "(tabs)";

    // 1. 로그인되지 않은 경우
    if (!hasToken) {
      if (inTabs) {
        if (consumeGuestChosen()) return;
        AsyncStorage.getItem("is_guest").then((value) => {
          if (value !== "true") {
            router.replace("/auth");
          }
        });
      }
      return;
    }

    // 2. 로그인 완료
    if (hasToken) {
      const inAuthLoading = segments[1] === "loading";
      const inLogoutLoading = segments[1] === "logout-loading";
      // 로그인 상태에서도 접근 가능한 auth 화면 (마이페이지에서 진입, 로그아웃 중)
      const isAuthenticatedAuthScreen =
        segments[1] === "change-password" ||
        segments[1] === "change-nickname" ||
        segments[1] === "fill-user-info";
      if (inAuth && !inAuthLoading && !inLogoutLoading && !isAuthenticatedAuthScreen) {
        // auth(로딩·로그아웃·설정 화면 제외)에 있으면 tabs(홈)으로 이동
        router.replace("/(tabs)");
      }
      return;
    }
  }, [isReady, hasToken, segments, router]);

  return (
    <NavigationContext.Provider
      value={{
        hasToken,
        isReady,
        checkAuthState,
        setHasToken,
      }}
    >
      {children}
    </NavigationContext.Provider>
  );
}
