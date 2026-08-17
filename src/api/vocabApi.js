import axiosClient from './axiosClient';

export const vocabApi = {
  // Lấy danh sách từ vựng theo chủ đề, cấp độ hoặc phân trang
  getVocabularies: (params) =>
    axiosClient.get('/vocabulary', { params }),

  // Chi tiết từ vựng kèm ví dụ và audio
  getVocabularyById: (id) =>
    axiosClient.get(`/vocabulary/${id}`),

  // Danh mục các từ loại (danh từ, động từ, tính từ...)
  getPartsOfSpeech: () =>
    axiosClient.get('/vocabulary/parts-of-speech'),
};

export default vocabApi;
