/**
 * Admin Mutations
 * Mutation functions for admin panel endpoints
 */
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { post, put, del } from '../utils/api'
import { ADMIN_ROUTES } from '../utils/apiConfig'

/**
 * Update user profile mutation
 */
export const useUpdateUserProfile = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data) => put(ADMIN_ROUTES.USER_PROFILE, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-profile'] })
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })
}

/**
 * Update user status mutation
 */
export const useUpdateUserStatus = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ userId, data }) => put(ADMIN_ROUTES.USER_STATUS(userId), data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      queryClient.invalidateQueries({ queryKey: ['admin-doctors'] })
      queryClient.invalidateQueries({ queryKey: ['admin-patients'] })
    },
  })
}

/**
 * Delete user mutation
 */
export const useDeleteUser = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (userId) => del(ADMIN_ROUTES.DELETE_USER(userId)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })
}

/**
 * Update admin profile mutation
 */
export const useUpdateAdminProfile = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data) => put(ADMIN_ROUTES.PROFILE, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-profile'] })
    },
  })
}

/**
 * Create subscription plan mutation
 */
export const useCreateSubscriptionPlan = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data) => post(ADMIN_ROUTES.SUBSCRIPTION_PLANS, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-subscription-plans'] })
      queryClient.invalidateQueries({ queryKey: ['active-subscription-plans'] })
    },
  })
}

/**
 * Create subscription plan (alternative route) mutation
 */
export const useCreateSubscriptionPlanAlt = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data) => post(ADMIN_ROUTES.SUBSCRIPTION_PLANS_ALT, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-subscription-plans'] })
      queryClient.invalidateQueries({ queryKey: ['active-subscription-plans'] })
    },
  })
}

/**
 * Update subscription plan mutation
 */
export const useUpdateSubscriptionPlan = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ planId, data }) => put(ADMIN_ROUTES.SUBSCRIPTION_PLAN_BY_ID(planId), data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-subscription-plans'] })
      queryClient.invalidateQueries({ queryKey: ['admin-subscription-plan'] })
      queryClient.invalidateQueries({ queryKey: ['active-subscription-plans'] })
    },
  })
}

/**
 * Update subscription plan (alternative route) mutation
 */
export const useUpdateSubscriptionPlanAlt = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ planId, data }) => put(ADMIN_ROUTES.SUBSCRIPTION_PLAN_BY_ID_ALT(planId), data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-subscription-plans'] })
      queryClient.invalidateQueries({ queryKey: ['active-subscription-plans'] })
    },
  })
}

/**
 * Delete subscription plan mutation
 */
export const useDeleteSubscriptionPlan = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (planId) => del(ADMIN_ROUTES.SUBSCRIPTION_PLAN_BY_ID(planId)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-subscription-plans'] })
      queryClient.invalidateQueries({ queryKey: ['active-subscription-plans'] })
    },
  })
}

/**
 * Assign subscription to doctor mutation
 */
export const useAssignSubscription = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data) => post(ADMIN_ROUTES.ASSIGN_SUBSCRIPTION, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-subscription'] })
      queryClient.invalidateQueries({ queryKey: ['admin-doctors'] })
    },
  })
}

/**
 * Create specialization mutation
 */
export const useCreateSpecialization = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data) => post('/specialization', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['specializations'] })
      queryClient.invalidateQueries({ queryKey: ['admin-specializations'] })
    },
  })
}

/**
 * Update specialization mutation
 */
export const useUpdateSpecialization = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, data }) => put(`/specialization/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['specializations'] })
      queryClient.invalidateQueries({ queryKey: ['admin-specializations'] })
    },
  })
}

/**
 * Delete specialization mutation
 */
export const useDeleteSpecialization = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id) => del(`/specialization/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['specializations'] })
      queryClient.invalidateQueries({ queryKey: ['admin-specializations'] })
    },
  })
}

/**
 * Create product mutation (admin)
 */
export const useCreateProduct = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data) => post('/products', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      queryClient.invalidateQueries({ queryKey: ['admin-products'] })
    },
  })
}

/**
 * Update product mutation (admin)
 */
export const useUpdateProduct = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ productId, data }) => put(`/products/${productId}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      queryClient.invalidateQueries({ queryKey: ['product'] })
      queryClient.invalidateQueries({ queryKey: ['admin-products'] })
    },
  })
}

/**
 * Delete product mutation (admin)
 */
export const useDeleteProduct = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (productId) => del(`/products/${productId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      queryClient.invalidateQueries({ queryKey: ['admin-products'] })
    },
  })
}

