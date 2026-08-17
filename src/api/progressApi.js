import axiosClient from './axiosClient';

export const progressApi = {
  // Ghi nhận phiên học tập (thời gian bắt đầu, kết thúc, nội dung)
  logStudySession: (data) =>
    axiosClient.post('/progress/sessions', data),

  // Lấy điểm số năng lực 6 kỹ năng (Nghe, Nói, Đọc, Viết, Từ vựng, Ngữ pháp)
  getSkillScores: () =>
    axiosClient.get('/progress/skills'),

  // Lấy báo cáo tiến độ định kỳ (Tuần / Tháng) kèm nhận xét AI
  getProgressReports: (params) =>
    axiosClient.get('/progress/reports', { params }),
};

export default progressApi;
