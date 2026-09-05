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

  // --- SỔ TAY TỪ VỰNG CÁ NHÂN (USER VOCAB) ---
  // Lấy danh sách từ trong sổ tay (kèm bộ lọc SRS, tìm kiếm, phân trang)
  getUserVocabs: (params) =>
    axiosClient.get('/user-vocab', { params }),

  // Lấy danh sách các ID từ vựng đã lưu trong sổ tay
  getSavedVocabIds: () =>
    axiosClient.get('/user-vocab/saved-ids'),

  // Lưu / Bỏ lưu từ vào sổ tay (toggle)
  toggleSaveVocab: (data) =>
    axiosClient.post('/user-vocab/toggle', data),

  // Thêm từ thủ công vào sổ tay
  addCustomVocab: (data) =>
    axiosClient.post('/user-vocab/custom', data),

  // Xóa từ khỏi sổ tay
  deleteUserVocab: (id) =>
    axiosClient.delete(`/user-vocab/${id}`),

  // Đánh giá kết quả ôn tập ngắt quãng SRS (again, hard, good, easy)
  reviewUserVocab: (id, rating) =>
    axiosClient.patch(`/user-vocab/${id}/review`, { rating }),
};

export default vocabApi;
