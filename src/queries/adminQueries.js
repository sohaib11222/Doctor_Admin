/**
 * Admin Queries
 * Query functions for admin panel endpoints
 */
import { useQuery } from '@tanstack/react-query'
import { get, getWithParams } from '../utils/api'
import { ADMIN_ROUTES } from '../utils/apiConfig'

/**
 * Get admin dashboard stats
 */
export const useAdminDashboard = () => {
  return useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: () => get(ADMIN_ROUTES.DASHBOARD),
  })
}

/**
 * Get admin profile
 */
export const useAdminProfile = () => {
  return useQuery({
    queryKey: ['admin-profile'],
    queryFn: () => get(ADMIN_ROUTES.PROFILE),
  })
}

/**
 * Get all users
 */
export const useUsers = (params = {}) => {
  return useQuery({
    queryKey: ['users', params],
    queryFn: () => getWithParams(ADMIN_ROUTES.USERS, params),
  })
}

/**
 * Get user by ID
 */
export const useUser = (userId, options = {}) => {
  return useQuery({
    queryKey: ['user', userId],
    queryFn: () => get(ADMIN_ROUTES.USER_BY_ID(userId)),
    enabled: !!userId && (options.enabled !== false),
    ...options,
  })
}

/**
 * Get user profile
 */
export const useUserProfile = () => {
  return useQuery({
    queryKey: ['user-profile'],
    queryFn: () => get(ADMIN_ROUTES.USER_PROFILE),
  })
}

/**
 * Get all doctors (admin view)
 */
export const useAdminDoctors = (params = {}) => {
  return useQuery({
    queryKey: ['admin-doctors', params],
    queryFn: () => getWithParams(ADMIN_ROUTES.DOCTORS, params),
  })
}

/**
 * Get all patients
 */
export const useAdminPatients = (params = {}) => {
  return useQuery({
    queryKey: ['admin-patients', params],
    queryFn: () => getWithParams(ADMIN_ROUTES.PATIENTS, params),
  })
}

/**
 * Get all appointments
 */
export const useAdminAppointments = (params = {}) => {
  return useQuery({
    queryKey: ['admin-appointments', params],
    queryFn: () => getWithParams(ADMIN_ROUTES.APPOINTMENTS, params),
  })
}

/**
 * Get all subscription plans (admin)
 */
export const useAdminSubscriptionPlans = (params = {}) => {
  return useQuery({
    queryKey: ['admin-subscription-plans', params],
    queryFn: () => getWithParams(ADMIN_ROUTES.SUBSCRIPTION_PLANS, params),
  })
}

/**
 * Get subscription plan by ID (admin)
 */
export const useAdminSubscriptionPlan = (planId, options = {}) => {
  return useQuery({
    queryKey: ['admin-subscription-plan', planId],
    queryFn: () => get(ADMIN_ROUTES.SUBSCRIPTION_PLAN_BY_ID(planId)),
    enabled: !!planId && (options.enabled !== false),
    ...options,
  })
}

/**
 * Get all specializations (admin)
 */
export const useAdminSpecializations = () => {
  return useQuery({
    queryKey: ['admin-specializations'],
    queryFn: () => get(ADMIN_ROUTES.SPECIALIZATIONS),
  })
}

/**
 * Get all insurance companies (admin)
 */
export const useAdminInsuranceCompanies = (params = {}) => {
  return useQuery({
    queryKey: ['admin-insurance-companies', params],
    queryFn: () => getWithParams(ADMIN_ROUTES.INSURANCE_COMPANIES, params),
  })
}

/**
 * Get all products (admin view)
 */
export const useAdminProducts = (params = {}) => {
  return useQuery({
    queryKey: ['admin-products', params],
    queryFn: () => getWithParams(ADMIN_ROUTES.PRODUCTS, params),
  })
}

/**
 * Get all pharmacies (admin view)
 */
export const useAdminPharmacies = (params = {}) => {
  return useQuery({
    queryKey: ['admin-pharmacies', params],
    queryFn: () => getWithParams(ADMIN_ROUTES.PHARMACIES, params),
  })
}

