/**
 * API Configuration
 * All API endpoints organized by modules
 */

const BASE_URL = import.meta.env.VITE_API_URL || 'https://mydoctoradmin.mydoctorplus.it/api'

// ==================== AUTH ROUTES ====================
export const AUTH_ROUTES = {
  REGISTER: '/auth/register',
  LOGIN: '/auth/login',
  REFRESH_TOKEN: '/auth/refresh-token',
  CHANGE_PASSWORD: '/auth/change-password',
  APPROVE_DOCTOR: '/auth/approve-doctor',
}

// ==================== COMMON & PUBLIC ROUTES ====================
export const COMMON_ROUTES = {
  HEALTH_CHECK: '/health',
  SPECIALIZATIONS: '/specialization',
  DOCTORS: '/doctor',
  DOCTOR_PROFILE: (id) => `/doctor/profile/${id}`,
  PRODUCTS: '/products',
  PRODUCT_BY_ID: (id) => `/products/${id}`,
  PHARMACIES: '/pharmacy',
  PHARMACY_BY_ID: (id) => `/pharmacy/${id}`,
  DOCTOR_REVIEWS: (doctorId) => `/reviews/doctor/${doctorId}`,
  REVIEWS_QUERY: '/reviews',
  BLOG: '/blog',
  BLOG_BY_ID: (id) => `/blog/${id}`,
  AVAILABILITY_SLOTS: '/availability/slots',
  AVAILABILITY_CHECK: '/availability/check',
  ROUTE: '/mapping/route',
  NEARBY_CLINICS: '/mapping/nearby',
  CLINIC_LOCATION: (id) => `/mapping/clinic/${id}`,
  ACTIVE_SUBSCRIPTION_PLANS: '/admin/subscription-plan/active',
}

// ==================== ADMIN ROUTES ====================
export const ADMIN_ROUTES = {
  DASHBOARD: '/admin/dashboard',
  PROFILE: '/admin/profile',
  ACTIVITY: '/admin/activity',
  
  // User Management
  USERS: '/users',
  USER_BY_ID: (id) => `/users/${id}`,
  USER_PROFILE: '/users/profile',
  USER_STATUS: (id) => `/admin/users/${id}/status`,
  DELETE_USER: (id) => `/admin/users/${id}`,
  
  // Doctor Management
  DOCTORS: '/admin/doctors',
  DOCTORS_CHAT: '/admin/doctors/chat',
  
  // Patient Management
  PATIENTS: '/admin/patients',
  
  // Appointment Management
  APPOINTMENTS: '/admin/appointments',
  
  // Subscription Plans
  SUBSCRIPTION_PLANS: '/admin/subscription-plan',
  SUBSCRIPTION_PLAN_BY_ID: (id) => `/admin/subscription-plan/${id}`,
  SUBSCRIPTION_PLANS_ALT: '/subscription',
  SUBSCRIPTION_PLAN_BY_ID_ALT: (id) => `/subscription/${id}`,
  ASSIGN_SUBSCRIPTION: '/subscription/assign',
  
  // Specializations
  SPECIALIZATIONS: '/admin/specializations',
  
  // Products
  PRODUCTS: '/admin/products',
  
  // Pharmacies
  PHARMACIES: '/admin/pharmacies',
  PHARMACY_BY_ID: (id) => `/pharmacy/${id}`,
  
  // Reviews
  REVIEWS: '/admin/reviews',
  
  // Transactions
  TRANSACTIONS: '/admin/transactions',
  
  // Orders
  ORDERS: '/admin/orders',
  ORDER_BY_ID: (id) => `/orders/${id}`,
  
  // Notifications
  NOTIFICATIONS: '/admin/notifications',
  
  // Announcements
  ANNOUNCEMENTS: '/announcements',
  ANNOUNCEMENT_BY_ID: (id) => `/announcements/${id}`,
  ANNOUNCEMENT_READ_STATUS: (id) => `/announcements/${id}/read-status`,
  
  // Chat
  CHAT_CONVERSATIONS: '/chat/conversations',
  CHAT_UNREAD_COUNT: '/chat/unread-count',
  CHAT_CONVERSATION: '/chat/conversation',
  CHAT_SEND: '/chat/send',
  CHAT_MESSAGES: (conversationId) => `/chat/messages/${conversationId}`,
  CHAT_MARK_READ: (conversationId) => `/chat/conversations/${conversationId}/read`,
  
  // Balance & Withdrawals
  WITHDRAWAL_REQUESTS: '/balance/withdraw/requests',
  APPROVE_WITHDRAWAL: (requestId) => `/balance/withdraw/${requestId}/approve`,
  REJECT_WITHDRAWAL: (requestId) => `/balance/withdraw/${requestId}/reject`,
}

