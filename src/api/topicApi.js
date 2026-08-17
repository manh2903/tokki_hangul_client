import axiosClient from './axiosClient';

export const topicApi = {
  // Lấy danh sách chủ đề học tập
  getTopics: (params) =>
    axiosClient.get('/topics', { params }),

  // Chi tiết chủ đề
  getTopicById: (id) =>
    axiosClient.get(`/topics/${id}`),
};

export default topicApi;
