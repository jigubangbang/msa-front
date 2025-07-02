// src/api/api.js
import axios from 'axios';
import { getAccessToken, getRefreshToken, setTokens, removeTokens } from '../utils/tokenUtils';
import API_ENDPOINTS, {LOCAL} from '../utils/constants';

const api = axios.create({
  baseURL: `${LOCAL}`, 
  withCredentials: false, 
});

// 요청 인터셉터
api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 응답 인터셉터
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;

    if (status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = getRefreshToken();
        const res = await axios.post(`${API_ENDPOINTS.AUTH}/refresh-token`, null, {
          headers: { Authorization: `Bearer ${refreshToken}` },
        });

        const { accessToken: newAccessToken } = res.data;
        setTokens(newAccessToken, refreshToken);

        // 새 토큰으로 다시 요청
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);

      } catch (refreshErr) {
        console.error('RefreshToken 만료 → 자동 로그아웃');
        removeTokens();
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default api;
