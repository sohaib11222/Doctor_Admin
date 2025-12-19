/**
 * Patient Queries
 * Query functions for patient panel endpoints
 */
import { useQuery } from '@tanstack/react-query'
import { get, getWithParams } from '../utils/api'
import { PATIENT_ROUTES } from '../utils/apiConfig'

/**
 * Get patient dashboard
 */
export const usePatientDashboard = () => {
  return useQuery({
    queryKey: ['patient-dashboard'],
    queryFn: () => get(PATIENT_ROUTES.DASHBOARD),
  })
}

/**
 * Get appointment history
 */
export const useAppointmentHistory = (params = {}) => {
  return useQuery({
    queryKey: ['appointment-history', params],
    queryFn: () => getWithParams(PATIENT_ROUTES.APPOINTMENT_HISTORY, params),
  })
}

/**
 * Get payment history
 */
export const usePaymentHistory = (params = {}) => {
  return useQuery({
    queryKey: ['payment-history', params],
    queryFn: () => getWithParams(PATIENT_ROUTES.PAYMENT_HISTORY, params),
  })
}

/**
 * Get user by ID
 */
export const usePatientUser = (userId, options = {}) => {
  return useQuery({
    queryKey: ['patient-user', userId],
    queryFn: () => get(PATIENT_ROUTES.USER_BY_ID(userId)),
    enabled: !!userId && (options.enabled !== false),
    ...options,
  })
}

/**
 * Get patient appointments
 */
export const usePatientAppointments = (patientId, params = {}) => {
  return useQuery({
    queryKey: ['patient-appointments', patientId, params],
    queryFn: () => getWithParams(PATIENT_ROUTES.APPOINTMENTS, { patientId, ...params }),
    enabled: !!patientId,
  })
}

/**
 * Get patient appointment by ID
 */
export const usePatientAppointment = (appointmentId, options = {}) => {
  return useQuery({
    queryKey: ['patient-appointment', appointmentId],
    queryFn: () => get(PATIENT_ROUTES.APPOINTMENT_BY_ID(appointmentId)),
    enabled: !!appointmentId && (options.enabled !== false),
    ...options,
  })
}

/**
 * Get medical records
 */
export const useMedicalRecords = (params = {}) => {
  return useQuery({
    queryKey: ['medical-records', params],
    queryFn: () => getWithParams(PATIENT_ROUTES.MEDICAL_RECORDS, params),
  })
}

/**
 * Get medical record by ID
 */
export const useMedicalRecord = (recordId, options = {}) => {
  return useQuery({
    queryKey: ['medical-record', recordId],
    queryFn: () => get(PATIENT_ROUTES.MEDICAL_RECORD_BY_ID(recordId)),
    enabled: !!recordId && (options.enabled !== false),
    ...options,
  })
}

/**
 * Get patient transactions
 */
export const usePatientTransactions = (params = {}) => {
  return useQuery({
    queryKey: ['patient-transactions', params],
    queryFn: () => getWithParams(PATIENT_ROUTES.PAYMENT_TRANSACTIONS, params),
  })
}

/**
 * Get transaction by ID (payment route)
 */
export const usePaymentTransaction = (transactionId, options = {}) => {
  return useQuery({
    queryKey: ['payment-transaction', transactionId],
    queryFn: () => get(PATIENT_ROUTES.PAYMENT_TRANSACTION_BY_ID(transactionId)),
    enabled: !!transactionId && (options.enabled !== false),
    ...options,
  })
}

/**
 * Get transaction by ID (transaction route)
 */
export const useTransaction = (transactionId, options = {}) => {
  return useQuery({
    queryKey: ['transaction', transactionId],
    queryFn: () => get(PATIENT_ROUTES.TRANSACTION_BY_ID(transactionId)),
    enabled: !!transactionId && (options.enabled !== false),
    ...options,
  })
}

/**
 * Get all transactions
 */
export const useTransactions = (params = {}) => {
  return useQuery({
    queryKey: ['transactions', params],
    queryFn: () => getWithParams(PATIENT_ROUTES.TRANSACTIONS, params),
  })
}

/**
 * Get favorite doctors
 */
export const useFavoriteDoctors = (patientId, options = {}) => {
  return useQuery({
    queryKey: ['favorite-doctors', patientId],
    queryFn: () => get(PATIENT_ROUTES.FAVORITES_BY_PATIENT(patientId)),
    enabled: !!patientId && (options.enabled !== false),
    ...options,
  })
}

/**
 * Get patient chat messages
 */
export const usePatientChatMessages = (conversationId, options = {}) => {
  return useQuery({
    queryKey: ['patient-chat-messages', conversationId],
    queryFn: () => get(PATIENT_ROUTES.CHAT_MESSAGES(conversationId)),
    enabled: !!conversationId && (options.enabled !== false),
    ...options,
  })
}

/**
 * Get video session by appointment
 */
export const usePatientVideoSession = (appointmentId, options = {}) => {
  return useQuery({
    queryKey: ['patient-video-session', appointmentId],
    queryFn: () => get(PATIENT_ROUTES.VIDEO_BY_APPOINTMENT(appointmentId)),
    enabled: !!appointmentId && (options.enabled !== false),
    ...options,
  })
}

/**
 * Get patient notifications
 */
export const usePatientNotifications = (userId, params = {}) => {
  return useQuery({
    queryKey: ['patient-notifications', userId, params],
    queryFn: () => getWithParams(PATIENT_ROUTES.NOTIFICATIONS(userId), params),
    enabled: !!userId,
  })
}

