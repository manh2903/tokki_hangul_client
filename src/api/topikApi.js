import axiosClient from './axiosClient';

export const topikApi = {
  // Lấy danh sách cấp độ TOPIK (TOPIK I, TOPIK II...)
  getTopikLevels: (params) =>
    axiosClient.get('/topik-levels', { params }),

  // Lấy danh sách các đơn vị bài học (Units) theo kỹ năng & cấp độ
  getUnits: (params) =>
    axiosClient.get('/topik/units', { params }),

  // Lấy danh sách đề thi TOPIK / bài kiểm tra đánh giá
  getTests: (params) =>
    axiosClient.get('/topik/tests', { params }),

  // Lấy câu hỏi kiểm tra xếp lớp (AI Sinh tự động)
  getPlacementQuestions: (params) =>
    axiosClient.get('/topik/placement-questions', { params }),

  // Nộp bài thi TOPIK để chấm điểm & lưu kết quả
  submitTest: (data) =>
    axiosClient.post('/topik/tests/submit', data),
};

export default topikApi;
