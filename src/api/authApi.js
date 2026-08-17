import axiosClient from './axiosClient';

export const authApi = {
  // Google OAuth Login
  googleAuth: (idToken, deviceInfo) =>
    axiosClient.post('/auth/google', { idToken: typeof idToken === 'object' ? idToken.idToken || idToken.credential : idToken, deviceInfo }),

  // Manual / Local Login (if supported)
  login: (email, password) =>
    axiosClient.post('/auth/login', { email, password }),

  // Manual / Local Register
  register: (name, email, password) =>
    axiosClient.post('/auth/register', { name, email, password }),

  // Refresh Token
  refreshToken: (refreshToken) =>
    axiosClient.post('/auth/refresh', { refreshToken }),

  // Logout
  logout: () =>
    axiosClient.post('/auth/logout'),
};

export default authApi;
