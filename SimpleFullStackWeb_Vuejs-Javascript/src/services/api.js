import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'https://localhost:7279/api',
})

export const setAuthToken = token => {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`
    localStorage.setItem('authToken', token)
    return
  }

  delete api.defaults.headers.common.Authorization
  localStorage.removeItem('authToken')
}

const token = localStorage.getItem('authToken')
if (token) {
  setAuthToken(token)
}

export default api

