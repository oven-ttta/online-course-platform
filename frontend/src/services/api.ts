import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add auth token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          throw new Error('No refresh token');
        }

        const response = await axios.post(`${API_URL}/auth/refresh-token`, {
          refreshToken,
        });

        const { accessToken, refreshToken: newRefreshToken } = response.data.data;

        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', newRefreshToken);

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;

// Auth API
export const authApi = {
  register: (data: { email: string; password: string; firstName: string; lastName: string; role?: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  logout: (refreshToken: string) =>
    api.post('/auth/logout', { refreshToken }),
  getMe: () =>
    api.get('/auth/me'),
  updateProfile: (data: { firstName?: string; lastName?: string; phone?: string; bio?: string }) =>
    api.put('/auth/me', data),
  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.put('/auth/me/password', data),
};

// Course API
export const courseApi = {
  getAll: (params?: {
    page?: number;
    limit?: number;
    categoryId?: number;
    level?: string;
    search?: string;
    sortBy?: string;
  }) => api.get('/courses', { params }),
  getFeatured: (limit?: number) =>
    api.get('/courses/featured', { params: { limit } }),
  getStats: () => api.get('/courses/stats'),
  getBySlug: (slug: string) =>
    api.get(`/courses/${slug}`),
  getById: (id: string) =>
    api.get(`/courses/id/${id}`),
  create: (data: FormData | object) =>
    api.post('/courses', data),
  update: (id: string, data: object) =>
    api.put(`/courses/${id}`, data),
  delete: (id: string) =>
    api.delete(`/courses/${id}`),
  publish: (id: string) =>
    api.put(`/courses/${id}/publish`),
  enroll: (courseId: string, data?: object) =>
    api.post(`/courses/${courseId}/enroll`, data),
  getReviews: (courseId: string, params?: { page?: number; limit?: number }) =>
    api.get(`/courses/${courseId}/reviews`, { params }),
  createReview: (courseId: string, data: { rating: number; comment?: string }) =>
    api.post(`/courses/${courseId}/reviews`, data),
};

// Category API
export const categoryApi = {
  getAll: () =>
    api.get('/categories'),
  getBySlug: (slug: string) =>
    api.get(`/categories/${slug}`),
  create: (data: { name: string; slug: string; description?: string; parentId?: number }) =>
    api.post('/categories', data),
  update: (id: number, data: { name?: string; slug?: string; description?: string; isActive?: boolean }) =>
    api.put(`/categories/${id}`, data),
  delete: (id: number) =>
    api.delete(`/categories/${id}`),
};

// Enrollment API
export const enrollmentApi = {
  getMyEnrollments: () =>
    api.get('/enrollments'),
  getEnrollment: (enrollmentId: string) =>
    api.get(`/enrollments/${enrollmentId}`),
  updateProgress: (lessonId: string, data: { watchTime?: number; lastPosition?: number; isCompleted?: boolean }) =>
    api.put(`/enrollments/progress/${lessonId}`, data),
  submitQuiz: (quizId: string, answers: Record<string, number[]>) =>
    api.post(`/enrollments/quiz/${quizId}/submit`, { answers }),
  getQuizResults: (quizId: string) =>
    api.get(`/enrollments/quiz/${quizId}/results`),
};

// Lesson API
export const lessonApi = {
  getLesson: (lessonId: string) =>
    api.get(`/lessons/${lessonId}`),
  createSection: (courseId: string, data: { title: string; description?: string }) =>
    api.post(`/courses/${courseId}/sections`, data),
  updateSection: (sectionId: string, data: { title?: string; description?: string }) =>
    api.put(`/lessons/sections/${sectionId}`, data),
  deleteSection: (sectionId: string) =>
    api.delete(`/lessons/sections/${sectionId}`),
  createLesson: (sectionId: string, data: object) =>
    api.post(`/lessons/sections/${sectionId}/lessons`, data),
  updateLesson: (lessonId: string, data: object) =>
    api.put(`/lessons/${lessonId}`, data),
  deleteLesson: (lessonId: string) =>
    api.delete(`/lessons/${lessonId}`),
};

// Review API
export const reviewApi = {
  update: (reviewId: string, data: { rating?: number; comment?: string }) =>
    api.put(`/reviews/${reviewId}`, data),
  delete: (reviewId: string) =>
    api.delete(`/reviews/${reviewId}`),
  reply: (reviewId: string, reply: string) =>
    api.post(`/reviews/${reviewId}/reply`, { reply }),
};

// Instructor API
export const instructorApi = {
  getDashboard: () =>
    api.get('/instructor/dashboard'),
  getCourses: (params?: { page?: number; limit?: number; status?: string }) =>
    api.get('/instructor/courses', { params }),
  getCourseStudents: (courseId: string, params?: { page?: number; limit?: number }) =>
    api.get(`/instructor/courses/${courseId}/students`, { params }),
  getCourseStats: (courseId: string) =>
    api.get(`/instructor/courses/${courseId}/stats`),
  getEarnings: (params?: { startDate?: string; endDate?: string }) =>
    api.get('/instructor/earnings', { params }),
};

// Upload API
export const uploadApi = {
  uploadImage: (file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    return api.post('/upload/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  uploadVideo: (file: File) => {
    const formData = new FormData();
    formData.append('video', file);
    return api.post('/upload/video', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  uploadThumbnail: (file: File) => {
    const formData = new FormData();
    formData.append('thumbnail', file);
    return api.post('/upload/thumbnail', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  uploadAttachment: (file: File) => {
    const formData = new FormData();
    formData.append('attachment', file);
    return api.post('/upload/attachment', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  uploadFiles: (files: File[]) => {
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));
    return api.post('/upload/files', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  getPresignedUrl: (fileName: string, folder?: string) =>
    api.post('/upload/presigned-url', { fileName, folder }),
  deleteFile: (fileName: string) =>
    api.delete('/upload', { data: { fileName } }),
};

// Wishlist API
export const wishlistApi = {
  getMyWishlist: () => api.get('/wishlist'),
  add: (courseId: string) => api.post('/wishlist', { courseId }),
  remove: (courseId: string) => api.delete(`/wishlist/${courseId}`),
};

// Contact API
export const contactApi = {
  submit: (data: { name: string; email: string; subject: string; message: string }) =>
    api.post('/contact', data),
  getContacts: () => api.get('/contact'),
  markAsRead: (id: string) => api.put(`/contact/${id}/read`),
};

// User API (Shared with Admin)
export const userApi = {
  getProfile: (id: string) => api.get(`/users/${id}/profile`),
  updateProfile: (data: { firstName?: string; lastName?: string; phone?: string; bio?: string; avatarUrl?: string }) =>
    api.put('/users/profile', data),
};

// Admin API
export const adminApi = {
  getDashboard: () =>
    api.get('/admin/dashboard'),
  getCourses: (params?: { page?: number; limit?: number; status?: string; search?: string }) =>
    api.get('/admin/courses', { params }),
  getPendingCourses: (params?: { page?: number; limit?: number }) =>
    api.get('/admin/courses/pending', { params }),
  approveCourse: (courseId: string) =>
    api.put(`/admin/courses/${courseId}/approve`),
  rejectCourse: (courseId: string, reason?: string) =>
    api.put(`/admin/courses/${courseId}/reject`, { reason }),
  getUsers: (params?: { page?: number; limit?: number; role?: string; search?: string }) =>
    api.get('/users', { params }),
  updateUserStatus: (userId: string, isActive: boolean) =>
    api.put(`/users/${userId}/status`, { isActive }),
  updateUserRole: (userId: string, role: string) =>
    api.put(`/users/${userId}/role`, { role }),
  getRevenueReport: (params?: { startDate?: string; endDate?: string }) =>
    api.get('/admin/reports/revenue', { params }),
};

export const walletApi = {
  getBalance: () => api.get('/wallet/balance'),
  getTransactions: () => api.get('/wallet/transactions'),
  purchase: (courseId: string) => api.post(`/wallet/purchase/${courseId}`),
  redeem: (voucherUrl: string) => api.post('/wallet/redeem', { voucherUrl }),
};
