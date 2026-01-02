import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
})

// Flag to prevent multiple simultaneous refresh attempts
let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  failedQueue = []
}

// Refresh token function (defined here to avoid circular dependency)
const refreshToken = async (refreshToken) => {
  // Use raw axios to avoid interceptor loop
  const response = await axios.post(
    `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/refresh-token`,
    { refreshToken },
    {
      headers: {
        'Content-Type': 'application/json',
      }
    }
  )
  return response.data?.data?.token || response.data?.token || response.data
}

// Request interceptor - Add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token') || localStorage.getItem('adminToken') || localStorage.getItem('doctorToken') || localStorage.getItem('patientToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor - Handle errors and token refresh
api.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const originalRequest = error.config

    // Skip refresh for refresh-token endpoint to prevent infinite loops
    if (originalRequest.url?.includes('/auth/refresh-token')) {
      return Promise.reject(error)
    }

    // If error is 401 and we haven't tried to refresh yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then(token => {
            originalRequest.headers.Authorization = `Bearer ${token}`
            return api(originalRequest)
          })
          .catch(err => {
            return Promise.reject(err)
          })
      }

      originalRequest._retry = true
      isRefreshing = true

      const token = localStorage.getItem('token') || localStorage.getItem('adminToken') || localStorage.getItem('doctorToken') || localStorage.getItem('patientToken')
      
      // If no token, redirect to login
      if (!token) {
        localStorage.removeItem('token')
        localStorage.removeItem('adminToken')
        localStorage.removeItem('doctorToken')
        localStorage.removeItem('patientToken')
        window.location.href = '/login'
        return Promise.reject(error)
      }

      try {
        // Try to refresh the token
        const newToken = await refreshToken(token)
        
        // Update all possible token keys
        if (localStorage.getItem('token')) localStorage.setItem('token', newToken)
        if (localStorage.getItem('adminToken')) localStorage.setItem('adminToken', newToken)
        if (localStorage.getItem('doctorToken')) localStorage.setItem('doctorToken', newToken)
        if (localStorage.getItem('patientToken')) localStorage.setItem('patientToken', newToken)
        
        // Update the original request with new token
        originalRequest.headers.Authorization = `Bearer ${newToken}`
        
        // Process queued requests
        processQueue(null, newToken)
        isRefreshing = false
        
        // Retry the original request
        return api(originalRequest)
      } catch (refreshError) {
        // Refresh failed, clear tokens and redirect to login
        processQueue(refreshError, null)
        isRefreshing = false
        localStorage.removeItem('token')
        localStorage.removeItem('adminToken')
        localStorage.removeItem('doctorToken')
        localStorage.removeItem('patientToken')
        window.location.href = '/login'
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error.response?.data || error)
  }
)

export default api

