import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

console.log('API_BASE_URL:', API_BASE_URL)

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    console.log('Making request to:', config.url)
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    console.error('Request error:', error)
    return Promise.reject(error)
  }
)

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    console.log('Response received:', response.status)
    return response
  },
  (error) => {
    console.error('Response error:', error)
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Auth API
export const authAPI = {
  login: (credentials) => {
    console.log('Attempting login with:', credentials)
    return api.post('/auth/login', credentials)
  },
  logout: () => api.post('/auth/logout'),
  refresh: () => api.post('/auth/refresh'),
  getRecruiters: () => api.get('/auth/recruiters'),
}

// Employees API
export const employeesAPI = {
  getAll: (params) => api.get('/employees', { params }),
  getById: (id) => api.get(`/employees/${id}`),
  create: (data) => api.post('/employees', data),
  update: (id, data) => api.put(`/employees/${id}`, data),
  delete: (id) => api.delete(`/employees/${id}`),
}

// Candidates API
export const candidatesAPI = {
  getAll: (params) => api.get('/candidates', { params }),
  getById: (id) => api.get(`/candidates/${id}`),
  create: (data) => api.post('/candidates', data),
  update: (id, data) => api.put(`/candidates/${id}`, data),
  delete: (id) => api.delete(`/candidates/${id}`),
  uploadResume: (id, data) =>
      api.post(`/candidates/${id}/upload-resume`, data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }),
}

// Jobs API
export const jobsAPI = {
  getAll: (params) => api.get('/jobs', { params }),
  getById: (id) => api.get(`/jobs/${id}`),
  create: (data) => api.post('/jobs', data),
  update: (id, data) => api.put(`/jobs/${id}`, data),
  delete: (id) => api.delete(`/jobs/${id}`),
  getPoolForJob: (jobId) => api.get(`/jobs/${jobId}/pool_candidates`),
  submitForApproval: (jobId) =>
    api.post(`/jobs/${jobId}/submit-for-approval`),
  approveJob: (jobId) => api.post(`/jobs/${jobId}/approve`),
  getWorkflows: (params) => api.get('/jobs/workflows/', { params }),
  getAgencies: (params) => api.get('/jobs/agencies/', { params }),
  publishJob: (id) => api.post(`/jobs/${id}/publish`),
  getPublished: () => api.get("/jobs/public/careers"),
}

// Applications API
export const applicationsAPI = {
  getAll: (params) => api.get('/applications', { params }),
  getById: (id) => api.get(`/applications/${id}`),
  create: (data) => api.post('/applications', data),
  update: (id, data) => api.put(`/applications/${id}`, data),
  delete: (id) => api.delete(`/applications/${id}`),
}

// Dashboard API
export const dashboardAPI = {
  getStats: () => api.get('/dashboard/stats'),
  getRecentActivities: () => api.get('/dashboard/activities'),
}


// // External Agencies API
// export const externalAPI = {
//   getAll: (params) => api.get('/external-agencies', { params }),
//   getById: (id) => api.get(`/external-agencies/${id}`),
//   create: (data) => api.post('/external-agencies', data),
//   update: (id, data) => api.put(`/external-agencies/${id}`, data),
//   delete: (id) => api.delete(`/external-agencies/${id}`),
// }

// Recruitment Agencies API
export const recruitmentAgencyAPI = {
  getAll: (params) => api.get("/recruitment-agencies", { params }),
  getById: (id) => api.get(`/recruitment-agencies/${id}`),
  create: (data) => api.post("/recruitment-agencies", data),
  update: (id, data) => api.put(`/recruitment-agencies/${id}`, data),
  delete: (id) => api.delete(`/recruitment-agencies/${id}`),
};


// Candidate Profile Fields API
export const candidateProfileAPI = {
  getAll: (params) => api.get("/candidate-fields", { params }),
  getById: (id) => api.get(`/candidate-fields/${id}`),
  create: (data) => api.post("/candidate-fields", data),
  update: (id, data) => api.put(`/candidate-fields/${id}`, data),
  delete: (id) => api.delete(`/candidate-fields/${id}`),
};

// workflow Template API
export const workflowTemplateAPI = {
  getAll: (params) => api.get("/workflow-templates", { params }),
  getById: (id) => api.get(`/workflow-templates/${id}`),
  create: (data) => api.post("/workflow-templates", data),
  update: (id, data) => api.put(`/workflow-templates/${id}`, data),
  delete: (id) => api.delete(`/workflow-templates/${id}`),
};

export default api 