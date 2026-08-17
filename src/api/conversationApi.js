import axiosClient from './axiosClient';

export const conversationApi = {
  // Danh sách bài hội thoại theo chủ đề
  getDialogues: (params) =>
    axiosClient.get('/conversation/dialogues', { params }),

  // Danh sách kịch bản đóng vai (Roleplay Scenarios)
  getScenarios: (params) =>
    axiosClient.get('/conversation/scenarios', { params }),

  // Khởi tạo phiên đóng vai cùng AI
  createRoleplaySession: (data) =>
    axiosClient.post('/conversation/roleplay/sessions', data),
};

export default conversationApi;