/**
 * Get all reviews (admin view)
 */
export const useAdminReviews = (params = {}) => {
  return useQuery({
    queryKey: ['admin-reviews', params],
    queryFn: () => getWithParams(ADMIN_ROUTES.REVIEWS, params),
  })
}

/**
 * Get all transactions
 */
export const useAdminTransactions = (params = {}) => {
  return useQuery({
    queryKey: ['admin-transactions', params],
    queryFn: () => getWithParams(ADMIN_ROUTES.TRANSACTIONS, params),
  })
}

/**
 * Get all orders
 */
export const useAdminOrders = (params = {}) => {
  return useQuery({
    queryKey: ['admin-orders', params],
    queryFn: () => getWithParams(ADMIN_ROUTES.ORDERS, params),
  })
}

/**
 * Get order by ID
 */
export const useAdminOrder = (orderId, options = {}) => {
  return useQuery({
    queryKey: ['admin-order', orderId],
    queryFn: () => get(ADMIN_ROUTES.ORDER_BY_ID(orderId)),
    enabled: !!orderId && (options.enabled !== false),
    ...options,
  })
}

/**
 * Get all announcements
 */
export const useAdminAnnouncements = (params = {}) => {
  return useQuery({
    queryKey: ['admin-announcements', params],
    queryFn: () => getWithParams(ADMIN_ROUTES.ANNOUNCEMENTS, params),
  })
}

/**
 * Get announcement by ID
 */
export const useAdminAnnouncement = (announcementId, options = {}) => {
  return useQuery({
    queryKey: ['admin-announcement', announcementId],
    queryFn: () => get(ADMIN_ROUTES.ANNOUNCEMENT_BY_ID(announcementId)),
    enabled: !!announcementId && (options.enabled !== false),
    ...options,
  })
}

/**
 * Get announcement read status
 */
export const useAnnouncementReadStatus = (announcementId, options = {}) => {
  return useQuery({
    queryKey: ['announcement-read-status', announcementId],
    queryFn: () => get(ADMIN_ROUTES.ANNOUNCEMENT_READ_STATUS(announcementId)),
    enabled: !!announcementId && (options.enabled !== false),
    ...options,
  })
}

/**
 * Get all chat conversations
 */
export const useAdminChatConversations = () => {
  return useQuery({
    queryKey: ['admin-chat-conversations'],
    queryFn: () => get(ADMIN_ROUTES.CHAT_CONVERSATIONS),
  })
}

/**
 * Get doctors for chat panel with unread message counts
 */
export const useDoctorsForChat = (params = {}) => {
  return useQuery({
    queryKey: ['doctors-for-chat', params],
    queryFn: () => getWithParams(ADMIN_ROUTES.DOCTORS_CHAT, params),
  })
}

/**
 * Get unread message count
 */
export const useChatUnreadCount = () => {
  return useQuery({
    queryKey: ['chat-unread-count'],
    queryFn: () => get(ADMIN_ROUTES.CHAT_UNREAD_COUNT),
  })
}

/**
 * Get chat messages
 */
export const useChatMessages = (conversationId, options = {}) => {
  return useQuery({
    queryKey: ['chat-messages', conversationId],
    queryFn: () => get(ADMIN_ROUTES.CHAT_MESSAGES(conversationId)),
    enabled: !!conversationId && (options.enabled !== false),
    ...options,
  })
}

/**
 * Get system activity
 */
export const useSystemActivity = (params = {}) => {
  return useQuery({
    queryKey: ['system-activity', params],
    queryFn: () => getWithParams(ADMIN_ROUTES.ACTIVITY, params),
  })
}

/**
 * Get withdrawal requests
 */
export const useWithdrawalRequests = (params = {}) => {
  return useQuery({
    queryKey: ['withdrawal-requests', params],
    queryFn: () => getWithParams(ADMIN_ROUTES.WITHDRAWAL_REQUESTS, params),
  })
}
