import axios from 'axios';

const rawApiUrl = import.meta.env.VITE_API_URL || '';
const cleanApiUrl = rawApiUrl.replace(/\/+$/, '');
const baseURL = cleanApiUrl ? `${cleanApiUrl}/api/v1` : '/api/v1';

export const axiosClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
    'x-client-type': 'learner',
  },
  timeout: 15000,
});

// Request Interceptor: Attach Access Token
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Auto Token Refresh on 401
axiosClient.interceptors.response.use(
  (response) => {
    return response.data;
  },
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401) {
      const isAuthEndpoint = originalRequest?.url?.includes('/auth/');

      if (!originalRequest._retry && !isAuthEndpoint) {
        originalRequest._retry = true;
        const refreshToken = localStorage.getItem('refreshToken');

        if (refreshToken) {
          try {
            const res = await axios.post(`${baseURL}/auth/refresh`, { refreshToken });
            const newAccessToken = res.data?.data?.accessToken || res.data?.accessToken;
            const newRefreshToken = res.data?.data?.refreshToken || res.data?.refreshToken;

            if (newAccessToken) {
              localStorage.setItem('accessToken', newAccessToken);
              if (newRefreshToken) {
                localStorage.setItem('refreshToken', newRefreshToken);
              }
              originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
              return axiosClient(originalRequest);
            }
          } catch (refreshErr) {
            console.warn('⚠️ Token refresh failed, redirecting to login:', refreshErr);
          }
        }
      }

      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');

      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    const message = error.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại sau';
    return Promise.reject(new Error(message));
  }
);

export default axiosClient;
