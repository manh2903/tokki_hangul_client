import axiosClient from './axiosClient';

export const coursesApi = {
  // Lấy danh sách khóa học
  getCourses: (params) =>
    axiosClient.get('/courses', { params }),

  // Lấy danh sách các câu hỏi quiz của bài học
  getQuizQuestions: (params) =>
    axiosClient.get('/courses/quiz-questions', { params }),

  // Lấy nội dung chi tiết các mục trong bài học
  getLessonItems: (lessonId) =>
    axiosClient.get(`/courses/lessons/${lessonId}/items`),
};

export default coursesApi;
