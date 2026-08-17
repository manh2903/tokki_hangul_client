import axiosClient from './axiosClient';

export const aiTutorApi = {
  // Lấy danh sách các cuộc hội thoại với AI Tutor
  getConversations: (params) =>
    axiosClient.get('/ai-tutor/conversations', { params }),

  // Tạo cuộc hội thoại mới với AI Tutor
  createConversation: (data) =>
    axiosClient.post('/ai-tutor/conversations', data),

  // Lấy lịch sử tin nhắn trong một cuộc hội thoại
  getMessages: (conversationId, params) =>
    axiosClient.get(`/ai-tutor/conversations/${conversationId}/messages`, { params }),

  // Gửi tin nhắn câu hỏi tới AI Tutor
  sendMessage: (data) =>
    axiosClient.post('/ai-tutor/messages', data),

  // Cuộc gọi thoại Realtime tương tác 2 chiều với AI Tutor
  realtimeVoiceChat: (data) =>
    axiosClient.post('/ai-tutor/voice-chat', data),
};

export default aiTutorApi;
