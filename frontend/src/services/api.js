import axios from 'axios';

// Spring Boot Core Service – Port 8081
const coreApi = axios.create({
  baseURL: 'http://localhost:8081',
  headers: { 'Content-Type': 'application/json' },
});

// Node.js Search Gateway – Port 5000
const searchApi = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every core request automatically
coreApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('aa_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/* ===========================
   AUTH API  (Spring Boot :8081)
   =========================== */
export const authApi = {
  login: (username, password) =>
    coreApi.post('/auth/login', { username, password }),

  register: (userData) =>
    coreApi.post('/auth/register', userData),
};

/* ===========================
   COURSES API  (Spring Boot :8081)
   =========================== */
export const coursesApi = {
  getAll: () => coreApi.get('/courses'),
  getById: (id) => coreApi.get(`/courses/${id}`),

  // Admin only – username required as query param
  add: (course, username) =>
    coreApi.post(`/courses/add?username=${username}`, course),

  update: (id, course) =>
    coreApi.put(`/courses/${id}`, course),

  delete: (id, username) =>
    coreApi.delete(`/courses/${id}?username=${username}`),
};

/* ===========================
   SEMESTER PLAN API  (Spring Boot :8081)
   =========================== */
export const plansApi = {
  addCourseToSemester: (studentId, courseId, semesterNo) =>
    coreApi.post(
      `/plans/add?studentId=${studentId}&courseId=${courseId}&semesterNo=${semesterNo}`
    ),

  getStudentPlan: (studentId, username) =>
    coreApi.get(`/plans/student/${studentId}?username=${username}`),

  getSemesterPlan: (studentId, semesterNo) =>
    coreApi.get(`/plans/student/${studentId}/${semesterNo}`),

  getTotalCredits: (studentId) =>
    coreApi.get(`/plans/summary/${studentId}`),
};

/* ===========================
   SEMANTIC SEARCH API  (Node Gateway :5000)
   =========================== */
export const semanticApi = {
  search: (query) =>
    searchApi.post('/search', { query }),

  addCourse: (courseData) =>
    searchApi.post('/add-course', courseData),
};

export { coreApi, searchApi };
