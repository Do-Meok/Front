<p align="center">
  <img src="./assets/images/Domeok.png" width="120" alt="두고먹고 로고" />
</p>

<h1 align="center">두고먹고 (DoMeok) — Frontend</h1>

<p align="center">
  냉장고 속 재료를 기록하고, 유통기한을 챙기고, 있는 재료로 AI 레시피를 추천받는 모바일 앱
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Expo-54-000020?logo=expo" />
  <img src="https://img.shields.io/badge/React%20Native-0.81-61DAFB?logo=react" />
  <img src="https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript" />
  <img src="https://img.shields.io/badge/TanStack%20Query-5-FF4154?logo=reactquery" />
</p>

---

## 주요 기능

| 기능 | 설명 |
| --- | --- |
| 🧊 **냉장고 관리** | 냉장고를 여러 개 추가하고, 칸(냉장/냉동/실온)별로 식재료를 배치 |
| 🥕 **식재료 등록** | 직접 입력 또는 **영수증 촬영/업로드**로 재료 자동 추출 (자동완성 지원) |
| ⏰ **유통기한 알림** | 홈 화면에서 유통기한 임박 재료를 캐러셀로 표시 |
| 🍳 **AI 레시피 추천** | 보유 재료 기반 추천, 빠른 추천, 요리명 검색, 상세 레시피 생성 |
| 📒 **요리 기록** | 레시피 저장·완료 기록·삭제 |
| 🛒 **장보기 목록** | 필요한 재료를 장보기 목록에 추가/삭제 |
| 👤 **회원** | 이메일 회원가입·로그인, **카카오 로그인**, 이메일/비밀번호 찾기, 닉네임·비밀번호 변경, 게스트 모드 |
| 🧭 **튜토리얼** | 첫 실행 시 각 탭 사용법을 안내하는 오버레이 |

## 기술 스택

- **Framework**: Expo SDK 54, React Native 0.81 (New Architecture), React 19, React Compiler
- **Routing**: Expo Router 6 (파일 기반 라우팅, typed routes)
- **Server State**: TanStack Query 5
- **HTTP**: Axios (Access Token 자동 갱신 인터셉터)
- **Form**: React Hook Form
- **Storage**: Expo SecureStore(토큰), AsyncStorage
- **기타**: expo-image-picker(영수증), react-native-webview(카카오 OAuth), Reanimated, Gesture Handler

## 프로젝트 구조

```
├── app/                    # Expo Router 화면
│   ├── (tabs)/             # 하단 탭: 홈 / 재료 / 레시피 / 장보기
│   │   ├── ingredients/    #   냉장고·식재료 관리 (fridge, manage)
│   │   ├── recipes/        #   레시피 추천·상세·기록
│   │   └── shopping-list/  #   장보기 목록
│   ├── auth/               # 로그인·회원가입·카카오·계정 찾기
│   └── mypage.tsx          # 마이페이지
├── api/                    # Axios 인스턴스 및 도메인별 API 함수
├── hooks/                  # 도메인별 React Query 훅 (auth, ingredients, recipes …)
├── components/             # 공용 UI 컴포넌트, 탭바, 튜토리얼 오버레이
├── providers/              # Fridge / Navigation / Tutorial Context
├── constants/              # 색상, Query Key 등
├── utils/                  # 날짜 포맷, SecureStore, 헤더 유틸 등
└── types/                  # 공용 타입
```

## 시작하기

### 요구 사항

- Node.js 20+
- Android Studio(에뮬레이터) 또는 Xcode(iOS 시뮬레이터), 혹은 실기기

> 카카오 로그인(딥링크 `domeok://`)과 일부 네이티브 모듈은 **Expo Go가 아닌 Development Build**에서 테스트하는 것을 권장합니다.

### 설치 및 실행

```bash
npm install

npx expo start        # 개발 서버
npm run android       # Android 네이티브 빌드 후 실행
npm run ios           # iOS 네이티브 빌드 후 실행
```

### 빌드 (EAS)

```bash
eas build --profile development --platform android   # 개발용 클라이언트
eas build --profile preview --platform android       # 내부 배포
eas build --profile production --platform android    # 스토어 배포
```

### 백엔드 연결

API 주소는 환경변수 `EXPO_PUBLIC_API_URL`로 주입합니다. `.env.example`을 `.env`로 복사한 뒤 값을 채우세요. (`.env`는 커밋되지 않습니다. EAS 빌드 시에는 `eas env:create`로 등록)

```bash
cp .env.example .env
```

## 스크립트

| 명령어 | 설명 |
| --- | --- |
| `npm start` | Expo 개발 서버 실행 |
| `npm run android` / `npm run ios` | 네이티브 빌드 후 실행 |
| `npm run web` | 웹으로 실행 |
| `npm run lint` | ESLint 검사 |

## 관련 저장소

- [Do-Meok](https://github.com/Do-Meok) — 두고먹고 Organization
