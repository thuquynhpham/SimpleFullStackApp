import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://localhost:7279/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });
    return Promise.reject(error);
  }
);

export const setAuthToken = (token) => {
  if (token) {
    const cleanToken =
      typeof token === 'string' && token.startsWith('"') && token.endsWith('"')
        ? JSON.parse(token)
        : token;

    api.defaults.headers.common.Authorization = `Bearer ${cleanToken}`;
    localStorage.setItem('authToken', cleanToken);
    return;
  }

  delete api.defaults.headers.common.Authorization;
  localStorage.removeItem('authToken');
};

const token = localStorage.getItem('authToken');
if (token) {
  setAuthToken(token);
}

export default api;

