/**
 * Doctor Mutations
 * Mutation functions for doctor panel endpoints
 */
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { post, put, del } from '../utils/api'
import { DOCTOR_ROUTES } from '../utils/apiConfig'

/**
 * Update doctor profile mutation
 */
export const useUpdateDoctorProfile = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data) => put(DOCTOR_ROUTES.PROFILE, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctor-profile'] })
    },
  })
}

/**
 * Buy subscription mutation
 */
export const useBuySubscription = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data) => post(DOCTOR_ROUTES.BUY_SUBSCRIPTION, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-subscription'] })
    },
  })
}

/**
 * Set availability mutation
 */
export const useSetAvailability = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data) => post(DOCTOR_ROUTES.AVAILABILITY, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['availability'] })
      queryClient.invalidateQueries({ queryKey: ['available-slots'] })
    },
  })
}

/**
 * Create/Update weekly schedule mutation
 */
export const useUpdateWeeklySchedule = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data) => post(DOCTOR_ROUTES.WEEKLY_SCHEDULE, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['weekly-schedule'] })
      queryClient.invalidateQueries({ queryKey: ['weekly-schedule-slots'] })
    },
  })
}

/**
 * Update appointment duration mutation
 */
export const useUpdateAppointmentDuration = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data) => put(DOCTOR_ROUTES.WEEKLY_SCHEDULE_DURATION, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['weekly-schedule'] })
    },
  })
}

/**
 * Add time slot to day mutation
 */
export const useAddTimeSlot = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ dayOfWeek, data }) => post(DOCTOR_ROUTES.WEEKLY_SCHEDULE_DAY_SLOT(dayOfWeek), data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['weekly-schedule'] })
      queryClient.invalidateQueries({ queryKey: ['weekly-schedule-slots'] })
    },
  })
}

/**
 * Update time slot mutation
 */
export const useUpdateTimeSlot = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ dayOfWeek, slotId, data }) => put(DOCTOR_ROUTES.WEEKLY_SCHEDULE_DAY_SLOT_BY_ID(dayOfWeek, slotId), data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['weekly-schedule'] })
      queryClient.invalidateQueries({ queryKey: ['weekly-schedule-slots'] })
    },
  })
}

/**
 * Delete time slot mutation
 */
export const useDeleteTimeSlot = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ dayOfWeek, slotId }) => del(DOCTOR_ROUTES.WEEKLY_SCHEDULE_DAY_SLOT_BY_ID(dayOfWeek, slotId)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['weekly-schedule'] })
      queryClient.invalidateQueries({ queryKey: ['weekly-schedule-slots'] })
    },
  })
}

/**
 * Accept appointment mutation
 */
export const useAcceptAppointment = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (appointmentId) => post(DOCTOR_ROUTES.APPOINTMENT_ACCEPT(appointmentId)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctor-appointments'] })
      queryClient.invalidateQueries({ queryKey: ['doctor-appointment'] })
      queryClient.invalidateQueries({ queryKey: ['admin-appointments'] })
    },
  })
}

/**
 * Reject appointment mutation
 */
export const useRejectAppointment = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ appointmentId, data }) => post(DOCTOR_ROUTES.APPOINTMENT_REJECT(appointmentId), data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctor-appointments'] })
      queryClient.invalidateQueries({ queryKey: ['doctor-appointment'] })
      queryClient.invalidateQueries({ queryKey: ['admin-appointments'] })
    },
  })
}

/**
 * Update appointment status mutation
 */
export const useUpdateAppointmentStatus = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ appointmentId, data }) => put(DOCTOR_ROUTES.APPOINTMENT_STATUS(appointmentId), data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctor-appointments'] })
      queryClient.invalidateQueries({ queryKey: ['doctor-appointment'] })
      queryClient.invalidateQueries({ queryKey: ['admin-appointments'] })
      queryClient.invalidateQueries({ queryKey: ['patient-appointments'] })
    },
  })
}

/**
 * Create product mutation (doctor)
 */
export const useCreateDoctorProduct = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data) => post(DOCTOR_ROUTES.PRODUCTS, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctor-products'] })
      queryClient.invalidateQueries({ queryKey: ['products'] })
    },
  })
}

/**
 * Update product mutation (doctor)
 */
