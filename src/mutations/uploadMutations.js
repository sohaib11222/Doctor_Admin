/**
 * Upload Mutations
 * Mutation functions for file upload endpoints
 */
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { uploadFile } from '../utils/api'
import { UPLOAD_ROUTES } from '../utils/apiConfig'

/**
 * Upload profile image mutation
 */
export const useUploadProfileImage = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (formData) => uploadFile(UPLOAD_ROUTES.PROFILE, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-profile'] })
      queryClient.invalidateQueries({ queryKey: ['user-profile'] })
      queryClient.invalidateQueries({ queryKey: ['doctor-profile'] })
      queryClient.invalidateQueries({ queryKey: ['patient-user'] })
    },
  })
}

/**
 * Upload doctor documents mutation
 */
export const useUploadDoctorDocs = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (formData) => uploadFile(UPLOAD_ROUTES.DOCTOR_DOCS, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctor-profile'] })
    },
  })
}

/**
 * Upload clinic images mutation
 */
export const useUploadClinicImages = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (formData) => uploadFile(UPLOAD_ROUTES.CLINIC, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctor-profile'] })
    },
  })
}

/**
 * Upload product images mutation
 */
export const useUploadProductImages = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (formData) => uploadFile(UPLOAD_ROUTES.PRODUCT, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      queryClient.invalidateQueries({ queryKey: ['doctor-products'] })
      queryClient.invalidateQueries({ queryKey: ['product'] })
    },
  })
}

/**
 * Upload blog cover image mutation
 */
export const useUploadBlogCover = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (formData) => uploadFile(UPLOAD_ROUTES.BLOG, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blog-posts'] })
      queryClient.invalidateQueries({ queryKey: ['doctor-blog-posts'] })
    },
  })
}

/**
 * Upload general image mutation
 */
export const useUploadGeneralImage = () => {
  return useMutation({
    mutationFn: (formData) => uploadFile(UPLOAD_ROUTES.GENERAL, formData),
  })
}

/**
 * Upload chat file mutation (supports all file types)
 */
export const useUploadChatFile = () => {
  return useMutation({
    mutationFn: (formData) => uploadFile(UPLOAD_ROUTES.CHAT, formData),
  })
}

/**
 * Upload multiple chat files mutation
 */
export const useUploadChatFiles = () => {
  return useMutation({
    mutationFn: (formData) => uploadFile(UPLOAD_ROUTES.CHAT_MULTIPLE, formData),
  })
}
