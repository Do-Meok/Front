const colors = {
  BLACK: "#111111",
  WHITE: "#FFF",
  GRAY: "#555",
  KAKAO: "#FEE500",
  INACTIVE: "#9AA0A6",
  BORDER: "#EAECEF",
  RED_500: "#FF5F5F",
  GRAY_200: "#E2E8F0",
  GRAY_700: "#374151",
};

const queryKey = {
  AUTH: "auth",
  GET_ME: "getMe",
  INGREDIENTS: "ingredients",
  SHOPPING: "shopping",
  GET_SHOPPING: "get_shopping",
  ASSISTANT: "assistant",
  GET_RECOMMENDATIONS_RECIPES: "get_recommendations_recipes",
  GET_INSTANT_RECOMMENDATIONS: "get_instant_recommendations",
  SEARCH_RECIPES_BY_NAME: "search_recipes_by_name",
  RECIPES: "recipes",
  GET_RECIPES: "get_recipes",
  REFRIGERATOR: "refrigerator",
  COMPARTMENT_INGREDIENTS: "compartment_ingredients",
};

/**
 * 모든 페이지 로드 후 실행되는 스크립트.
 *
 * 카카오 리다이렉트 URL(/auth/kakao/redirect?code=...) 감지 시:
 *   1. body 즉시 숨김 → JSON이 화면에 보이지 않도록
 *   2. body 텍스트(JSON) postMessage로 React Native에 전달
 *
 * 일반 페이지(카카오 로그인 폼)는 아무것도 하지 않음.
 */
const INJECTED_JS = `
  (function() {
    var url = window.location.href;
    var isRedirect =
      url.indexOf('/auth/kakao/redirect') !== -1 &&
      url.indexOf('code=') !== -1;

    if (!isRedirect) return;

    if (document.body) document.body.style.display = 'none';

    var bodyText = '';
    try { bodyText = document.body ? document.body.innerText : ''; } catch(e) {}

    window.ReactNativeWebView.postMessage(JSON.stringify({
      type: 'kakao_redirect',
      url: url,
      body: bodyText,
    }));
  })();
  true;
`;

export { colors, INJECTED_JS, queryKey };
