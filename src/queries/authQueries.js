/**
 * Auth Queries
 * Query functions for authentication-related endpoints
 */
import { useQuery } from '@tanstack/react-query'
import { get } from '../utils/api'
import { AUTH_ROUTES } from '../utils/apiConfig'

/**
 * Health check query
 */
export const useHealthCheck = () => {
  return useQuery({
    queryKey: ['health'],
    queryFn: () => get('/health'),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

