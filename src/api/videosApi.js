import axiosClient from './axiosClient';

export const videosApi = {
  // Lấy danh sách video (theo topic, level, phân trang)
  getVideos: (params) =>
    axiosClient.get('/videos', { params }),

  // Chi tiết video kèm danh sách phụ đề song ngữ và từ vựng
  getVideoById: (id) =>
    axiosClient.get(`/videos/${id}`),

  // Cập nhật tiến độ xem video của người dùng
  updateProgress: (data) =>
    axiosClient.post('/videos/progress', data),
};

export default videosApi;
