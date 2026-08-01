import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export const authAPI = {
  login: async (email, password) => {
    const res = await axios.post(`${API}/auth/login`, { email, password });
    return res.data;
  },
  register: async (email, password, name) => {
    const res = await axios.post(`${API}/auth/register`, { email, password, name });
    return res.data;
  },
  me: async (token) => {
    const res = await axios.get(`${API}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
  }
};

export const musicAPI = {
  searchiTunes: async (term, entity = 'song', limit = 25) => {
    const res = await axios.get(`${API}/search/itunes`, {
      params: { term, entity, limit }
    });
    return res.data;
  },
  getLibrary: async (token) => {
    const res = await axios.get(`${API}/library`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
  },
  addLibraryItem: async (token, item) => {
    const res = await axios.post(`${API}/library`, item, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
  },
  updateLibraryItem: async (token, id, data) => {
    const res = await axios.put(`${API}/library/${id}`, data, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
  },
  deleteLibraryItem: async (token, id) => {
    const res = await axios.delete(`${API}/library/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
  },
  getAnalytics: async (token) => {
    const res = await axios.get(`${API}/analytics`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
  },
  getAIInsights: async (token, prompt) => {
    const res = await axios.post(`${API}/ai-insights`, { prompt }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
  }
};
