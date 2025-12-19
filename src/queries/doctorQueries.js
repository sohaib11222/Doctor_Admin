/**
 * Doctor Queries
 * Query functions for doctor panel endpoints
 */
import { useQuery } from '@tanstack/react-query'
import { get, getWithParams } from '../utils/api'
import { DOCTOR_ROUTES } from '../utils/apiConfig'

/**
 * Get doctor profile
 */
export const useDoctorProfile = (doctorId, options = {}) => {
  return useQuery({
    queryKey: ['doctor-profile', doctorId],
    queryFn: () => get(DOCTOR_ROUTES.PROFILE_BY_ID(doctorId)),
    enabled: !!doctorId && (options.enabled !== false),
    ...options,
  })
}

/**
 * Get doctor dashboard
 */
export const useDoctorDashboard = () => {
  return useQuery({
    queryKey: ['doctor-dashboard'],
    queryFn: () => get(DOCTOR_ROUTES.DASHBOARD),
  })
}

/**
 * Get doctor reviews
 */
export const useDoctorReviews = (params = {}) => {
  return useQuery({
    queryKey: ['doctor-reviews', params],
    queryFn: () => getWithParams(DOCTOR_ROUTES.REVIEWS, params),
  })
}

/**
 * Get my subscription
 */
export const useMySubscription = () => {
  return useQuery({
    queryKey: ['my-subscription'],
    queryFn: () => get(DOCTOR_ROUTES.MY_SUBSCRIPTION),
  })
}

/**
 * Get availability
 */
export const useAvailability = (params = {}) => {
  return useQuery({
    queryKey: ['availability', params],
    queryFn: () => getWithParams(DOCTOR_ROUTES.AVAILABILITY, params),
    enabled: !!(params.fromDate && params.toDate),
  })
}

/**
 * Get weekly schedule
 */
export const useWeeklySchedule = () => {
  return useQuery({
    queryKey: ['weekly-schedule'],
    queryFn: () => get(DOCTOR_ROUTES.WEEKLY_SCHEDULE),
  })
}

/**
 * Get available slots for date
 */
export const useWeeklyScheduleSlots = (params = {}) => {
  return useQuery({
    queryKey: ['weekly-schedule-slots', params],
    queryFn: () => getWithParams(DOCTOR_ROUTES.WEEKLY_SCHEDULE_SLOTS, params),
    enabled: !!(params.doctorId && params.date),
  })
}

/**
 * Get doctor appointments
 */
export const useDoctorAppointments = (doctorId, params = {}) => {
  return useQuery({
    queryKey: ['doctor-appointments', doctorId, params],
    queryFn: () => getWithParams(DOCTOR_ROUTES.APPOINTMENTS, { doctorId, ...params }),
    enabled: !!doctorId,
  })
}

/**
 * Get appointment by ID
 */
export const useDoctorAppointment = (appointmentId, options = {}) => {
  return useQuery({
    queryKey: ['doctor-appointment', appointmentId],
    queryFn: () => get(DOCTOR_ROUTES.APPOINTMENT_BY_ID(appointmentId)),
    enabled: !!appointmentId && (options.enabled !== false),
    ...options,
  })
}

/**
 * Get doctor products
 */
export const useDoctorProducts = (params = {}) => {
  return useQuery({
    queryKey: ['doctor-products', params],
    queryFn: () => getWithParams(DOCTOR_ROUTES.PRODUCTS, params),
  })
}

/**
 * Get doctor product by ID
 */
export const useDoctorProduct = (productId, options = {}) => {
  return useQuery({
    queryKey: ['doctor-product', productId],
    queryFn: () => get(DOCTOR_ROUTES.PRODUCT_BY_ID(productId)),
    enabled: !!productId && (options.enabled !== false),
    ...options,
  })
}

/**
 * Get doctor chat conversations
 */
export const useDoctorChatConversations = () => {
  return useQuery({
    queryKey: ['doctor-chat-conversations'],
    queryFn: () => get(DOCTOR_ROUTES.CHAT_CONVERSATIONS),
  })
}

/**
 * Get doctor chat unread count
 */
export const useDoctorChatUnreadCount = () => {
  return useQuery({
    queryKey: ['doctor-chat-unread-count'],
    queryFn: () => get(DOCTOR_ROUTES.CHAT_UNREAD_COUNT),
  })
}

/**
 * Get doctor chat messages
 */
export const useDoctorChatMessages = (conversationId, options = {}) => {
  return useQuery({
    queryKey: ['doctor-chat-messages', conversationId],
    queryFn: () => get(DOCTOR_ROUTES.CHAT_MESSAGES(conversationId)),
    enabled: !!conversationId && (options.enabled !== false),
    ...options,
  })
}

/**
 * Get video session by appointment
 */
export const useVideoSessionByAppointment = (appointmentId, options = {}) => {
  return useQuery({
    queryKey: ['video-session', appointmentId],
    queryFn: () => get(DOCTOR_ROUTES.VIDEO_BY_APPOINTMENT(appointmentId)),
    enabled: !!appointmentId && (options.enabled !== false),
    ...options,
  })
}

/**
 * Get doctor announcements
 */
export const useDoctorAnnouncements = (params = {}) => {
  return useQuery({
    queryKey: ['doctor-announcements', params],
    queryFn: () => getWithParams(DOCTOR_ROUTES.ANNOUNCEMENTS, params),
  })
}

/**
 * Get unread announcement count
 */
export const useDoctorUnreadAnnouncementCount = () => {
  return useQuery({
    queryKey: ['doctor-unread-announcement-count'],
    queryFn: () => get(DOCTOR_ROUTES.ANNOUNCEMENT_UNREAD_COUNT),
  })
}

/**
 * Get doctor announcement by ID
 */
export const useDoctorAnnouncement = (announcementId, options = {}) => {
  return useQuery({
    queryKey: ['doctor-announcement', announcementId],
    queryFn: () => get(DOCTOR_ROUTES.ANNOUNCEMENT_BY_ID(announcementId)),
    enabled: !!announcementId && (options.enabled !== false),
    ...options,
  })
}

/**
 * Get doctor blog posts
 */
export const useDoctorBlogPosts = (params = {}) => {
  return useQuery({
    queryKey: ['doctor-blog-posts', params],
    queryFn: () => getWithParams(DOCTOR_ROUTES.BLOG, params),
  })
}

/**
 * Get doctor blog post by ID
 */
export const useDoctorBlogPost = (blogId, options = {}) => {
  return useQuery({
    queryKey: ['doctor-blog-post', blogId],
    queryFn: () => get(DOCTOR_ROUTES.BLOG_BY_ID(blogId)),
    enabled: !!blogId && (options.enabled !== false),
    ...options,
  })
}

/**
 * Get doctor notifications
 */
export const useDoctorNotifications = (userId, params = {}) => {
  return useQuery({
    queryKey: ['doctor-notifications', userId, params],
    queryFn: () => getWithParams(DOCTOR_ROUTES.NOTIFICATIONS(userId), params),
    enabled: !!userId,
  })
}

