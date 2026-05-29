// src/api/index.js
import axios from 'axios'

const apiClient = axios.create({
  // ✅ 部署環境：使用 /api 前綴
  baseURL: '/api',

  // ✅ 開發環境時可以切換回 localhost（用環境變數）
  // baseURL: import.meta.env.VITE_API_BASE_URL || '/api',

  headers: {
    'Content-Type': 'application/json',
  },
})

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default apiClient