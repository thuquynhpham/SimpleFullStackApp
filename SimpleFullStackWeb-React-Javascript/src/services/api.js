import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://localhost:7279/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Function to set auth token
export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
    localStorage.setItem('authToken', token);
  } else {
    delete api.defaults.headers.common.Authorization;
    localStorage.removeItem('authToken');
  }
};

// Load token from localStorage on initialization
const token = localStorage.getItem('authToken');
if (token) {
  setAuthToken(token);
}

export default api;

