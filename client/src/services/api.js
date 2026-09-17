import axios from 'axios';

const api = axios.create({
  timeout: 120000,
});

export const uploadDocument = async (file) => {
  try {
    const formData = new FormData();
    formData.append('document', file);
    const response = await api.post('/api/documents/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || error.message || 'Failed to upload document. Please try again later.');
  }
};

export const uploadText = async (text) => {
  try {
    const response = await api.post('/api/documents/upload', { text });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || error.message || 'Failed to upload text. Please try again later.');
  }
};

export const askQuestion = async (documentId, question) => {
  try {
    const response = await api.post(`/api/documents/${documentId}/ask`, { question });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || error.message || 'Failed to ask question.');
  }
};

export const exportBrief = async (documentId) => {
  try {
    const response = await api.post(`/api/documents/${documentId}/export`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || error.message || 'Failed to export brief.');
  }
};
