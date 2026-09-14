const API_BASE_URL = window.location.origin.includes('localhost') || window.location.origin.includes('127.0.0.1')
  ? `${window.location.origin}/api`
  : '/api';

const Api = {
  getToken() {
    return localStorage.getItem('lab_token');
  },

  setToken(token) {
    if (token) localStorage.setItem('lab_token', token);
    else localStorage.removeItem('lab_token');
  },

  getUser() {
    try {
      const u = localStorage.getItem('lab_user');
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  },

  setUser(user) {
    if (user) localStorage.setItem('lab_user', JSON.stringify(user));
    else localStorage.removeItem('lab_user');
  },

  async request(endpoint, options = {}) {
    const token = this.getToken();
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || `Request failed with status ${res.status}`);
      }
      return data;
    } catch (err) {
      console.error(`API Error on ${endpoint}:`, err);
      throw err;
    }
  },

  // Auth Endpoints
  auth: {
    async login(identifier, password, role) {
      const res = await Api.request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ identifier, password, role })
      });
      if (res.token) {
        Api.setToken(res.token);
        Api.setUser(res.user);
      }
      return res;
    },

    async quickLogin(role, userId) {
      const res = await Api.request('/auth/quick-login', {
        method: 'POST',
        body: JSON.stringify({ role, userId })
      });
      if (res.token) {
        Api.setToken(res.token);
        Api.setUser(res.user);
      }
      return res;
    },

    async register(data) {
      const res = await Api.request('/auth/register', {
        method: 'POST',
        body: JSON.stringify(data)
      });
      if (res.token) {
        Api.setToken(res.token);
        Api.setUser(res.user);
      }
      return res;
    },

    async getMe() {
      const res = await Api.request('/auth/me');
      if (res.user) Api.setUser(res.user);
      return res;
    },

    async getLecturers() {
      return await Api.request('/auth/lecturers');
    },

    logout() {
      Api.setToken(null);
      Api.setUser(null);
    }
  },

  // Labs Endpoints
  labs: {
    async getAll(params = {}) {
      const query = new URLSearchParams(params).toString();
      return await Api.request(`/labs${query ? `?${query}` : ''}`);
    },

    async getById(id) {
      return await Api.request(`/labs/${id}`);
    },

    async create(data) {
      return await Api.request('/labs', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    },

    async update(id, data) {
      return await Api.request(`/labs/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      });
    }
  },

  // Equipments Endpoints
  equipments: {
    async getAll() {
      return await Api.request('/equipments');
    }
  },

  // Bookings Endpoints
  bookings: {
    async getAll(params = {}) {
      const query = new URLSearchParams(params).toString();
      return await Api.request(`/bookings${query ? `?${query}` : ''}`);
    },

    async getById(id) {
      return await Api.request(`/bookings/${id}`);
    },

    async create(data) {
      return await Api.request('/bookings', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    },

    async updateStatus(id, action, notes = '') {
      return await Api.request(`/bookings/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ action, notes })
      });
    },

    async checkinByQR(qrCodeData) {
      return await Api.request('/bookings/checkin', {
        method: 'POST',
        body: JSON.stringify({ qrCodeData })
      });
    },

    async delete(id) {
      return await Api.request(`/bookings/${id}`, {
        method: 'DELETE'
      });
    }
  },

  // Stats Endpoints
  stats: {
    async getDashboard() {
      return await Api.request('/stats/dashboard');
    },

    async resetDb() {
      return await Api.request('/stats/reset', { method: 'POST' });
    }
  },

  // Thesis / Skripsi Endpoints
  thesis: {
    async getStudents() {
      return await Api.request('/thesis/students');
    },

    async getLecturers() {
      return await Api.request('/thesis/lecturers');
    },

    async getMySupervisor() {
      return await Api.request('/thesis/my-supervisor');
    },

    async getMyExam() {
      return await Api.request('/thesis/my-exam');
    },

    async getMySupervision() {
      return await Api.request('/thesis/my-supervision');
    },

    async getMyExamsAsExaminer() {
      return await Api.request('/thesis/my-exams-as-examiner');
    },

    async getAllSupervisors() {
      return await Api.request('/thesis/supervisors');
    },

    async createSupervisor(data) {
      return await Api.request('/thesis/supervisors', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    },

    async updateSupervisor(id, data) {
      return await Api.request(`/thesis/supervisors/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      });
    },

    async deleteSupervisor(id) {
      return await Api.request(`/thesis/supervisors/${id}`, {
        method: 'DELETE'
      });
    },

    async getAllExams() {
      return await Api.request('/thesis/exams');
    },

    async createExam(data) {
      return await Api.request('/thesis/exams', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    },

    async updateExam(id, data) {
      return await Api.request(`/thesis/exams/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      });
    },

    async deleteExam(id) {
      return await Api.request(`/thesis/exams/${id}`, {
        method: 'DELETE'
      });
    }
  }
};

window.Api = Api;

