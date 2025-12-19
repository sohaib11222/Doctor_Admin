/**
 * Common & Public Queries
 * Query functions for public/common endpoints
 */
import { useQuery } from '@tanstack/react-query'
import { get, getWithParams } from '../utils/api'
import { COMMON_ROUTES } from '../utils/apiConfig'

/**
 * Get all specializations
 */
export const useSpecializations = () => {
  return useQuery({
    queryKey: ['specializations'],
    queryFn: () => get(COMMON_ROUTES.SPECIALIZATIONS),
  })
}

/**
 * Get all doctors (public)
 */
export const useDoctors = (params = {}) => {
  return useQuery({
    queryKey: ['doctors', params],
    queryFn: () => getWithParams(COMMON_ROUTES.DOCTORS, params),
  })
}

/**
 * Get doctor profile by ID
 */
export const useDoctorProfile = (doctorId, options = {}) => {
  return useQuery({
    queryKey: ['doctor-profile', doctorId],
    queryFn: () => get(COMMON_ROUTES.DOCTOR_PROFILE(doctorId)),
    enabled: !!doctorId && (options.enabled !== false),
    ...options,
  })
}

/**
 * Get all products (public)
 */
export const useProducts = (params = {}) => {
  return useQuery({
    queryKey: ['products', params],
    queryFn: () => getWithParams(COMMON_ROUTES.PRODUCTS, params),
  })
}

/**
 * Get product by ID
 */
export const useProduct = (productId, options = {}) => {
  return useQuery({
    queryKey: ['product', productId],
    queryFn: () => get(COMMON_ROUTES.PRODUCT_BY_ID(productId)),
    enabled: !!productId && (options.enabled !== false),
    ...options,
  })
}

/**
 * Get all pharmacies
 */
export const usePharmacies = () => {
  return useQuery({
    queryKey: ['pharmacies'],
    queryFn: () => get(COMMON_ROUTES.PHARMACIES),
  })
}

/**
 * Get pharmacy by ID
 */
export const usePharmacy = (pharmacyId, options = {}) => {
  return useQuery({
    queryKey: ['pharmacy', pharmacyId],
    queryFn: () => get(COMMON_ROUTES.PHARMACY_BY_ID(pharmacyId)),
    enabled: !!pharmacyId && (options.enabled !== false),
    ...options,
  })
}

/**
 * Get doctor reviews
 */
export const useDoctorReviews = (doctorId, params = {}) => {
  return useQuery({
    queryKey: ['doctor-reviews', doctorId, params],
    queryFn: () => getWithParams(COMMON_ROUTES.DOCTOR_REVIEWS(doctorId), params),
    enabled: !!doctorId,
  })
}

/**
 * Get reviews with query parameters
 */
export const useReviews = (params = {}) => {
  return useQuery({
    queryKey: ['reviews', params],
    queryFn: () => getWithParams(COMMON_ROUTES.REVIEWS_QUERY, params),
  })
}

/**
 * Get all blog posts
 */
export const useBlogPosts = (params = {}) => {
  return useQuery({
    queryKey: ['blog-posts', params],
    queryFn: () => getWithParams(COMMON_ROUTES.BLOG, params),
  })
}

/**
 * Get blog post by ID
 */
export const useBlogPost = (blogId, options = {}) => {
  return useQuery({
    queryKey: ['blog-post', blogId],
    queryFn: () => get(COMMON_ROUTES.BLOG_BY_ID(blogId)),
    enabled: !!blogId && (options.enabled !== false),
    ...options,
  })
}

/**
 * Get available time slots
 */
export const useAvailableSlots = (params = {}) => {
  return useQuery({
    queryKey: ['available-slots', params],
    queryFn: () => getWithParams(COMMON_ROUTES.AVAILABILITY_SLOTS, params),
    enabled: !!(params.doctorId && params.date),
  })
}

/**
 * Check time slot availability
 */
export const useCheckSlotAvailability = (params = {}) => {
  return useQuery({
    queryKey: ['check-slot', params],
    queryFn: () => getWithParams(COMMON_ROUTES.AVAILABILITY_CHECK, params),
    enabled: !!(params.doctorId && params.date && params.timeSlot),
  })
}

/**
 * Get route
 */
export const useRoute = (params = {}) => {
  return useQuery({
    queryKey: ['route', params],
    queryFn: () => getWithParams(COMMON_ROUTES.ROUTE, params),
    enabled: !!(params.from && params.to),
  })
}

/**
 * Get nearby clinics
 */
export const useNearbyClinics = (params = {}) => {
  return useQuery({
    queryKey: ['nearby-clinics', params],
    queryFn: () => getWithParams(COMMON_ROUTES.NEARBY_CLINICS, params),
    enabled: !!(params.lat && params.lng),
  })
}

/**
 * Get clinic location
 */
export const useClinicLocation = (clinicId, options = {}) => {
  return useQuery({
    queryKey: ['clinic-location', clinicId],
    queryFn: () => get(COMMON_ROUTES.CLINIC_LOCATION(clinicId)),
    enabled: !!clinicId && (options.enabled !== false),
    ...options,
  })
}

/**
 * Get active subscription plans (public)
 */
export const useActiveSubscriptionPlans = () => {
  return useQuery({
    queryKey: ['active-subscription-plans'],
    queryFn: () => get(COMMON_ROUTES.ACTIVE_SUBSCRIPTION_PLANS),
  })
}

