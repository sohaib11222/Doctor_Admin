import api from './axios'

export const login = async (email, password, userType = 'patient') => {
  const endpoint = userType === 'admin' 
    ? '/admin/login' 
    : userType === 'pharmacy_admin'
    ? '/pharmacy-admin/login'
    : '/login'
  
  return api.post(endpoint, { email, password })
}

export const register = async (data, userType = 'patient') => {
  const endpoint = userType === 'admin'
    ? '/admin/register'
    : userType === 'pharmacy_admin'
    ? '/pharmacy-admin/register'
    : '/register'
  
  return api.post(endpoint, data)
}

export const getUser = async () => {
  return api.get('/user')
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