// ==================== DOCTOR ROUTES ====================
export const DOCTOR_ROUTES = {
  PROFILE: '/doctor/profile',
  PROFILE_BY_ID: (id) => `/doctor/profile/${id}`,
  DASHBOARD: '/doctor/dashboard',
  REVIEWS: '/doctor/reviews',
  BUY_SUBSCRIPTION: '/doctor/buy-subscription',
  MY_SUBSCRIPTION: '/doctor/my-subscription',
  
  // Availability
  AVAILABILITY: '/availability',
  
  // Weekly Schedule
  WEEKLY_SCHEDULE: '/weekly-schedule',
  WEEKLY_SCHEDULE_DURATION: '/weekly-schedule/duration',
  WEEKLY_SCHEDULE_DAY_SLOT: (dayOfWeek) => `/weekly-schedule/day/${dayOfWeek}/slot`,
  WEEKLY_SCHEDULE_DAY_SLOT_BY_ID: (dayOfWeek, slotId) => `/weekly-schedule/day/${dayOfWeek}/slot/${slotId}`,
  WEEKLY_SCHEDULE_SLOTS: '/weekly-schedule/slots',
  
  // Appointments
  APPOINTMENTS: '/appointment',
  APPOINTMENT_BY_ID: (id) => `/appointment/${id}`,
  APPOINTMENT_ACCEPT: (id) => `/appointment/${id}/accept`,
  APPOINTMENT_REJECT: (id) => `/appointment/${id}/reject`,
  APPOINTMENT_STATUS: (id) => `/appointment/${id}/status`,
  
  // Products
  PRODUCTS: '/products',
  PRODUCT_BY_ID: (id) => `/products/${id}`,
  
  // Chat
  CHAT_CONVERSATIONS: '/chat/conversations',
  CHAT_UNREAD_COUNT: '/chat/unread-count',
  CHAT_CONVERSATION: '/chat/conversation',
  CHAT_SEND: '/chat/send',
  CHAT_MESSAGES: (conversationId) => `/chat/messages/${conversationId}`,
  CHAT_MARK_READ: (conversationId) => `/chat/conversations/${conversationId}/read`,
  
  // Video Sessions
  VIDEO_START: '/video/start',
  VIDEO_END: '/video/end',
  VIDEO_BY_APPOINTMENT: (appointmentId) => `/video/by-appointment/${appointmentId}`,
  
  // Announcements
  ANNOUNCEMENTS: '/announcements/doctor',
  ANNOUNCEMENT_UNREAD_COUNT: '/announcements/unread-count',
  ANNOUNCEMENT_BY_ID: (id) => `/announcements/${id}`,
  ANNOUNCEMENT_READ: (id) => `/announcements/${id}/read`,
  
  // Blog
  BLOG: '/blog',
  BLOG_BY_ID: (id) => `/blog/${id}`,
  
  // Notifications
  NOTIFICATIONS: (userId) => `/notification/${userId}`,
  NOTIFICATION_READ: (id) => `/notification/read/${id}`,
}

// ==================== PATIENT ROUTES ====================
export const PATIENT_ROUTES = {
  DASHBOARD: '/patient/dashboard',
  APPOINTMENT_HISTORY: '/patient/appointments/history',
  PAYMENT_HISTORY: '/patient/payments/history',
  
  // Profile
  PROFILE: '/users/profile',
  USER_BY_ID: (id) => `/users/${id}`,
  
  // Appointments
  APPOINTMENTS: '/appointment',
  APPOINTMENT_BY_ID: (id) => `/appointment/${id}`,
  APPOINTMENT_CANCEL: (id) => `/appointment/${id}/cancel`,
  
  // Medical Records
  MEDICAL_RECORDS: '/patient/medical-records',
  MEDICAL_RECORD_BY_ID: (id) => `/patient/medical-records/${id}`,
  
  // Payments
  PAYMENT_APPOINTMENT: '/payment/appointment',
  PAYMENT_PRODUCT: '/payment/product',
  PAYMENT_TRANSACTIONS: '/payment/transactions',
  PAYMENT_TRANSACTION_BY_ID: (id) => `/payment/transaction/${id}`,
  TRANSACTIONS: '/transaction',
  TRANSACTION_BY_ID: (id) => `/transaction/${id}`,
  
  // Reviews
  REVIEWS: '/reviews',
  REVIEW_BY_ID: (id) => `/reviews/${id}`,
  
  // Favorites
  FAVORITES: '/favorite',
  FAVORITES_BY_PATIENT: (patientId) => `/favorite/${patientId}`,
  FAVORITE_BY_ID: (id) => `/favorite/${id}`,
  
  // Chat
  CHAT_CONVERSATION: '/chat/conversation',
  CHAT_SEND: '/chat/send',
  CHAT_MESSAGES: (conversationId) => `/chat/messages/${conversationId}`,
  
  // Video Sessions
  VIDEO_START: '/video/start',
  VIDEO_BY_APPOINTMENT: (appointmentId) => `/video/by-appointment/${appointmentId}`,
  
  // Notifications
  NOTIFICATIONS: (userId) => `/notification/${userId}`,
  NOTIFICATION_READ: (id) => `/notification/read/${id}`,
}

// ==================== UPLOAD ROUTES ====================
export const UPLOAD_ROUTES = {
  PROFILE: '/upload/profile',
  DOCTOR_DOCS: '/upload/doctor-docs',
  CLINIC: '/upload/clinic',
  PRODUCT: '/upload/product',
  BLOG: '/upload/blog',
  GENERAL: '/upload/general',
}

// Export all routes in a single object
export const API_ROUTES = {
  AUTH: AUTH_ROUTES,
  COMMON: COMMON_ROUTES,
  ADMIN: ADMIN_ROUTES,
  DOCTOR: DOCTOR_ROUTES,
  PATIENT: PATIENT_ROUTES,
  UPLOAD: UPLOAD_ROUTES,
}

export default BASE_URL

