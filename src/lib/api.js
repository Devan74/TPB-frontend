import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

export const docTypeService = {
  getAllDocTypes: async () => {
    const response = await api.get('/doctypes');
    return response.data;
  },

  createDocType: async (docType) => {
    const response = await api.post('/doctypes', docType);
    return response.data;
  },

  updateDocType: async (id, docType) => {
    const response = await api.put(`/doctypes/${id}`, docType);
    return response.data;
  },

  deleteDocType: async (id) => {
    const response = await api.delete(`/doctypes/${id}`);
    return response.data;
  }
};