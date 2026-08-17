import axiosClient from './axiosClient';

export const grammarApi = {
  // Lấy danh sách ngữ pháp theo cấp độ / filter
  getGrammarPoints: (params) =>
    axiosClient.get('/grammar', { params }),

  // Chi tiết điểm ngữ pháp + cấu trúc + ví dụ
  getGrammarById: (id) =>
    axiosClient.get(`/grammar/${id}`),
};

export default grammarApi;
