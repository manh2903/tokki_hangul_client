import axiosClient from './axiosClient';

export const usersApi = {
  // Lấy thông tin tài khoản hiện tại
  getMe: () =>
    axiosClient.get('/users/me'),

  // Cập nhật thông tin tài khoản, avatar, mục tiêu học tập
  updateMe: (data) =>
    axiosClient.patch('/users/me', data),
};

export default usersApi;
