/**
 * 모든 페이지 로드 후 실행되는 스크립트.
 *
 * 카카오 리다이렉트 URL(/auth/kakao/redirect?code=...) 감지 시:
 *   1. body 즉시 숨김 → JSON이 화면에 보이지 않도록
 *   2. body 텍스트(JSON) postMessage로 React Native에 전달
 *
 * 일반 페이지(카카오 로그인 폼)는 아무것도 하지 않음.
 */
export const INJECTED_JS = `
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