export const useUpdateDoctorProduct = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ productId, data }) => put(DOCTOR_ROUTES.PRODUCT_BY_ID(productId), data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctor-products'] })
      queryClient.invalidateQueries({ queryKey: ['doctor-product'] })
      queryClient.invalidateQueries({ queryKey: ['products'] })
    },
  })
}

/**
 * Delete product mutation (doctor)
 */
export const useDeleteDoctorProduct = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (productId) => del(DOCTOR_ROUTES.PRODUCT_BY_ID(productId)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctor-products'] })
      queryClient.invalidateQueries({ queryKey: ['products'] })
    },
  })
}

/**
 * Start conversation with admin mutation
 */
export const useStartConversationWithAdmin = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data) => post(DOCTOR_ROUTES.CHAT_CONVERSATION, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctor-chat-conversations'] })
    },
  })
}

/**
 * Send message to admin mutation
 */
export const useSendMessageToAdmin = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data) => post(DOCTOR_ROUTES.CHAT_SEND, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctor-chat-messages'] })
      queryClient.invalidateQueries({ queryKey: ['doctor-chat-conversations'] })
      queryClient.invalidateQueries({ queryKey: ['doctor-chat-unread-count'] })
    },
  })
}

/**
 * Start conversation with patient mutation
 */
export const useStartConversationWithPatient = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data) => post(DOCTOR_ROUTES.CHAT_CONVERSATION, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctor-chat-conversations'] })
    },
  })
}

/**
 * Send message to patient mutation
 */
export const useSendMessageToPatient = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data) => post(DOCTOR_ROUTES.CHAT_SEND, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctor-chat-messages'] })
      queryClient.invalidateQueries({ queryKey: ['doctor-chat-conversations'] })
      queryClient.invalidateQueries({ queryKey: ['doctor-chat-unread-count'] })
    },
  })
}

/**
 * Mark messages as read mutation
 */
export const useMarkDoctorMessagesAsRead = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (conversationId) => put(DOCTOR_ROUTES.CHAT_MARK_READ(conversationId)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctor-chat-messages'] })
      queryClient.invalidateQueries({ queryKey: ['doctor-chat-unread-count'] })
    },
  })
}

/**
 * Start video session mutation
 */
export const useStartVideoSession = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data) => post(DOCTOR_ROUTES.VIDEO_START, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['video-session'] })
    },
  })
}

/**
 * End video session mutation
 */
export const useEndVideoSession = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data) => post(DOCTOR_ROUTES.VIDEO_END, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['video-session'] })
    },
  })
}

/**
 * Mark announcement as read mutation
 */
export const useMarkAnnouncementAsRead = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (announcementId) => post(DOCTOR_ROUTES.ANNOUNCEMENT_READ(announcementId)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctor-announcements'] })
      queryClient.invalidateQueries({ queryKey: ['doctor-unread-announcement-count'] })
    },
  })
}

/**
 * Create blog post mutation (doctor)
 */
export const useCreateDoctorBlogPost = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data) => post(DOCTOR_ROUTES.BLOG, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctor-blog-posts'] })
      queryClient.invalidateQueries({ queryKey: ['blog-posts'] })
    },
  })
}

/**
 * Update blog post mutation (doctor)
 */
export const useUpdateDoctorBlogPost = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ blogId, data }) => put(DOCTOR_ROUTES.BLOG_BY_ID(blogId), data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctor-blog-posts'] })
      queryClient.invalidateQueries({ queryKey: ['doctor-blog-post'] })
      queryClient.invalidateQueries({ queryKey: ['blog-posts'] })
    },
  })
}

/**
 * Delete blog post mutation (doctor)
 */
export const useDeleteDoctorBlogPost = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (blogId) => del(DOCTOR_ROUTES.BLOG_BY_ID(blogId)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctor-blog-posts'] })
      queryClient.invalidateQueries({ queryKey: ['blog-posts'] })
    },
  })
}

/**
 * Mark notification as read mutation (doctor)
 */
export const useMarkDoctorNotificationAsRead = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (notificationId) => put(DOCTOR_ROUTES.NOTIFICATION_READ(notificationId)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctor-notifications'] })
    },
  })
}

