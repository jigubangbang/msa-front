// src/polyfills.js
// 웹 브라우저 환경에서 'global'이 정의되어 있지 않을 경우, 'window' 객체를 'global'로 정의
if (typeof window !== 'undefined' && typeof window.global === 'undefined') {
  window.global = window;
}