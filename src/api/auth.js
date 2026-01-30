import api from './axios'
import { AUTH_ROUTES } from '../utils/apiConfig'

export const login = async (email, password) => {
  // All users (admin, doctor, patient) use the same login endpoint
  const response = await api.post(AUTH_ROUTES.LOGIN, { email, password })
  return response
}

export const register = async (data, userType = 'patient') => {
  const endpoint = userType === 'admin'
    ? '/admin/register'
    : '/register'
  
  return api.post(endpoint, data)
}

export const getUser = async () => {
  // Get user by ID from token - decode token to get userId, then fetch user
  // The axios interceptor will automatically handle token refresh on 401 errors
  const token = localStorage.getItem('token') || localStorage.getItem('adminToken')
  if (!token) {
    throw new Error('No token found')
  }

  try {
    // Decode JWT token to get user info
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
    }).join(''))
    const decoded = JSON.parse(jsonPayload)
    
    // Fetch user by ID - axios interceptor will handle token refresh automatically
    const response = await api.get(`/users/${decoded.userId}`)
    return response
  } catch (error) {
    // If error persists after refresh attempt, clear tokens
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('adminToken')
      localStorage.removeItem('doctorToken')
      localStorage.removeItem('patientToken')
    }
    console.error('Error getting user:', error)
    throw error
  }
}

export const logout = async () => {
  return api.post('/logout')
}

export const forgotPassword = async (email) => {
  return api.post('/forgot-password', { email })
}

export const resetPassword = async (token, password, password_confirmation) => {
  return api.post('/reset-password', { token, password, password_confirmation })
}

/**
 * Refresh JWT token
 * @param {string} refreshToken - Current token to refresh
 * @returns {Promise<string>} New token
 */
export const refreshToken = async (refreshToken) => {
  const response = await api.post('/auth/refresh-token', {
    refreshToken
  })
  return response.data?.token || response.token
}