/**
 * Create pharmacy mutation
 */
export const useCreatePharmacy = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data) => post('/pharmacy', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pharmacies'] })
      queryClient.invalidateQueries({ queryKey: ['admin-pharmacies'] })
    },
  })
}

/**
 * Update pharmacy mutation
 */
export const useUpdatePharmacy = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ pharmacyId, data }) => put(`/pharmacy/${pharmacyId}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pharmacies'] })
      queryClient.invalidateQueries({ queryKey: ['pharmacy'] })
      queryClient.invalidateQueries({ queryKey: ['admin-pharmacies'] })
    },
  })
}

/**
 * Delete pharmacy mutation
 */
export const useDeletePharmacy = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (pharmacyId) => del(`/pharmacy/${pharmacyId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pharmacies'] })
      queryClient.invalidateQueries({ queryKey: ['admin-pharmacies'] })
    },
  })
}

/**
 * Send notification mutation
 */
export const useSendNotification = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data) => post(ADMIN_ROUTES.NOTIFICATIONS, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctor-notifications'] })
      queryClient.invalidateQueries({ queryKey: ['patient-notifications'] })
    },
  })
}

/**
 * Create announcement mutation
 */
export const useCreateAnnouncement = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data) => post(ADMIN_ROUTES.ANNOUNCEMENTS, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-announcements'] })
      queryClient.invalidateQueries({ queryKey: ['doctor-announcements'] })
    },
  })
}

/**
 * Update announcement mutation
 */
export const useUpdateAnnouncement = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ announcementId, data }) => put(ADMIN_ROUTES.ANNOUNCEMENT_BY_ID(announcementId), data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-announcements'] })
      queryClient.invalidateQueries({ queryKey: ['admin-announcement'] })
      queryClient.invalidateQueries({ queryKey: ['doctor-announcements'] })
    },
  })
}

/**
 * Delete announcement mutation
 */
export const useDeleteAnnouncement = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (announcementId) => del(ADMIN_ROUTES.ANNOUNCEMENT_BY_ID(announcementId)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-announcements'] })
      queryClient.invalidateQueries({ queryKey: ['doctor-announcements'] })
    },
  })
}

/**
 * Start conversation with doctor mutation
 */
export const useStartConversation = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data) => post(ADMIN_ROUTES.CHAT_CONVERSATION, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-chat-conversations'] })
    },
  })
}

/**
 * Send message to doctor mutation
 */
export const useSendMessage = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data) => post(ADMIN_ROUTES.CHAT_SEND, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['chat-messages'] })
      queryClient.invalidateQueries({ queryKey: ['admin-chat-conversations'] })
      queryClient.invalidateQueries({ queryKey: ['chat-unread-count'] })
    },
  })
}

/**
 * Mark messages as read mutation
 */
export const useMarkMessagesAsRead = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (conversationId) => put(ADMIN_ROUTES.CHAT_MARK_READ(conversationId)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat-messages'] })
      queryClient.invalidateQueries({ queryKey: ['chat-unread-count'] })
    },
  })
}

/**
 * Create blog post mutation
 */
export const useCreateBlogPost = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data) => post('/blog', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blog-posts'] })
    },
  })
}

/**
 * Update blog post mutation
 */
export const useUpdateBlogPost = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ blogId, data }) => put(`/blog/${blogId}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blog-posts'] })
      queryClient.invalidateQueries({ queryKey: ['blog-post'] })
    },
  })
}

/**
 * Delete blog post mutation
 */
export const useDeleteBlogPost = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (blogId) => del(`/blog/${blogId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blog-posts'] })
    },
  })
}

/**
 * Create transaction mutation
 */
export const useCreateTransaction = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data) => post('/transaction', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-transactions'] })
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      queryClient.invalidateQueries({ queryKey: ['patient-transactions'] })
    },
  })
}

/**
 * Update transaction status mutation
 */
export const useUpdateTransactionStatus = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ transactionId, data }) => put(`/transaction/${transactionId}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-transactions'] })
      queryClient.invalidateQueries({ queryKey: ['transaction'] })
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
    },
  })
}

/**
 * Refund transaction mutation
 */
export const useRefundTransaction = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (transactionId) => post(`/payment/refund/${transactionId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-transactions'] })
      queryClient.invalidateQueries({ queryKey: ['transaction'] })
    },
  })
}

