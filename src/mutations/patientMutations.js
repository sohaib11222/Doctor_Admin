/**
 * Patient Mutations
 * Mutation functions for patient panel endpoints
 */
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { post, put, del } from '../utils/api'
import { PATIENT_ROUTES } from '../utils/apiConfig'

/**
 * Update patient profile mutation
 */
export const useUpdatePatientProfile = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data) => put(PATIENT_ROUTES.PROFILE, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patient-user'] })
      queryClient.invalidateQueries({ queryKey: ['user-profile'] })
    },
  })
}

/**
 * Create appointment mutation
 */
export const useCreateAppointment = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data) => post(PATIENT_ROUTES.APPOINTMENTS, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patient-appointments'] })
      queryClient.invalidateQueries({ queryKey: ['doctor-appointments'] })
      queryClient.invalidateQueries({ queryKey: ['admin-appointments'] })
      queryClient.invalidateQueries({ queryKey: ['available-slots'] })
    },
  })
}

/**
 * Cancel appointment mutation
 */
export const useCancelAppointment = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ appointmentId, data }) => post(PATIENT_ROUTES.APPOINTMENT_CANCEL(appointmentId), data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patient-appointments'] })
      queryClient.invalidateQueries({ queryKey: ['patient-appointment'] })
      queryClient.invalidateQueries({ queryKey: ['doctor-appointments'] })
      queryClient.invalidateQueries({ queryKey: ['admin-appointments'] })
      queryClient.invalidateQueries({ queryKey: ['available-slots'] })
    },
  })
}

/**
 * Create medical record mutation
 */
export const useCreateMedicalRecord = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data) => post(PATIENT_ROUTES.MEDICAL_RECORDS, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medical-records'] })
    },
  })
}

/**
 * Delete medical record mutation
 */
export const useDeleteMedicalRecord = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (recordId) => del(PATIENT_ROUTES.MEDICAL_RECORD_BY_ID(recordId)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medical-records'] })
    },
  })
}

/**
 * Process appointment payment mutation
 */
export const useProcessAppointmentPayment = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data) => post(PATIENT_ROUTES.PAYMENT_APPOINTMENT, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patient-transactions'] })
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      queryClient.invalidateQueries({ queryKey: ['payment-history'] })
      queryClient.invalidateQueries({ queryKey: ['patient-appointments'] })
    },
  })
}

/**
 * Process product payment mutation
 */
export const useProcessProductPayment = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data) => post(PATIENT_ROUTES.PAYMENT_PRODUCT, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patient-transactions'] })
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      queryClient.invalidateQueries({ queryKey: ['payment-history'] })
    },
  })
}

/**
 * Create transaction mutation
 */
export const useCreatePatientTransaction = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data) => post(PATIENT_ROUTES.TRANSACTIONS, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patient-transactions'] })
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
    },
  })
}

/**
 * Create review mutation
 */
export const useCreateReview = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data) => post(PATIENT_ROUTES.REVIEWS, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctor-reviews'] })
      queryClient.invalidateQueries({ queryKey: ['reviews'] })
      queryClient.invalidateQueries({ queryKey: ['doctor-profile'] })
    },
  })
}

/**
 * Delete review mutation
 */
export const useDeleteReview = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (reviewId) => del(PATIENT_ROUTES.REVIEW_BY_ID(reviewId)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctor-reviews'] })
      queryClient.invalidateQueries({ queryKey: ['reviews'] })
    },
  })
}

/**
 * Add favorite doctor mutation
 */
export const useAddFavoriteDoctor = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data) => post(PATIENT_ROUTES.FAVORITES, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorite-doctors'] })
    },
  })
}

/**
 * Remove favorite doctor mutation
 */
export const useRemoveFavoriteDoctor = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (favoriteId) => del(PATIENT_ROUTES.FAVORITE_BY_ID(favoriteId)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorite-doctors'] })
    },
  })
}

/**
 * Start conversation with doctor mutation
 */
export const useStartConversationWithDoctor = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data) => post(PATIENT_ROUTES.CHAT_CONVERSATION, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patient-chat-messages'] })
    },
  })
}

/**
 * Send message to doctor mutation
 */
export const useSendMessageToDoctor = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data) => post(PATIENT_ROUTES.CHAT_SEND, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patient-chat-messages'] })
    },
  })
}

/**
 * Start video session mutation (patient)
 */
export const useStartPatientVideoSession = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data) => post(PATIENT_ROUTES.VIDEO_START, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patient-video-session'] })
    },
  })
}

/**
 * Mark notification as read mutation (patient)
 */
export const useMarkPatientNotificationAsRead = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (notificationId) => put(PATIENT_ROUTES.NOTIFICATION_READ(notificationId)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patient-notifications'] })
    },
  })
}

