import axiosClient from './axiosClient';

export const reviewApi = {
  // Lấy danh sách bộ thẻ ghi nhớ (Flashcards) theo Spaced Repetition
  getFlashcardDecks: (params) =>
    axiosClient.get('/review/flashcards', { params }),

  // Lấy danh sách mini games khả dụng
  getGames: (params) =>
    axiosClient.get('/review/games', { params }),

  // Nộp kết quả lượt chơi game ôn tập
  submitGameSession: (data) =>
    axiosClient.post('/review/games/submit', data),
};

export default reviewApi;
