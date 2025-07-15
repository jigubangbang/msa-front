// src/api/api.js
import axios from 'axios';
import { getAccessToken, getRefreshToken, setTokens, removeTokens } from '../utils/tokenUtils';
import API_ENDPOINTS, { LOCAL } from '../utils/constants';

const api = axios.create({
  baseURL: `${LOCAL}`,
  withCredentials: false,
});

// 인터셉터 없는 인스턴스 (refresh-token 요청에 사용)
const rawAxios = axios.create();

function isPublicApi(url = '') {
  return url.includes('/public/') ||
         url.startsWith('/api/auth/') ||
         url.startsWith('/api/actuator/') ||
         url.startsWith('/api/com') ||
         url.startsWith('/api/quests');
}

// 요청 인터셉터
api.interceptors.request.use((config) => {
  if (!isPublicApi(config.url)) {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// 응답 인터셉터
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;

    if (status === 401 && !originalRequest._retry && !isPublicApi(originalRequest.url)) {
      originalRequest._retry = true;

      try {
        const refreshToken = getRefreshToken();
        // 인터셉터 없는 인스턴스로 요청
        const res = await rawAxios.post(`${API_ENDPOINTS.AUTH}/refresh-token`, null, {
          headers: { Authorization: `Bearer ${refreshToken}` },
        });

        const { accessToken: newAccessToken } = res.data;
        setTokens(newAccessToken, refreshToken);

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);

      } catch (refreshErr) {
        console.error('RefreshToken 만료 → 자동 로그아웃');
        removeTokens();
        localStorage.setItem("sessionExpired", "true");
        // window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default api;
