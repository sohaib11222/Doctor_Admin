import { createContext, useContext, useState, useEffect } from 'react'
import * as authApi from '../api/auth'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    const token = localStorage.getItem('token') || localStorage.getItem('adminToken')
    if (token) {
      try {
        const response = await authApi.getUser()
        // Backend returns { success: true, message: 'OK', data: user }
        const responseData = response.data || response
        const user = responseData.data || responseData.user || responseData
        if (user && user.role === 'ADMIN') {
          setUser(user)
        } else {
          // Not an admin user, clear token
          localStorage.removeItem('token')
          localStorage.removeItem('adminToken')
          setUser(null)
        }
      } catch (error) {
        console.error('Auth check failed:', error)
        localStorage.removeItem('token')
        localStorage.removeItem('adminToken')
        setUser(null)
      }
    }
    setLoading(false)
  }

  const login = async (email, password) => {
    try {
      const response = await authApi.login(email, password)
      // Backend returns { success: true, message: 'OK', data: { user, token } }
      const responseData = response.data || response
      const token = responseData.token || responseData.data?.token
      const user = responseData.user || responseData.data?.user
      
      // Check if user is admin
      if (user && user.role !== 'ADMIN') {
        throw new Error('Access denied. Admin access required.')
      }
      
      if (token) {
        localStorage.setItem('token', token)
        localStorage.setItem('adminToken', token) // Also store as adminToken for consistency
      }
      
      if (user) {
        setUser(user)
      }
      
      return { token, user, message: responseData.message || 'Login successful' }
    } catch (error) {
      throw error
    }
  }

  const register = async (data, userType = 'patient') => {
    try {
      const response = await authApi.register(data, userType)
      localStorage.setItem('token', response.token)
      setUser(response.user)
      return response
    } catch (error) {
      throw error
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('adminToken')
    setUser(null)
    // Redirect to login
    window.location.href = '/login'
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

