/**
 * Auth Mutations
 * Mutation functions for authentication-related endpoints
 */
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { post, put } from '../utils/api'
import { AUTH_ROUTES } from '../utils/apiConfig'

/**
 * Register mutation
 */
export const useRegister = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data) => post(AUTH_ROUTES.REGISTER, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })
}

/**
 * Login mutation
 */
export const useLogin = () => {
  return useMutation({
    mutationFn: (data) => post(AUTH_ROUTES.LOGIN, data),
  })
}

/**
 * Refresh token mutation
 */
export const useRefreshToken = () => {
  return useMutation({
    mutationFn: (data) => post(AUTH_ROUTES.REFRESH_TOKEN, data),
  })
}

/**
 * Change password mutation
 */
export const useChangePassword = () => {
  return useMutation({
    mutationFn: (data) => post(AUTH_ROUTES.CHANGE_PASSWORD, data),
  })
}

/**
 * Approve doctor mutation
 */
export const useApproveDoctor = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data) => post(AUTH_ROUTES.APPROVE_DOCTOR, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-doctors'] })
      queryClient.invalidateQueries({ queryKey: ['doctors'] })
    },
  })
}

